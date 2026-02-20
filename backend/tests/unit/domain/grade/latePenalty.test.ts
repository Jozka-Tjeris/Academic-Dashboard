import { applyLatePenalty } from "../../../../src/domain/grade/latePenalty";

describe("Late Penalty Tests", () => {
  describe("applyLatePenalty", () => {
    test("reduces score by late penalty", () => {
      expect(applyLatePenalty(80, 0.1)).toBeCloseTo(72);
    });

    test("returns original score if penalty null", () => {
      expect(applyLatePenalty(80, null)).toBe(80);
    });

    test("does not allow negative score", () => {
      expect(applyLatePenalty(10, 0.5)).toBe(5);
      expect(applyLatePenalty(10, 2)).toBe(0);
    });
  });
});

describe("Late Penalty - Edge Cases", () => {
  describe("applyLatePenalty", () => {
    test("score is NaN", () => {
      expect(applyLatePenalty(NaN, 0.1)).toBe(NaN);
    });

    test("weight is NaN", () => {
      expect(applyLatePenalty(80, NaN)).toBe(NaN);
    });

    test("negative starting score", () => {
      expect(applyLatePenalty(-100, 0)).toBe(0);
    })
  });
});