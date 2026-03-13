import { calculateCurrentGrade, calculateMaxPossibleGrade } from "../../../../src/domain/grade/gradeCalculator";
import { GradeComponent } from "../../../../src/types/backendTypes";
import { INVALID_GRADE, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

describe("Grade Calculation Functions with Late Penalties", () => {
  const today = new Date("2026-03-10");
  const tomorrow = new Date(today.getTime() + TWENTYFOUR_HOURS_IN_MS); // 1 day after

  const assessments: GradeComponent[] = [
    {
      assessmentId: "a1",
      score: new Prisma.Decimal(80),
      weight: new Prisma.Decimal(0.4),
      maxScore: null,
      submissionDate: today,
      dueDate: today, // on time, no penalty
    },
    {
      assessmentId: "a2",
      score: null,
      weight: new Prisma.Decimal(0.6),
      maxScore: null,
      submissionDate: null,
      dueDate: today, // unsubmitted, assume maxScore for max grade
    }
  ];

  describe("calculateCurrentGrade", () => {
    test("returns correct grade when weights sum to 1 (no late penalty applied for on-time submission)", () => {
      const grade = calculateCurrentGrade(assessments);
      // a1: 80/100 * 0.4 = 0.32, a2: null => 0
      expect(grade.toNumber()).toBeCloseTo(0.32);
    });

    test("applies late penalty correctly", () => {
      const lateAssessment: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(80),
          weight: new Prisma.Decimal(1),
          maxScore: null,
          submissionDate: tomorrow, // 1 day late
          dueDate: today,
        }
      ];
      const grade = calculateCurrentGrade(lateAssessment);
      // default penalty per day in computeLateFraction is 5% per day
      expect(grade.toNumber()).toBeCloseTo(0.75);
    });

    test("returns INVALID_GRADE if weights do not sum to 1", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: new Prisma.Decimal(0.1) }));
      const grade = calculateCurrentGrade(invalidAssessments);
      expect(grade.toNumber()).toBe(INVALID_GRADE);
    });
  });

  describe("calculateMaxPossibleGrade", () => {
    test("calculates grade assuming missing scores are max, penalties applied only to submitted", () => {
      const maxGrade = calculateMaxPossibleGrade(assessments);
      // a1: 80/100*0.4=0.32, a2: 100/100*0.6=0.6 => total 0.92
      expect(maxGrade.toNumber()).toBeCloseTo(0.92);
    });

    test("applies late penalty only to submitted assessments", () => {
      const lateAssessment: GradeComponent[] = [
        {
          assessmentId: "a1",
          score: new Prisma.Decimal(80),
          weight: new Prisma.Decimal(0.4),
          maxScore: null,
          submissionDate: tomorrow, // late
          dueDate: today,
        },
        {
          assessmentId: "a2",
          score: null,
          weight: new Prisma.Decimal(0.6),
          maxScore: null,
          submissionDate: null,
          dueDate: today,
        }
      ];
      const grade = calculateMaxPossibleGrade(lateAssessment);
      const a1WithPenalty = 80 * 0.95; // 1 day late penalty
      const expected = a1WithPenalty / 100 * 0.4 + 1 * 0.6; // a2 maxed
      expect(grade.toNumber()).toBeCloseTo(expected);
    });

    test("returns INVALID_GRADE if weights invalid", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: new Prisma.Decimal(0.3) }));
      expect(calculateMaxPossibleGrade(invalidAssessments).toNumber()).toBe(INVALID_GRADE);
    });
  });
});

describe("Grade Calculation Functions - Edge Cases with Penalties", () => {
  const today = new Date();

  describe("calculateCurrentGrade", () => {
    test("all scores null should return 0", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today },
        { assessmentId: "a2", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBe(0);
    });

    test("weights sum slightly off due to floating point", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80), weight: new Prisma.Decimal(0.3333333), maxScore: null, submissionDate: today, dueDate: today },
        { assessmentId: "a2", score: new Prisma.Decimal(90), weight: new Prisma.Decimal(0.6666667), maxScore: null, submissionDate: today, dueDate: today }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBeCloseTo(0.8*0.3333333 + 0.9*0.6666667);
    });

    test("weight sum far off should return INVALID_GRADE", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80), weight: new Prisma.Decimal(0.3), maxScore: null, submissionDate: today, dueDate: today },
        { assessmentId: "a2", score: new Prisma.Decimal(90), weight: new Prisma.Decimal(0.4), maxScore: null, submissionDate: today, dueDate: today }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBe(INVALID_GRADE);
    });

    test("zero weight assessments should not affect grade", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80), weight: new Prisma.Decimal(0), maxScore: null, submissionDate: today, dueDate: today },
        { assessmentId: "a2", score: new Prisma.Decimal(100), weight: new Prisma.Decimal(1), maxScore: null, submissionDate: today, dueDate: today }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBeCloseTo(1);
    });
  });

  describe("calculateMaxPossibleGrade", () => {
    test("all scores null should return 1 (max possible)", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today },
        { assessmentId: "a2", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today }
      ];
      const grade = calculateMaxPossibleGrade(assessments);
      expect(grade.toNumber()).toBe(1);
    });
  });
});
