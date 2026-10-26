// Run after npm run build. Point PLAYWRIGHT_MODULE at an installed Playwright
// package; this smoke suite intentionally adds no application dependency.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('dist');
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let path = resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
  if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  try {
    const body = await readFile(path);
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(path)] || 'application/octet-stream');
    response.end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  const context = await browser.newContext();
  // External fonts are excluded so the suite works without internet access.
  await context.route('https://**/*', route => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const chart = '/square-root-curve-chart/';
  await page.goto(base + chart);
  await page.locator('#lookup-score').waitFor({ state: 'visible' });
  for (const [score, expected] of [['0', '0%'], ['100', '100%'], ['66', '81.2%'], ['72', '84.9%'], ['77', '87.7%'], ['86', '92.7%'], ['64.5', '80.3%']]) {
    await page.locator('#lookup-score').fill(score);
    assert.equal(await page.locator('#lookup-result').textContent(), expected);
  }
  for (const invalid of ['', '-1', '101']) {
    await page.locator('#lookup-score').fill(invalid);
    assert.equal(await page.locator('#lookup-score').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#lookup-result').textContent(), '—');
  }
  await page.locator('#lookup-score').fill('72');
  await page.locator('#lookup-score').focus();
  await page.keyboard.press('ArrowUp');
  assert.equal(await page.locator('#lookup-result').textContent(), '85.4%');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#table-filter').evaluate(node => node === document.activeElement), true);
  await page.locator('#table-filter').fill('72');
  assert.equal(await page.locator('#score-table tbody tr:visible').count(), 1);
  assert.match(await page.locator('#filter-status').textContent(), /^1 score shown/);
  await page.locator('#table-filter').fill('999');
  assert.equal(await page.locator('#score-table tbody tr:visible').count(), 0);
  assert.equal(await page.locator('#filter-empty').isVisible(), true);
  await page.locator('#table-filter').fill('7');
  assert.equal(await page.locator('#score-table tbody tr:visible').count(), 19);
  await page.evaluate(() => { window.printCalls = 0; window.print = () => window.printCalls++; });
  await page.locator('.print-chart').click();
  await page.locator('.download-pdf').click();
  assert.equal(await page.evaluate(() => window.printCalls), 2);
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.chart-table-desktop').isVisible(), true);
  assert.equal(await page.locator('.score-reference').isVisible(), false);
  assert.equal(await page.locator('.chart-table-desktop .chart-raw:visible').count(), 101);
  await page.emulateMedia({ media: 'screen' });
  await page.locator('#table-filter').fill('');
  assert.equal(await page.locator('#score-table tbody tr:visible').count(), 101);

  for (const route of ['/', chart, '/grade-curve-calculator/']) {
    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      assert.ok(dimensions.content <= dimensions.viewport, `${route} at ${width}px: ${JSON.stringify(dimensions)}`);
    }
  }
  if (process.env.QA_SCREENSHOT_DIR) {
    await mkdir(process.env.QA_SCREENSHOT_DIR, { recursive: true });
    await page.goto(base + chart);
    await page.screenshot({ path: resolve(process.env.QA_SCREENSHOT_DIR, 'reference-desktop.png') });
    await page.setViewportSize({ width: 375, height: 900 });
    await page.screenshot({ path: resolve(process.env.QA_SCREENSHOT_DIR, 'reference-mobile.png') });
  }

  await page.goto(base + '/');
  await page.locator('#raw-score').fill('72');
  assert.equal((await page.locator('#curved-score').textContent()).trim(), '84.9%');
  assert.equal(await page.locator('#graph-current-label').textContent(), '72 → 84.9');
  await page.locator('#target-curved-score').fill('90');
  assert.equal((await page.locator('#required-raw-score').textContent()).trim(), '81%');
  await page.locator('#points-earned').fill('36');
  assert.equal((await page.locator('#points-curved-score').textContent()).trim(), '84.9%');
  await page.locator('#class-raw-scores').fill('64,81,49');
  assert.equal(await page.locator('#class-results-body tr').count(), 3);
  assert.equal(await page.locator('#class-curved-average').textContent(), '80%');
  await page.goto(base + '/grade-curve-calculator/');
  await page.locator('#comparison-raw').fill('64');
  assert.equal(await page.locator('#square-root-result').textContent(), '80%');
  assert.equal(await page.locator('#flat-result').textContent(), '69%');
  await page.locator('#comparison-highest').fill('80');
  assert.equal(await page.locator('#scale-result').textContent(), '80%');
  assert.equal(await page.locator('#gap-result').textContent(), '84%');
  assert.deepEqual(errors, []);

  const noJS = await browser.newContext({ javaScriptEnabled: false });
  await noJS.route('https://**/*', route => route.abort());
  const staticPage = await noJS.newPage();
  await staticPage.goto(base + chart);
  assert.equal(await staticPage.locator('#score-table tbody tr:visible').count(), 101);
  assert.equal(await staticPage.locator('.lookup-controls').isVisible(), false);
  assert.equal(await staticPage.locator('.formula-methods article').count(), 4);
  console.log('PASS: lookup, validation, filtering, keyboard, print, all public routes at 4 widths, existing calculators/graph, no-JS fallback; no browser script errors.');
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
}
