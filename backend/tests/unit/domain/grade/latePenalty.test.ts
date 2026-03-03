import { Prisma } from "@prisma/client";
import { applyLatePenalty } from "../../../../src/domain/grade/latePenalty";

describe("Late Penalty Tests", () => {
  describe("applyLatePenalty", () => {
    test("reduces score by late penalty", () => {
      expect(applyLatePenalty(new Prisma.Decimal(80), new Prisma.Decimal(100), new Prisma.Decimal(0.1)).toNumber()).toBeCloseTo(70);
    });

    test("returns original score if penalty null", () => {
      expect(applyLatePenalty(new Prisma.Decimal(80), new Prisma.Decimal(100), null).toNumber()).toBe(80);
    });

    test("does not allow negative score", () => {
      expect(applyLatePenalty(new Prisma.Decimal(10), new Prisma.Decimal(10), new Prisma.Decimal(0.5)).toNumber()).toBe(5);
      expect(applyLatePenalty(new Prisma.Decimal(10), new Prisma.Decimal(100), new Prisma.Decimal(2)).toNumber()).toBe(0);
    });
  });
});

describe("Late Penalty - Edge Cases", () => {
  describe("applyLatePenalty", () => {
    test("NaN input values", () => {
      expect(applyLatePenalty(new Prisma.Decimal(NaN), new Prisma.Decimal(100), new Prisma.Decimal(0.1)).toNumber()).toBe(NaN);
      expect(applyLatePenalty(new Prisma.Decimal(10), new Prisma.Decimal(NaN), new Prisma.Decimal(0.1)).toNumber()).toBe(NaN);
      expect(applyLatePenalty(new Prisma.Decimal(80), new Prisma.Decimal(100), new Prisma.Decimal(NaN)).toNumber()).toBe(NaN);
    });

    test("negative input values", () => {
      expect(applyLatePenalty(new Prisma.Decimal(-100), new Prisma.Decimal(100), new Prisma.Decimal(0)).toNumber()).toBe(NaN);
      expect(applyLatePenalty(new Prisma.Decimal(100), new Prisma.Decimal(-100), new Prisma.Decimal(0)).toNumber()).toBe(NaN);
      expect(applyLatePenalty(new Prisma.Decimal(100), new Prisma.Decimal(100), new Prisma.Decimal(-0.1)).toNumber()).toBe(NaN);
    });
  });
});