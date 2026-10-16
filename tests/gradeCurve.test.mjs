import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAddTopScoreGap,
  calculateClassGradeCurve,
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

test('whole-class flat-points adjustment applies the same points and caps at 100', () => {
  const result = calculateClassGradeCurve([55, 92, 99], 'flat-points', { points: 5 });
  assert.deepEqual(
    result.results.map(({ adjusted }) => adjusted),
    [60, 97, 100],
  );
  assert.equal(result.summary.count, 3);
});

test('whole-class square-root method reuses the authoritative square-root formula', () => {
  const result = calculateClassGradeCurve([64, 81, 100], 'square-root');
  assert.deepEqual(
    result.results.map(({ adjusted }) => adjusted),
    [80, 90, 100],
  );
  assert.equal(result.summary.rawMedian, 81);
  assert.equal(result.summary.adjustedMedian, 90);
});

test('whole-class proportional scaling uses the observed class high score', () => {
  const result = calculateClassGradeCurve([46, 69, 92], 'scale-highest');
  assert.equal(result.results[2].adjusted, 100);
  assert.ok(Math.abs(result.results[1].adjusted - 75) < 1e-12);
  assert.equal(result.summary.rawHighest, 92);
  assert.equal(result.summary.adjustedHighest, 100);
});

test('whole-class top-score-gap remains distinct from proportional scaling', () => {
  const scores = [55, 73, 92];
  const scaled = calculateClassGradeCurve(scores, 'scale-highest');
  const gap = calculateClassGradeCurve(scores, 'top-score-gap');
  assert.notDeepEqual(
    scaled.results.map(({ adjusted }) => adjusted),
    gap.results.map(({ adjusted }) => adjusted),
  );
  assert.deepEqual(
    gap.results.map(({ adjusted }) => adjusted),
    [63, 81, 100],
  );
});

test('whole-class target-average shift reaches the target when no score clips', () => {
  const result = calculateClassGradeCurve([55, 67, 73, 81, 92], 'target-average', {
    targetAverage: 80,
  });
  assert.ok(Math.abs(result.summary.rawAverage - 73.6) < 1e-12);
  assert.ok(Math.abs(result.summary.adjustedAverage - 80) < 1e-12);
  assert.deepEqual(
    result.results.map(({ adjusted }) => Number(adjusted.toFixed(1))),
    [61.4, 73.4, 79.4, 87.4, 98.4],
  );
});

test('whole-class target-average adjustment keeps scores within 0 to 100', () => {
  const result = calculateClassGradeCurve([90, 95, 100], 'target-average', {
    targetAverage: 100,
  });
  assert.ok(result.results.every(({ adjusted }) => adjusted >= 0 && adjusted <= 100));
  assert.ok(result.summary.adjustedAverage <= 100);
});

test('whole-class scaling rejects an all-zero class', () => {
  assert.throws(
    () => calculateClassGradeCurve([0, 0], 'scale-highest'),
    RangeError,
  );
});
