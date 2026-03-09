import { calculateCurrentGrade, calculateMaxPossibleGrade } from "../../../../src/domain/grade/gradeCalculator";
import { GradeComponent } from "../../../../src/types/backendTypes";
import { INVALID_GRADE } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

describe("Grade Calculation Functions", () => {
  const assessments: GradeComponent[] = [
    {
      assessmentId: "a1", score: new Prisma.Decimal(80),
      weight: new Prisma.Decimal(0.4), maxScore: null,
    },
    {
      assessmentId: "a2", score: null,
      weight:  new Prisma.Decimal(0.6), maxScore: null,
    }
  ];

  describe("calculateCurrentGrade", () => {
    test("returns correct grade when weights sum to 1", () => {
      const grade = calculateCurrentGrade(assessments);
      // a1: 80/100 * 0.4 = 0.32, a2: null => 0/100 * 0.6 = 0
      expect(grade.toNumber()).toBeCloseTo(0.32);
    });

    test("returns INVALID_GRADE if weights do not sum to 1", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: new Prisma.Decimal(0.1) }));
      const grade = calculateCurrentGrade(invalidAssessments);
      expect(grade.toNumber()).toBe(INVALID_GRADE);
    });
  });

  describe("calculateMaxPossibleGrade", () => {
    test("calculates grade assuming missing scores are max", () => {
      const grade = calculateMaxPossibleGrade(assessments);
      // a1: 80/100*0.4=0.32, a2: 100/100*0.6=0.6 => total 0.92
      expect(grade.toNumber()).toBeCloseTo(0.92);
    });

    test("returns INVALID_GRADE if weights invalid", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: new Prisma.Decimal(0.3) }));
      expect(calculateMaxPossibleGrade(invalidAssessments).toNumber()).toBe(INVALID_GRADE);
    });
  });
});

describe("Grade Calculation Functions - Edge Cases", () => {
  describe("calculateCurrentGrade", () => {
    test("all scores null should return 0", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
         },
        { assessmentId: "a2", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
        }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBe(0);
    });

    test("weights sum slightly off due to floating point", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80),
          weight: new Prisma.Decimal(0.3333333), maxScore: null,
        },
        { 
          assessmentId: "a2", score: new Prisma.Decimal(90),
          weight: new Prisma.Decimal(0.6666667), maxScore: null,
        }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBeCloseTo(0.8*0.3333333 + 0.9*0.6666667);
    });

    test("weight sum far off should return INVALID_GRADE", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80),
          weight: new Prisma.Decimal(0.3), maxScore: null,
        },
        { assessmentId: "a2", score: new Prisma.Decimal(90),
          weight: new Prisma.Decimal(0.4), maxScore: null,
        }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBe(INVALID_GRADE);
    });

    test("zero weight assessments should not affect grade", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80),
          weight: new Prisma.Decimal(0), maxScore: null,
        },
        { assessmentId: "a2", score: new Prisma.Decimal(100),
          weight: new Prisma.Decimal(1), maxScore: null,
        }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade.toNumber()).toBeCloseTo(1);
    });
  });

  describe("calculateMaxPossibleGrade", () => {
    test("all scores null should return 1 (max possible)", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
         },
        { assessmentId: "a2", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
        }
      ];
      const grade = calculateMaxPossibleGrade(assessments);
      expect(grade.toNumber()).toBe(1);
    });
  });
});
