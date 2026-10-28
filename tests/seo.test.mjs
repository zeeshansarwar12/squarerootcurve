import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { generateSquareRootCurveChart, formatCurveValue } from '../src/lib/squareRootCurve.ts';

test('all 101 reference values match an independent normalized formula', () => {
  const entries = generateSquareRootCurveChart();
  assert.equal(entries.length, 101);
  entries.forEach(({ raw, curved }, index) => {
    assert.equal(raw, index);
    assert.ok(Math.abs(curved - 100 * Math.sqrt(index / 100)) < 1e-12);
  });
  for (const [raw, expected] of [[0, '0'], [66, '81.2'], [72, '84.9'], [77, '87.7'], [86, '92.7'], [100, '100']]) {
    assert.equal(formatCurveValue(entries[raw].curved), expected);
  }
});

const built = existsSync(new URL('../dist/index.html', import.meta.url));

test('downloadable PDF contains the complete independently checked score table', () => {
  const pdf = readFileSync(new URL('../public/square-root-curve-chart.pdf', import.meta.url), 'latin1');
  assert.ok(pdf.startsWith('%PDF-'));
  const numbers = [...pdf.matchAll(/\((\d+(?:\.\d+)?)\) Tj/g)].map(match => match[1]);
  assert.equal(numbers.length, 202);
  for (let raw = 0; raw <= 100; raw++) {
    assert.equal(numbers[raw * 2], String(raw));
    assert.equal(Number(numbers[raw * 2 + 1]), Math.round(1000 * Math.sqrt(raw / 100)) / 10);
  }
});
test('built SEO, sitemap, reference values and internal links', { skip: !built && 'Run npm run build first to verify generated HTML.' }, () => {
  const routes = ['/', '/square-root-curve-chart/', '/grade-curve-calculator/', '/methodology/', '/privacy/', '/terms/'];
  const pages = new Map(routes.map(route => [route, readFileSync(new URL(`../dist${route}index.html`, import.meta.url), 'utf8')]));
  const titles = new Set();
  const descriptions = new Set();
  const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
  const robots = readFileSync(new URL('../dist/robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /Allow: \/\s/);
  assert.match(robots, /Sitemap: https:\/\/squarerootcurve.com\/sitemap.xml/);
  for (const [route, html] of pages) {
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, route);
    assert.doesNotMatch(html, /<meta[^>]+content="[^"]*noindex/);
    assert.ok(html.includes(`rel="canonical" href="https://squarerootcurve.com${route}"`));
    assert.ok(sitemap.includes(`<loc>https://squarerootcurve.com${route}</loc>`));
    titles.add(html.match(/<title>(.*?)<\/title>/s)[1]);
    descriptions.add(html.match(/<meta name="description" content="([^"]+)"/)[1]);
    for (const [, value] of html.matchAll(/href="([^"]+)"/g)) {
      const link = new URL(value, `https://squarerootcurve.com${route}`);
      if (link.origin !== 'https://squarerootcurve.com') continue;
      const target = pages.get(link.pathname);
      if (target) {
        if (link.hash) assert.ok(target.includes(`id="${decodeURIComponent(link.hash.slice(1))}"`), `${route}: ${value}`);
      } else {
        assert.ok(existsSync(new URL(`../dist${link.pathname}`, import.meta.url)), `${route}: ${value}`);
      }
    }
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) JSON.parse(json);
  }
  assert.equal(titles.size, routes.length);
  assert.equal(descriptions.size, routes.length);
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, routes.length);
  const chart = pages.get('/square-root-curve-chart/');
  assert.match(chart, /<h1[^>]*>Square Root Curve Table \(0–100\)<\/h1>/);
  const rows = [...chart.matchAll(/<tr data-raw="(\d+)"[^>]*>\s*<th[^>]*>(\d+)<\/th>\s*<td[^>]*>([\d.]+)<\/td>/g)];
  assert.equal(rows.length, 101);
  rows.forEach(([, raw, heading, curved], index) => {
    assert.equal(Number(raw), index);
    assert.equal(raw, heading);
    assert.equal(Number(curved), Math.round(1000 * Math.sqrt(index / 100)) / 10);
  });
  const graph = JSON.parse(chart.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)[1])['@graph'];
  const breadcrumb = graph.find(node => node['@type'] === 'BreadcrumbList');
  assert.deepEqual(breadcrumb.itemListElement.map(item => item.position), [1, 2]);
  assert.equal(breadcrumb.itemListElement[1].item, 'https://squarerootcurve.com/square-root-curve-chart/');
  const error = readFileSync(new URL('../dist/404.html', import.meta.url), 'utf8');
  assert.match(error, /<meta name="robots" content="noindex"/);
  assert.doesNotMatch(error, /rel="canonical"/);
});
