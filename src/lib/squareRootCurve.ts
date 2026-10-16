export type ParsedRawScore =
  | { valid: true; value: number }
  | { valid: false; reason: 'empty' | 'malformed' | 'range' };

export interface CurveResult {
  raw: number;
  curved: number;
  boost: number;
}

export interface GradeAdjustmentResult {
  raw: number;
  adjusted: number;
  change: number;
}

export interface CurveChartEntry {
  raw: number;
  curved: number;
}

export interface CurveGraphPoint {
  x: number;
  y: number;
}

export interface ReverseCurveResult {
  curved: number;
  raw: number;
}

export interface PointsCurveResult extends CurveResult {
  earned: number;
  possible: number;
}

export interface BatchScoreError {
  token: string;
  reason: 'malformed' | 'range';
}

export interface ParsedBatchScores {
  scores: number[];
  errors: BatchScoreError[];
}

export interface BatchCurveSummary {
  count: number;
  rawAverage: number;
  curvedAverage: number;
  averageBoost: number;
}

export interface BatchCurveData {
  results: CurveResult[];
  summary: BatchCurveSummary;
}

export type ParsedPoints =
  | { valid: true; earned: number; possible: number }
  | {
      valid: false;
      reason: 'empty' | 'malformed' | 'earned-negative' | 'possible-nonpositive' | 'earned-exceeds';
    };

export function parseRawScore(value: string): ParsedRawScore {
  if (value.trim() === '') {
    return { valid: false, reason: 'empty' };
  }

  const score = Number(value);

  if (!Number.isFinite(score)) {
    return { valid: false, reason: 'malformed' };
  }

  if (score < 0 || score > 100) {
    return { valid: false, reason: 'range' };
  }

  return { valid: true, value: score };
}

export function calculateSquareRootCurve(raw: number): CurveResult {
  if (!Number.isFinite(raw) || raw < 0 || raw > 100) {
    throw new RangeError('Raw score must be between 0 and 100.');
  }

  const curved = 10 * Math.sqrt(raw);

  return {
    raw,
    curved,
    boost: curved - raw,
  };
}

