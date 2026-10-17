export interface BellCurveOptions {
  targetMean: number;
  targetStandardDeviation: number;
  capToPercentageRange?: boolean;
}

export interface BellCurveResult {
  raw: number;
  zScore: number;
  adjustedUncapped: number;
  adjusted: number;
  change: number;
  capped: boolean;
}

export interface BellCurveSummary {
  count: number;
  rawMean: number;
  rawStandardDeviation: number;
  adjustedMean: number;
  adjustedStandardDeviation: number;
  targetMean: number;
  targetStandardDeviation: number;
  cappedCount: number;
}

export interface BellCurveData {
  results: BellCurveResult[];
  summary: BellCurveSummary;
}

function assertPercentage(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${label} must be between 0 and 100.`);
  }
}

export function calculateMean(values: number[]): number {
  if (values.length === 0) {
    throw new RangeError('At least one value is required.');
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculatePopulationStandardDeviation(values: number[], mean = calculateMean(values)): number {
  if (values.length === 0) {
    throw new RangeError('At least one value is required.');
  }

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

export function calculateBellCurve(
  scores: number[],
  options: BellCurveOptions,
): BellCurveData {
  if (scores.length < 2) {
    throw new RangeError('Enter at least two class scores.');
  }

  scores.forEach((score) => assertPercentage(score, 'Class score'));
  assertPercentage(options.targetMean, 'Target mean');

  if (
    !Number.isFinite(options.targetStandardDeviation) ||
    options.targetStandardDeviation <= 0
  ) {
    throw new RangeError('Target standard deviation must be greater than 0.');
  }

  const rawMean = calculateMean(scores);
  const rawStandardDeviation = calculatePopulationStandardDeviation(scores, rawMean);

  if (rawStandardDeviation === 0) {
    throw new RangeError(
      'Bell-curve normalization requires variation in the class scores; all entered scores are identical.',
    );
  }

  const capToPercentageRange = options.capToPercentageRange ?? true;

  const results = scores.map((raw) => {
    const zScore = (raw - rawMean) / rawStandardDeviation;
    const adjustedUncapped =
      options.targetMean + zScore * options.targetStandardDeviation;
    const adjusted = capToPercentageRange
      ? Math.min(100, Math.max(0, adjustedUncapped))
      : adjustedUncapped;

    return {
      raw,
      zScore,
      adjustedUncapped,
      adjusted,
      change: adjusted - raw,
      capped: adjusted !== adjustedUncapped,
    };
  });

  const adjustedScores = results.map((result) => result.adjusted);
  const adjustedMean = calculateMean(adjustedScores);
  const adjustedStandardDeviation = calculatePopulationStandardDeviation(
    adjustedScores,
    adjustedMean,
  );

  return {
    results,
    summary: {
      count: scores.length,
      rawMean,
      rawStandardDeviation,
      adjustedMean,
      adjustedStandardDeviation,
      targetMean: options.targetMean,
      targetStandardDeviation: options.targetStandardDeviation,
      cappedCount: results.filter((result) => result.capped).length,
    },
  };
}
