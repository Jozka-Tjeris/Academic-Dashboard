import { calculateRequiredScores } from "../../../../src/domain/grade/calculateRequiredScores";
import { GradeComponent } from "../../../../src/types/backendTypes";
import { Prisma } from "@prisma/client";
import {
  DEFAULT_MAX_SCORE,
  TWENTYFOUR_HOURS_IN_MS,
} from "@internal_package/shared";

describe("calculateRequiredScores", () => {
  const today = new Date("2026-03-10");
  const tomorrow = new Date(today.getTime() + TWENTYFOUR_HOURS_IN_MS);

  describe("basic functionality", () => {
    test("returns zero required scores if target already achieved", () => {
      const assessments: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(100),
          weight: new Prisma.Decimal(1),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: today,
          dueDate: today,
        },
      ];

      const result = calculateRequiredScores({
        targetGrade: new Prisma.Decimal(0.8),
        assessments,
      });

      expect(result.possible).toBe(true);
      expect(result.requiredScores!.length).toBe(0);
      expect(result.averageRequiredPercent).toBe(0);
    });

    test("detects impossible target", () => {
      const assessments: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(10),
          weight: new Prisma.Decimal(0.8),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: today,
          dueDate: today,
        },
        {
          assessmentId: "a2",
          score: null,
          weight: new Prisma.Decimal(0.2),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: null,
          dueDate: today,
        },
      ];

      const result = calculateRequiredScores({
        targetGrade: new Prisma.Decimal(0.9),
        assessments,
      });

      expect(result.possible).toBe(false);
    });
  });

  describe("required score calculations", () => {
    test("computes correct required score for single remaining assessment", () => {
      const assessments: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(80),
          weight: new Prisma.Decimal(0.5),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: today,
          dueDate: today,
        },
        {
          assessmentId: "a2",
          score: null,
          weight: new Prisma.Decimal(0.5),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: null,
          dueDate: tomorrow,
        },
      ];

      const result = calculateRequiredScores({
        targetGrade: new Prisma.Decimal(0.8),
        assessments,
      });

      expect(result.possible).toBe(true);

      const required = result.requiredScores![0];

      // Need 0.4 contribution from second assessment
      // 0.4 / 0.5 = 0.8 => 80/100
      expect(required.requiredScore).toBeCloseTo(80);

      expect(result.averageRequiredPercent).toBeCloseTo(0.8);
    });
  });

  describe("next assessment calculations", () => {
    test("computes minimum score needed on next assessment", () => {
      const assessments: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(70),
          weight: new Prisma.Decimal(0.4),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: today,
          dueDate: today,
        },
        {
          assessmentId: "a2",
          score: null,
          weight: new Prisma.Decimal(0.6),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: null,
          dueDate: tomorrow,
        },
      ];

      const result = calculateRequiredScores({
        targetGrade: new Prisma.Decimal(0.8),
        assessments,
      });

      expect(result.possible).toBe(true);

      expect(result.nextAssessmentRequiredScore).toBeGreaterThan(0);
      expect(result.nextAssessmentRequiredScore).toBeLessThanOrEqual(100);
    });
  });

  describe("late penalties", () => {
    test("required score increases when assessment is late", () => {
      const assessments: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(80),
          weight: new Prisma.Decimal(0.5),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: today,
          dueDate: today,
        },
        {
          assessmentId: "a2",
          score: null,
          weight: new Prisma.Decimal(0.5),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: tomorrow, // late
          dueDate: today,
        },
      ];

      const result = calculateRequiredScores({
        targetGrade: new Prisma.Decimal(0.8),
        assessments,
      });

      const required = result.requiredScores![0];

      // Should be higher than normal requirement due to penalty
      expect(required.requiredScore).toBeGreaterThan(80);
    });
  });

  describe("edge cases", () => {
    test("returns impossible if no remaining assessments", () => {
      const assessments: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(50),
          weight: new Prisma.Decimal(1),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: today,
          dueDate: today,
        },
      ];

      const result = calculateRequiredScores({
        targetGrade: new Prisma.Decimal(0.9),
        assessments,
      });

      expect(result.possible).toBe(false);
    });

    test("required scores should never exceed maxScore", () => {
      const assessments: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(70),
          weight: new Prisma.Decimal(0.9),
          maxScore: new Prisma.Decimal(DEFAULT_MAX_SCORE),
          submissionDate: today,
          dueDate: today,
        },
        {
          assessmentId: "a2",
          score: null,
          weight: new Prisma.Decimal(0.1),
          maxScore: new Prisma.Decimal(50),
          submissionDate: null,
          dueDate: tomorrow,
        },
      ];

      const result = calculateRequiredScores({
        targetGrade: new Prisma.Decimal(0.7),
        assessments,
      });

      expect(result.possible).toBe(true);
      const required = result.requiredScores![0];

      expect(required.requiredScore).toBeLessThanOrEqual(50);
    });
  });
});
