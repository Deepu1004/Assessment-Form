import { describe, it, expect } from "vitest";
import { calculateCumulativeScore, validateResultRanges, ResultTypeDB } from "../lib/scoring";

const mockResultTypes: ResultTypeDB[] = [
  { id: "1", name: "Explorer", slug: "explorer", description: "Desc", minimumScore: 5, maximumScore: 9, displayOrder: 1, active: true },
  { id: "2", name: "Builder", slug: "builder", description: "Desc", minimumScore: 10, maximumScore: 13, displayOrder: 2, active: true },
  { id: "3", name: "Analyst", slug: "analyst", description: "Desc", minimumScore: 14, maximumScore: 17, displayOrder: 3, active: true },
  { id: "4", name: "Connector", slug: "connector", description: "Desc", minimumScore: 18, maximumScore: 21, displayOrder: 4, active: true },
  { id: "5", name: "Leader", slug: "leader", description: "Desc", minimumScore: 22, maximumScore: 25, displayOrder: 5, active: true },
];

describe("Model A Single-Score Cumulative Engine", () => {
  it("should calculate cumulative score sum correctly (1 + 2 + 3 + 4 + 5 = 15)", () => {
    const selectedOptions = [
      { score: 1 },
      { score: 2 },
      { score: 3 },
      { score: 4 },
      { score: 5 },
    ];

    const result = calculateCumulativeScore(selectedOptions, mockResultTypes);

    expect(result.finalScore).toBe(15);
    expect(result.resultType.name).toBe("Analyst");
  });

  it("should correctly map score to configured result range (Score 9 -> Explorer, Score 10 -> Builder, Score 14 -> Analyst)", () => {
    // Score 9
    const res9 = calculateCumulativeScore([{ score: 9 }], mockResultTypes);
    expect(res9.finalScore).toBe(9);
    expect(res9.resultType.name).toBe("Explorer");

    // Score 10
    const res10 = calculateCumulativeScore([{ score: 10 }], mockResultTypes);
    expect(res10.finalScore).toBe(10);
    expect(res10.resultType.name).toBe("Builder");

    // Score 14
    const res14 = calculateCumulativeScore([{ score: 14 }], mockResultTypes);
    expect(res14.finalScore).toBe(14);
    expect(res14.resultType.name).toBe("Analyst");
  });

  it("should handle boundary cases (minimum score, maximum score, min - 1, max + 1)", () => {
    // Exact Min Score for Explorer (5)
    const resMin = calculateCumulativeScore([{ score: 5 }], mockResultTypes);
    expect(resMin.resultType.name).toBe("Explorer");

    // Exact Max Score for Explorer (9)
    const resMax = calculateCumulativeScore([{ score: 9 }], mockResultTypes);
    expect(resMax.resultType.name).toBe("Explorer");

    // Min - 1 (Score 4 -> Out of configured bounds)
    expect(() => calculateCumulativeScore([{ score: 4 }], mockResultTypes)).toThrowError(
      /No matching ResultType range found for final score of 4/
    );

    // Max + 1 (Score 10 -> Builder)
    const resMaxPlusOne = calculateCumulativeScore([{ score: 10 }], mockResultTypes);
    expect(resMaxPlusOne.resultType.name).toBe("Builder");
  });
});

describe("Score Range Overlap Validation", () => {
  it("should reject overlapping score ranges", () => {
    const overlapping = [
      { name: "Explorer", minimumScore: 5, maximumScore: 12 },
      { name: "Builder", minimumScore: 10, maximumScore: 15 },
    ];

    const validation = validateResultRanges(overlapping);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("overlap detected");
  });

  it("should accept valid non-overlapping score ranges", () => {
    const valid = [
      { name: "Explorer", minimumScore: 5, maximumScore: 9 },
      { name: "Builder", minimumScore: 10, maximumScore: 13 },
      { name: "Analyst", minimumScore: 14, maximumScore: 17 },
    ];

    const validation = validateResultRanges(valid);
    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });
});
