import { chromium, firefox } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const demoUrl = process.env.DEMO_URL || '';
const browserName = process.env.BROWSER || 'chromium';
const resultsFile = process.env.RESULTS_FILE || 'evidence/browser-results.json';
const resultKey = process.env.RESULT_KEY || (demoUrl ? `${browserName}-demo` : browserName);
const edgePath = process.env.EDGE_PATH
  || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const viewports = [320, 375, 390, 768, 1200, 1440];

const results = [];
const evidenceDir = path.resolve('evidence');
await fs.mkdir(evidenceDir, { recursive: true });
await fs.mkdir(path.dirname(resultsFile), { recursive: true });

function record(id, area, name, passed, detail = '') {
  const entry = { id, area, name, passed, detail };
  results.push(entry);
  console.log(`${passed ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ` — ${detail}` : ''}`);
}

const browserType = browserName === 'firefox' ? firefox : chromium;
const launchOptions = browserName === 'firefox' ? {} : { executablePath: edgePath };
const browser = await browserType.launch({ ...launchOptions, headless: true });
const label = browserName === 'firefox' ? 'Firefox' : 'Edge/Chromium';

try {
  for (const [index, width] of viewports.entries()) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const consoleIssues = [];

    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        consoleIssues.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => consoleIssues.push(`pageerror: ${error.message}`));

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator('img[alt="Illustration of a digital learning dashboard and progress cards"]').waitFor();

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      imageLoaded: Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
    }));
    const overflowOk = metrics.scrollWidth <= width + 1 && metrics.bodyScrollWidth <= width + 1;

    record(`T-${String(index + 1).padStart(2, '0')}`, 'Layout', `${width}px no horizontal overflow`, overflowOk,
      `scrollWidth=${metrics.scrollWidth}, body=${metrics.bodyScrollWidth}, viewport=${width}`);
    record(`T-09-${width}`, 'Media', `${width}px WebP artwork loaded`, metrics.imageLoaded);

    const anchorsOk = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="#"]')).every((anchor) => {
      const id = anchor.getAttribute('href').slice(1);
      return id === '' || Boolean(document.getElementById(id));
    }));
    record(`T-08-${width}`, 'Navigation', `${width}px anchor targets exist`, anchorsOk);

    const menuButton = page.getByRole('button', { name: /navigation menu/i });
    if (width < 768) {
      const nav = page.locator('#primary-navigation');
      const initiallyHidden = await nav.isHidden();
      await menuButton.click();
      const opened = await menuButton.getAttribute('aria-expanded') === 'true' && await nav.isVisible();
      await page.keyboard.press('Escape');
      const closedByEscape = await menuButton.getAttribute('aria-expanded') === 'false';
      await menuButton.click();
      await page.locator('#primary-navigation').getByRole('link', { name: 'Programs', exact: true }).click();
      const closedByChoice = await menuButton.getAttribute('aria-expanded') === 'false';
      record('T-07', 'Navigation', `${label} ${width}px mobile menu keyboard behaviour`,
        initiallyHidden && opened && closedByEscape && closedByChoice,
        `initialHidden=${initiallyHidden}, opened=${opened}, escape=${closedByEscape}, choice=${closedByChoice}`);
    } else {
      const navVisible = await page.locator('#primary-navigation').isVisible();
      const buttonHidden = await menuButton.isHidden();
      record('T-07', 'Navigation', `${label} ${width}px desktop navigation`, navVisible && buttonHidden);
    }

    const focusPage = await browser.newPage({ viewport: { width, height: 900 } });
    await focusPage.goto(baseUrl, { waitUntil: 'networkidle' });
    await focusPage.keyboard.press('Tab');
    const skipFocused = await focusPage.evaluate(() => document.activeElement?.classList.contains('skipLink'));
    record('T-15', 'Accessibility', `${label} ${width}px skip link is first focus`, skipFocused);
    await focusPage.close();

    await page.screenshot({ path: path.join(evidenceDir, `viewport-${width}.png`), fullPage: true });
    record(`T-17-${width}`, 'Browsers', `${label} ${width}px console clean`, consoleIssues.length === 0,
      consoleIssues.slice(0, 3).join(' | '));
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('form').scrollIntoViewIfNeeded();

  await page.getByRole('button', { name: 'Send enquiry' }).click();
  const emptyErrors = await page.locator('[role="alert"]').allTextContents();
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  const requiredMessages = ['Name required', 'Enter a valid email address', 'Select a program', 'Consent is required'];
  const allRequiredShown = requiredMessages.every((message) => emptyErrors.some((text) => text.includes(message)));
  record('T-10', 'Registration', 'Empty fields show accessible errors', allRequiredShown && focusedId === 'fullName',
    `focus=${focusedId}`);

  await page.locator('#fullName').fill('Test Learner');
  await page.locator('#email').fill('not-an-email');
  await page.locator('#program').selectOption('Digital Foundations');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  const emailBlocked = await page.locator('#email-error').isVisible()
    && await page.locator('#email').getAttribute('aria-invalid') === 'true';
  record('T-11', 'Registration', 'Invalid email blocks submission', emailBlocked);

  await page.locator('#email').fill('learner@example.com');
  await page.locator('#consent').uncheck();
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  record('T-12', 'Registration', 'Consent is required', await page.locator('#consent-error').isVisible());

  await page.locator('#consent').check();
  await page.route('**/api/register', (route) => route.fulfill({
    status: 422,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'invalid_fields' }),
  }));
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  let validationErrorShown = true;
  try {
    await page.getByText('Please check your details and try again.').waitFor({ timeout: 5000 });
  } catch {
    validationErrorShown = false;
  }
  record('T-13a', 'Registration', 'API 422 shows clear error', validationErrorShown);
  await page.unroute('**/api/register');

  await page.route('**/api/register', (route) => route.abort('failed'));
  await page.locator('#fullName').fill('Test Learner');
  await page.locator('#email').fill('learner@example.com');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  let networkErrorShown = true;
  try {
    await page.getByText(/could not connect to the registration service/i).waitFor({ timeout: 5000 });
  } catch {
    networkErrorShown = false;
  }
  record('T-14', 'Registration', 'API offline shows clear error without crash', networkErrorShown);
  await page.unroute('**/api/register');

  await page.locator('#fullName').fill('Test Learner');
  await page.locator('#email').fill('learner@example.com');
  await page.locator('#program').selectOption('Career Skills Lab');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  try {
    await page.getByText('Thanks — your enquiry has been received.').waitFor({ timeout: 10000 });
    record('T-13', 'Registration', 'Valid form posts to local API and confirms', true);
  } catch {
    record('T-13', 'Registration', 'Valid form posts to local API and confirms', false, 'Success message not shown');
  }
  await page.close();

  if (demoUrl) {
    const demoPage = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await demoPage.goto(demoUrl, { waitUntil: 'networkidle' });
    await demoPage.locator('form').scrollIntoViewIfNeeded();
    await demoPage.locator('#fullName').fill('Demo Learner');
    await demoPage.locator('#email').fill('demo@example.com');
    await demoPage.locator('#program').selectOption('Project Portfolio');
    await demoPage.locator('#consent').check();
    await demoPage.getByRole('button', { name: 'Send enquiry' }).click();
    const demoMessage = await demoPage.getByText(/demo mode, so your enquiry was not transmitted/i).isVisible();
    const falseSuccess = await demoPage.getByText('Thanks — your enquiry has been received.').isVisible();
    record('T-19', 'Registration', 'Production demo mode does not claim submission', demoMessage && !falseSuccess);
    await demoPage.close();
  }
} finally {
  await browser.close();
}

let report = {};
try {
  const existing = await fs.readFile(resultsFile, 'utf8');
  const parsed = JSON.parse(existing);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    report = parsed;
  }
} catch {
  report = {};
}

report[resultKey] = {
  label,
  baseUrl,
  demoUrl,
  generatedAt: new Date().toISOString(),
  results,
};

await fs.writeFile(resultsFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const failed = results.filter((entry) => !entry.passed);
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Results: ${resultsFile} (${resultKey})`);
if (failed.length > 0) {
  process.exitCode = 1;
}
