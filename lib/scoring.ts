export interface ResultTypeDB {
  id: string;
  name: string;
  slug: string;
  description: string;
  minimumScore: number;
  maximumScore: number;
  displayOrder: number;
  active: boolean;
}

export interface CumulativeScoreResult {
  finalScore: number;
  resultType: ResultTypeDB;
}

/**
 * Model A: Single-Score Cumulative Scoring Engine.
 * Calculates total score by summing option scores and finding the matching ResultType range.
 */
export function calculateCumulativeScore(
  selectedOptions: { score: number }[],
  resultTypes: ResultTypeDB[]
): CumulativeScoreResult {
  if (resultTypes.length === 0) {
    throw new Error("No active result types configured in the database.");
  }

  // Sum option scores
  const finalScore = selectedOptions.reduce((total, opt) => total + opt.score, 0);

  // Find result range where minimumScore <= finalScore <= maximumScore
  const activeRanges = resultTypes.filter((rt) => rt.active);
  const matchedResult = activeRanges.find(
    (rt) => finalScore >= rt.minimumScore && finalScore <= rt.maximumScore
  );

  if (!matchedResult) {
    throw new Error(
      `No matching ResultType range found for final score of ${finalScore}. Please check range configurations.`
    );
  }

  return {
    finalScore,
    resultType: matchedResult,
  };
}

/**
 * Helper function to validate result score ranges for overlaps or invalid bounds.
 */
export function validateResultRanges(
  ranges: Array<{ name: string; minimumScore: number; maximumScore: number; active?: boolean }>
): { valid: boolean; error?: string } {
  const activeRanges = ranges.filter((r) => r.active !== false);

  // 1. Check min <= max
  for (const r of activeRanges) {
    if (r.minimumScore > r.maximumScore) {
      return {
        valid: false,
        error: `Result '${r.name}' has minimum score (${r.minimumScore}) greater than maximum score (${r.maximumScore}).`,
      };
    }
  }

  // Sort by min score
  const sorted = [...activeRanges].sort((a, b) => a.minimumScore - b.minimumScore);

  // 2. Check overlaps
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (next.minimumScore <= current.maximumScore) {
      return {
        valid: false,
        error: `Result range overlap detected: '${current.name}' (${current.minimumScore}–${current.maximumScore}) overlaps with '${next.name}' (${next.minimumScore}–${next.maximumScore}).`,
      };
    }
  }

  return { valid: true };
}
