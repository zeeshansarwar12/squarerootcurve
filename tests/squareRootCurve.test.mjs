import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateBatchCurve,
  calculateRawFromCurved,
  calculateSquareRootCurve,
  calculateSquareRootCurveFromPoints,
  formatCurveValue,
  generateSquareRootCurveChart,
  generateSquareRootCurveGraphPoints,
  getSquareRootCurveGraphPoint,
  parsePoints,
  parseBatchScores,
  parseRawScore,
} from '../src/lib/squareRootCurve.ts';

const exactCases = [
  [0, 0],
  [1, 10],
  [4, 20],
  [9, 30],
  [16, 40],
  [25, 50],
  [36, 60],
  [49, 70],
  [64, 80],
  [81, 90],
  [100, 100],
];

for (const [raw, expected] of exactCases) {
  test(`${raw} curves to ${expected}`, () => {
    assert.equal(calculateSquareRootCurve(raw).curved, expected);
  });
}

test('50 curves to approximately 70.7 for presentation', () => {
  const result = calculateSquareRootCurve(50);
  assert.ok(Math.abs(result.curved - 70.71067811865476) < Number.EPSILON * 100);
  assert.equal(formatCurveValue(result.curved), '70.7');
});

test('values below zero are invalid', () => {
  assert.deepEqual(parseRawScore('-0.1'), { valid: false, reason: 'range' });
  assert.throws(() => calculateSquareRootCurve(-0.1), RangeError);
});

test('values above 100 are invalid', () => {
  assert.deepEqual(parseRawScore('100.1'), { valid: false, reason: 'range' });
  assert.throws(() => calculateSquareRootCurve(100.1), RangeError);
});

test('empty input is distinct from zero', () => {
  assert.deepEqual(parseRawScore(''), { valid: false, reason: 'empty' });
  assert.deepEqual(parseRawScore('0'), { valid: true, value: 0 });
});

test('malformed input is invalid', () => {
  assert.deepEqual(parseRawScore('not-a-score'), { valid: false, reason: 'malformed' });
});

test('batch parsing preserves newline-separated score order', () => {
  assert.deepEqual(parseBatchScores('64\n81\n49'), {
    scores: [64, 81, 49],
    errors: [],
  });
});

test('batch parsing accepts commas and spreadsheet whitespace', () => {
  assert.deepEqual(parseBatchScores('64,81,49'), {
    scores: [64, 81, 49],
    errors: [],
  });
  assert.deepEqual(parseBatchScores('64\t81\r\n49  72'), {
    scores: [64, 81, 49, 72],
    errors: [],
  });
});

test('batch parsing keeps valid decimals and identifies malformed and ranged tokens', () => {
  assert.deepEqual(parseBatchScores('64.5 -1 abc 81 101'), {
    scores: [64.5, 81],
    errors: [
      { token: '-1', reason: 'range' },
      { token: 'abc', reason: 'malformed' },
      { token: '101', reason: 'range' },
    ],
  });
});

test('batch curve calculation uses shared math and summarizes the class', () => {
  const batch = calculateBatchCurve([64, 49, 81]);

  assert.deepEqual(
    batch.results.map(({ raw, curved }) => [raw, curved]),
    [
      [64, 80],
      [49, 70],
      [81, 90],
    ],
  );
  assert.equal(batch.summary.count, 3);
  assert.ok(Math.abs(batch.summary.rawAverage - 64.66666666666667) < 1e-12);
  assert.equal(batch.summary.curvedAverage, 80);
  assert.ok(Math.abs(batch.summary.averageBoost - 15.333333333333334) < 1e-12);
  assert.equal(batch.results[0].curved, calculateSquareRootCurve(64).curved);
});

test('batch calculator comfortably processes 500 scores', () => {
  const scores = Array.from({ length: 500 }, (_, index) => index % 101);
  const batch = calculateBatchCurve(scores);

  assert.equal(batch.results.length, 500);
  assert.equal(batch.summary.count, 500);
});

test('chart contains every integer score from 0 through 100', () => {
  const chart = generateSquareRootCurveChart();

  assert.equal(chart.length, 101);
  assert.equal(chart[0].raw, 0);
  assert.equal(chart.at(-1).raw, 100);
});

test('chart values come from the shared curve calculation', () => {
  const chart = generateSquareRootCurveChart();
  const expected = new Map([
    [25, '50'],
    [50, '70.7'],
    [64, '80'],
    [81, '90'],
    [100, '100'],
  ]);

  for (const [raw, curved] of expected) {
    assert.equal(formatCurveValue(chart[raw].curved), curved);
    assert.equal(chart[raw].curved, calculateSquareRootCurve(raw).curved);
  }
});

test('graph points use the shared curve calculation for key scores', () => {
  for (const [raw, expected] of exactCases) {
    const point = getSquareRootCurveGraphPoint(raw);
    assert.deepEqual(point, { x: raw, y: expected });
    assert.equal(point.y, calculateSquareRootCurve(raw).curved);
  }

  assert.equal(formatCurveValue(getSquareRootCurveGraphPoint(50).y), '70.7');
});

test('generated graph points are bounded and lightweight', () => {
  const points = generateSquareRootCurveGraphPoints(50);

  assert.equal(points.length, 51);
  assert.deepEqual(points[0], { x: 0, y: 0 });
  assert.deepEqual(points.at(-1), { x: 100, y: 100 });
  assert.ok(points.every(({ x, y }) => x >= 0 && x <= 100 && y >= 0 && y <= 100));
});

const reverseCases = [
  [0, 0],
  [50, 25],
  [70, 49],
  [80, 64],
  [90, 81],
  [100, 100],
];

for (const [curved, expectedRaw] of reverseCases) {
  test(`${curved} curved requires ${expectedRaw} raw`, () => {
    assert.equal(calculateRawFromCurved(curved).raw, expectedRaw);
  });
}

test('raw to curved to reverse is consistent', () => {
  for (const raw of [0, 1, 25, 50, 64, 81, 100]) {
    const curved = calculateSquareRootCurve(raw).curved;
    const reversed = calculateRawFromCurved(curved).raw;
    assert.ok(Math.abs(reversed - raw) < 1e-12);
  }
});

const pointsCases = [
  [32, 50, 64, 80],
  [25, 100, 25, 50],
  [81, 100, 81, 90],
  [0, 50, 0, 0],
];

for (const [earned, possible, expectedRaw, expectedCurved] of pointsCases) {
  test(`${earned} out of ${possible} curves to ${expectedCurved}`, () => {
    const result = calculateSquareRootCurveFromPoints(earned, possible);
    assert.equal(result.raw, expectedRaw);
    assert.equal(result.curved, expectedCurved);
  });
}

test('points validation rejects earned points above possible points', () => {
  assert.deepEqual(parsePoints('51', '50'), { valid: false, reason: 'earned-exceeds' });
  assert.throws(() => calculateSquareRootCurveFromPoints(51, 50), RangeError);
});

test('points validation rejects zero possible points', () => {
  assert.deepEqual(parsePoints('0', '0'), { valid: false, reason: 'possible-nonpositive' });
  assert.throws(() => calculateSquareRootCurveFromPoints(0, 0), RangeError);
});

test('points validation distinguishes empty values from zero', () => {
  assert.deepEqual(parsePoints('', '50'), { valid: false, reason: 'empty' });
  assert.deepEqual(parsePoints('0', '50'), { valid: true, earned: 0, possible: 50 });
});