function assertValidPercentage(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${label} must be between 0 and 100.`);
  }
}

export function calculateFlatPoints(raw: number, points: number): GradeAdjustmentResult {
  assertValidPercentage(raw, 'Raw score');

  if (!Number.isFinite(points) || points < 0) {
    throw new RangeError('Points to add must be zero or greater.');
  }

  const adjusted = Math.min(100, raw + points);
  return { raw, adjusted, change: adjusted - raw };
}

export function calculateScaleToHighest(raw: number, highest: number): GradeAdjustmentResult {
  assertValidPercentage(raw, 'Raw score');

  if (!Number.isFinite(highest) || highest <= 0 || highest > 100) {
    throw new RangeError('Highest score must be greater than 0 and no more than 100.');
  }

  if (raw > highest) {
    throw new RangeError('Raw score cannot exceed the highest score for proportional scaling.');
  }

  const adjusted = raw * (100 / highest);
  return { raw, adjusted, change: adjusted - raw };
}

export function calculateAddTopScoreGap(raw: number, highest: number): GradeAdjustmentResult {
  assertValidPercentage(raw, 'Raw score');

  if (!Number.isFinite(highest) || highest <= 0 || highest > 100) {
    throw new RangeError('Highest score must be greater than 0 and no more than 100.');
  }

  const adjusted = Math.min(100, raw + (100 - highest));
  return { raw, adjusted, change: adjusted - raw };
}

export function parseBatchScores(value: string): ParsedBatchScores {
  const scores: number[] = [];
  const errors: BatchScoreError[] = [];
  const tokens = value.trim() === '' ? [] : value.trim().split(/[\s,]+/);

  for (const token of tokens) {
    const parsed = parseRawScore(token);

    if (parsed.valid) {
      scores.push(parsed.value);
    } else if (parsed.reason !== 'empty') {
      errors.push({ token, reason: parsed.reason });
    }
  }

  return { scores, errors };
}

export function calculateBatchCurve(scores: number[]): BatchCurveData {
  const results = scores.map((score) => calculateSquareRootCurve(score));
  const count = results.length;

  if (count === 0) {
    return {
      results,
      summary: { count: 0, rawAverage: 0, curvedAverage: 0, averageBoost: 0 },
    };
  }

  const totals = results.reduce(
    (sum, result) => ({
      raw: sum.raw + result.raw,
      curved: sum.curved + result.curved,
      boost: sum.boost + result.boost,
    }),
    { raw: 0, curved: 0, boost: 0 },
  );

  return {
    results,
    summary: {
      count,
      rawAverage: totals.raw / count,
      curvedAverage: totals.curved / count,
      averageBoost: totals.boost / count,
    },
  };
}

export type GradeCurveMethod =
  | 'flat-points'
  | 'square-root'
  | 'scale-highest'
  | 'top-score-gap'
  | 'target-average';

export interface ClassGradeCurveOptions {
  points?: number;
  targetAverage?: number;
}

export interface ClassGradeCurveResult {
  raw: number;
  adjusted: number;
  change: number;
}

export interface ClassGradeCurveSummary {
  count: number;
  rawAverage: number;
  adjustedAverage: number;
  rawMedian: number;
  adjustedMedian: number;
  rawLowest: number;
  adjustedLowest: number;
  rawHighest: number;
  adjustedHighest: number;
}

export interface ClassGradeCurveData {
  method: GradeCurveMethod;
  results: ClassGradeCurveResult[];
  summary: ClassGradeCurveSummary;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function calculateClassGradeCurve(
  scores: number[],
  method: GradeCurveMethod,
  options: ClassGradeCurveOptions = {},
): ClassGradeCurveData {
  scores.forEach((score) => assertValidPercentage(score, 'Class score'));

  if (scores.length === 0) {
    return {
      method,
      results: [],
      summary: {
        count: 0,
        rawAverage: 0,
        adjustedAverage: 0,
        rawMedian: 0,
        adjustedMedian: 0,
        rawLowest: 0,
        adjustedLowest: 0,
        rawHighest: 0,
        adjustedHighest: 0,
      },
    };
  }

  const rawAverage = average(scores);
  const rawHighest = Math.max(...scores);
  let results: ClassGradeCurveResult[];

  switch (method) {
    case 'flat-points': {
      const points = options.points ?? 0;
      if (!Number.isFinite(points) || points < 0) {
        throw new RangeError('Points to add must be zero or greater.');
      }
      results = scores.map((raw) => calculateFlatPoints(raw, points));
      break;
    }

    case 'square-root':
      results = scores.map((raw) => {
        const result = calculateSquareRootCurve(raw);
        return { raw, adjusted: result.curved, change: result.boost };
      });
      break;

    case 'scale-highest':
      if (rawHighest <= 0) {
        throw new RangeError('Scaling requires at least one class score greater than 0.');
      }
      results = scores.map((raw) => calculateScaleToHighest(raw, rawHighest));
      break;

    case 'top-score-gap':
      if (rawHighest <= 0) {
        throw new RangeError('Top-score-gap adjustment requires at least one class score greater than 0.');
      }
      results = scores.map((raw) => calculateAddTopScoreGap(raw, rawHighest));
      break;

    case 'target-average': {
      const targetAverage = options.targetAverage ?? rawAverage;
      assertValidPercentage(targetAverage, 'Target average');
      const offset = targetAverage - rawAverage;
      results = scores.map((raw) => {
        const adjusted = Math.min(100, Math.max(0, raw + offset));
        return { raw, adjusted, change: adjusted - raw };
      });
      break;
    }

    default: {
      const exhaustiveCheck: never = method;
      throw new Error(`Unsupported grade curve method: ${exhaustiveCheck}`);
    }
  }

  const adjustedScores = results.map((result) => result.adjusted);

  return {
    method,
    results,
    summary: {
      count: results.length,
      rawAverage,
      adjustedAverage: average(adjustedScores),
      rawMedian: median(scores),
      adjustedMedian: median(adjustedScores),
      rawLowest: Math.min(...scores),
      adjustedLowest: Math.min(...adjustedScores),
      rawHighest,
      adjustedHighest: Math.max(...adjustedScores),
    },
  };
}

export function calculateRawFromCurved(curved: number): ReverseCurveResult {
  if (!Number.isFinite(curved) || curved < 0 || curved > 100) {
    throw new RangeError('Curved score must be between 0 and 100.');
  }

  return {
    curved,
    raw: (curved / 10) ** 2,
  };
}

export function parsePoints(earnedValue: string, possibleValue: string): ParsedPoints {
  if (earnedValue.trim() === '' || possibleValue.trim() === '') {
    return { valid: false, reason: 'empty' };
  }

  const earned = Number(earnedValue);
  const possible = Number(possibleValue);

  if (!Number.isFinite(earned) || !Number.isFinite(possible)) {
    return { valid: false, reason: 'malformed' };
  }

  if (possible <= 0) {
    return { valid: false, reason: 'possible-nonpositive' };
  }

  if (earned < 0) {
    return { valid: false, reason: 'earned-negative' };
  }

  if (earned > possible) {
    return { valid: false, reason: 'earned-exceeds' };
  }

  return { valid: true, earned, possible };
}

export function calculateSquareRootCurveFromPoints(
  earned: number,
  possible: number,
): PointsCurveResult {
  if (!Number.isFinite(possible) || possible <= 0) {
    throw new RangeError('Points possible must be greater than 0.');
  }

  if (!Number.isFinite(earned) || earned < 0 || earned > possible) {
    throw new RangeError('Points earned must be between 0 and points possible.');
  }

  const raw = (earned / possible) * 100;
  const result = calculateSquareRootCurve(raw);

  return { earned, possible, ...result };
}

export function formatCurveValue(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function generateSquareRootCurveChart(): CurveChartEntry[] {
  return Array.from({ length: 101 }, (_, raw) => {
    const { curved } = calculateSquareRootCurve(raw);
    return { raw, curved };
  });
}

export function getSquareRootCurveGraphPoint(raw: number): CurveGraphPoint {
  const { curved } = calculateSquareRootCurve(raw);
  return { x: raw, y: curved };
}

export function generateSquareRootCurveGraphPoints(segments = 50): CurveGraphPoint[] {
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError('Graph segments must be a positive integer.');
  }

  return Array.from({ length: segments + 1 }, (_, index) =>
    getSquareRootCurveGraphPoint((index / segments) * 100),
  );
}
