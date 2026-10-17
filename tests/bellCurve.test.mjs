import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateBellCurve,
  calculateMean,
  calculatePopulationStandardDeviation,
} from '../src/lib/bellCurve.ts';

test('mean is calculated from all class scores', () => {
  assert.equal(calculateMean([60, 70, 80]), 70);
});

test('population standard deviation uses the entered class as the population', () => {
  const sd = calculatePopulationStandardDeviation([60, 70, 80], 70);
  assert.ok(Math.abs(sd - 8.16496580927726) < 1e-12);
});

test('bell curve maps z scores to the target mean and standard deviation', () => {
  const result = calculateBellCurve([60, 70, 80], {
    targetMean: 75,
    targetStandardDeviation: 10,
    capToPercentageRange: false,
  });

  assert.ok(Math.abs(result.results[0].zScore + 1.224744871391589) < 1e-12);
  assert.ok(Math.abs(result.results[0].adjusted - 62.75255128608411) < 1e-12);
  assert.equal(result.results[1].adjusted, 75);
  assert.ok(Math.abs(result.results[2].adjusted - 87.24744871391589) < 1e-12);
  assert.ok(Math.abs(result.summary.adjustedMean - 75) < 1e-12);
  assert.ok(Math.abs(result.summary.adjustedStandardDeviation - 10) < 1e-12);
});

test('bell curve can cap adjusted percentages to 0 through 100', () => {
  const result = calculateBellCurve([0, 50, 100], {
    targetMean: 90,
    targetStandardDeviation: 30,
    capToPercentageRange: true,
  });

  assert.ok(result.results.every(({ adjusted }) => adjusted >= 0 && adjusted <= 100));
  assert.ok(result.summary.cappedCount > 0);
});

test('bell curve reports when a score was capped', () => {
  const result = calculateBellCurve([0, 50, 100], {
    targetMean: 90,
    targetStandardDeviation: 30,
    capToPercentageRange: true,
  });

  assert.equal(result.results[2].capped, true);
  assert.equal(result.results[2].adjusted, 100);
  assert.ok(result.results[2].adjustedUncapped > 100);
});

test('bell curve refuses an identical-score class because z scores are undefined', () => {
  assert.throws(
    () =>
      calculateBellCurve([70, 70, 70], {
        targetMean: 75,
        targetStandardDeviation: 10,
      }),
    RangeError,
  );
});

test('bell curve requires at least two scores', () => {
  assert.throws(
    () =>
      calculateBellCurve([70], {
        targetMean: 75,
        targetStandardDeviation: 10,
      }),
    RangeError,
  );
});

test('bell curve validates target mean and target standard deviation', () => {
  assert.throws(
    () =>
      calculateBellCurve([60, 70, 80], {
        targetMean: 101,
        targetStandardDeviation: 10,
      }),
    RangeError,
  );

  assert.throws(
    () =>
      calculateBellCurve([60, 70, 80], {
        targetMean: 75,
        targetStandardDeviation: 0,
      }),
    RangeError,
  );
});
