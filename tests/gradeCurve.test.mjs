import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAddTopScoreGap,
  calculateFlatPoints,
  calculateScaleToHighest,
  calculateSquareRootCurve,
} from '../src/lib/squareRootCurve.ts';

test('flat points adds the requested amount', () => {
  assert.deepEqual(calculateFlatPoints(72, 5), { raw: 72, adjusted: 77, change: 5 });
});

test('flat points caps the displayed percentage at 100', () => {
  assert.deepEqual(calculateFlatPoints(98, 5), { raw: 98, adjusted: 100, change: 2 });
});

test('square root curve reuses the authoritative calculation', () => {
  assert.equal(calculateSquareRootCurve(64).curved, 80);
  assert.ok(Math.abs(calculateSquareRootCurve(72).curved - 84.8528137423857) < 1e-12);
});

test('proportional scaling makes 90 the new 100 for a raw score of 72', () => {
  assert.deepEqual(calculateScaleToHighest(72, 90), { raw: 72, adjusted: 80, change: 8 });
});

test('proportional scaling makes 80 the new 100 for a raw score of 64', () => {
  assert.deepEqual(calculateScaleToHighest(64, 80), { raw: 64, adjusted: 80, change: 16 });
});

test('proportional scaling rejects a highest score of zero', () => {
  assert.throws(() => calculateScaleToHighest(72, 0), RangeError);
});

test('proportional scaling rejects a raw score above the stated highest score', () => {
  assert.throws(() => calculateScaleToHighest(91, 90), RangeError);
});

test('top-score gap adds the difference between 90 and 100', () => {
  assert.deepEqual(calculateAddTopScoreGap(72, 90), { raw: 72, adjusted: 82, change: 10 });
});

test('top-score gap produces 84 from a raw score of 64 and highest score of 80', () => {
  assert.deepEqual(calculateAddTopScoreGap(64, 80), { raw: 64, adjusted: 84, change: 20 });
});

test('top-score gap caps a result above 100', () => {
  assert.deepEqual(calculateAddTopScoreGap(98, 90), { raw: 98, adjusted: 100, change: 2 });
});

test('proportional scaling and top-score-gap addition remain distinct', () => {
  assert.equal(calculateScaleToHighest(72, 90).adjusted, 80);
  assert.equal(calculateAddTopScoreGap(72, 90).adjusted, 82);
});