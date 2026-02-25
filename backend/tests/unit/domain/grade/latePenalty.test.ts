import { applyLatePenalty } from "@/domain/grade/latePenalty";

describe("Late Penalty Tests", () => {
  describe("applyLatePenalty", () => {
    test("reduces score by late penalty", () => {
      expect(applyLatePenalty(80, 100, 0.1)).toBeCloseTo(70);
    });

    test("returns original score if penalty null", () => {
      expect(applyLatePenalty(80, 100, null)).toBe(80);
    });

    test("does not allow negative score", () => {
      expect(applyLatePenalty(10, 10, 0.5)).toBe(5);
      expect(applyLatePenalty(10, 100, 2)).toBe(0);
    });
  });
});

describe("Late Penalty - Edge Cases", () => {
  describe("applyLatePenalty", () => {
    test("NaN input values", () => {
      expect(applyLatePenalty(NaN, 100, 0.1)).toBe(NaN);
      expect(applyLatePenalty(10, NaN, 0.1)).toBe(NaN);
      expect(applyLatePenalty(80, 100, NaN)).toBe(NaN);
    });

    test("negative input values", () => {
      expect(applyLatePenalty(-100, 100, 0)).toBe(NaN);
      expect(applyLatePenalty(100, -100, 0)).toBe(NaN);
      expect(applyLatePenalty(100, 100, -0.1)).toBe(NaN);
    });
  });
});