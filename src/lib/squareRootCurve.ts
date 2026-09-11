export type ParsedRawScore =
  | { valid: true; value: number }
  | { valid: false; reason: 'empty' | 'malformed' | 'range' };

export interface CurveResult {
  raw: number;
  curved: number;
  boost: number;
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
