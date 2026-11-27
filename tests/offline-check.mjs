import { chromium, firefox } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pageUrl = pathToFileURL(path.resolve('index.html')).href;
const edgePath = process.env.EDGE_PATH
  || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const viewports = [320, 375, 390, 768, 1200, 1440];
const evidenceDir = path.resolve('evidence');
const altText = 'Illustration of a digital learning dashboard and progress cards';

await fs.mkdir(evidenceDir, { recursive: true });

const browsers = [
  { name: 'edge-chromium', type: chromium, options: { executablePath: edgePath } },
  { name: 'firefox', type: firefox, options: {} },
];
const report = {};

for (const browserEntry of browsers) {
  const results = [];
  const record = (id, name, passed, detail = '') => {
    results.push({ id, name, passed, detail });
    console.log(`${passed ? 'PASS' : 'FAIL'} ${browserEntry.name} ${id} ${name}${detail ? ` — ${detail}` : ''}`);
  };

  let browser;
  try {
    browser = await browserEntry.type.launch({ ...browserEntry.options, headless: true });
  } catch (error) {
    record('T-21', 'Browser launch', false, error.message);
    report[browserEntry.name] = results;
    continue;
  }

  for (const [index, width] of viewports.entries()) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const consoleIssues = [];
    const networkRequests = [];

    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        consoleIssues.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => consoleIssues.push(`pageerror: ${error.message}`));
    page.on('request', (request) => {
      if (/^https?:/i.test(request.url())) {
        networkRequests.push(request.url());
      }
    });

    await page.goto(pageUrl, { waitUntil: 'load' });
    const image = page.locator(`img[alt="${altText}"]`);
    await image.waitFor();

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    }));
    const imageLoaded = await image.evaluate((element) => element.complete && element.naturalWidth > 0);

    record(`T-0${index + 1}`, `${width}px no horizontal overflow`,
      metrics.scrollWidth <= width + 1 && metrics.bodyScrollWidth <= width + 1,
      `scrollWidth=${metrics.scrollWidth}, body=${metrics.bodyScrollWidth}`);
    record(`T-09-${width}`, `${width}px inlined WebP loaded`, imageLoaded);
    record(`T-17-${width}`, `${width}px console clean`, consoleIssues.length === 0,
      consoleIssues.slice(0, 2).join(' | '));
    record(`T-21-${width}`, `${width}px no network requests`, networkRequests.length === 0,
      networkRequests.slice(0, 2).join(' | '));

    await page.screenshot({ path: path.join(evidenceDir, `offline-${browserEntry.name}-${width}.png`), fullPage: true });
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.goto(pageUrl, { waitUntil: 'load' });

  const menuButton = page.getByRole('button', { name: /navigation menu/i });
  await menuButton.click();
  const menuOpen = await menuButton.getAttribute('aria-expanded') === 'true';
  await page.keyboard.press('Escape');
  const menuClosed = await menuButton.getAttribute('aria-expanded') === 'false';
  record('T-07', 'Mobile menu works offline', menuOpen && menuClosed);

  await page.locator('form').scrollIntoViewIfNeeded();
  await page.locator('#fullName').fill('Offline Learner');
  await page.locator('#email').fill('offline@example.com');
  await page.locator('#program').selectOption('Digital Foundations');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Send enquiry' }).click();

  let demoMessage = true;
  try {
    await page.getByText(/demo mode, so your enquiry was not transmitted/i).waitFor({ timeout: 5000 });
  } catch {
    demoMessage = false;
  }
  const falseSuccess = await page.getByText('Thanks — your enquiry has been received.').isVisible();
  record('T-22', 'Offline form uses demo mode without claiming submission', demoMessage && !falseSuccess);

  await page.close();
  await browser.close();
  report[browserEntry.name] = results;
}

await fs.writeFile('evidence/offline-check-results.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const allResults = Object.values(report).flat();
const failed = allResults.filter((entry) => !entry.passed);
console.log(`\n${allResults.length - failed.length}/${allResults.length} offline checks passed. Results: evidence/offline-check-results.json`);
if (failed.length > 0) {
  process.exitCode = 1;
}
