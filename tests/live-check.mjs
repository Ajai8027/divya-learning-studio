import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const url = process.env.LIVE_URL || 'https://divya-learning-studio.vercel.app';
const edgePath = process.env.EDGE_PATH
  || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const evidenceDir = path.resolve('evidence');
await fs.mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
const consoleIssues = [];
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    consoleIssues.push(`${message.type()}: ${message.text()}`);
  }
});
page.on('pageerror', (error) => consoleIssues.push(`pageerror: ${error.message}`));

const results = [];
function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

try {
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  record('Live site responds', response?.ok() === true, `status=${response?.status()}`);
  record('Live console clean', consoleIssues.length === 0, consoleIssues.slice(0, 3).join(' | '));

  await page.locator('form').scrollIntoViewIfNeeded();
  await page.locator('#fullName').fill('Live Check');
  await page.locator('#email').fill('live@example.com');
  await page.locator('#program').selectOption('Digital Foundations');
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Send enquiry' }).click();

  let demoMessage = true;
  try {
    await page.getByText(/demo mode, so your enquiry was not transmitted/i).waitFor({ timeout: 10000 });
  } catch {
    demoMessage = false;
  }
  const falseSuccess = await page.getByText('Thanks — your enquiry has been received.').isVisible();
  record('Live form uses demo mode without claiming submission', demoMessage && !falseSuccess);

  await page.screenshot({ path: path.join(evidenceDir, 'live-390.png'), fullPage: true });
} finally {
  await browser.close();
}

await fs.writeFile('evidence/live-check-results.json', `${JSON.stringify(results, null, 2)}\n`, 'utf8');
if (results.some((entry) => !entry.passed)) {
  process.exitCode = 1;
}
