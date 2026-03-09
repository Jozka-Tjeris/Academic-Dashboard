import { GradeComponent } from "../../../../src/types/backendTypes";
import { simulateFinalGrade } from "../../../../src/domain/grade/simulation";
import { INVALID_GRADE } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

describe("Grade Simulation Functions", () => {
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

  describe("simulateFinalGrade", () => {
    test("applies simulated scores correctly", () => {
      const simulated = [{ assessmentId: "a2", simulatedScore: new Prisma.Decimal(90) }];
      const grade = simulateFinalGrade(assessments, simulated);
      // a1: 80/100*0.4=0.32, a2: 90/100*0.6=0.54 => total 0.86
      expect(grade.toNumber()).toBeCloseTo(0.86);
    });

    test("uses actual scores when no simulation provided", () => {
      const grade = simulateFinalGrade(assessments, []);
      // a1: 80/100*0.4=0.32, a2: null=>100/100*0.6=0.6
      expect(grade.toNumber()).toBeCloseTo(0.92);
    });

    test("returns INVALID_GRADE if weights invalid", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: new Prisma.Decimal(0.2) }));
      const grade = simulateFinalGrade(invalidAssessments, []);
      expect(grade.toNumber()).toBe(INVALID_GRADE);
    });
  });
});


describe("Grade Simulation - Edge Cases", () => {
  describe("simulateFinalGrade", () => {
    test("simulate all assessments with custom scores", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
          },
        { assessmentId: "a2", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
        }
      ];
      const simulated = [
        { assessmentId: "a1", simulatedScore: new Prisma.Decimal(80) },
        { assessmentId: "a2", simulatedScore: new Prisma.Decimal(90) }
      ];
      const grade = simulateFinalGrade(assessments, simulated);
      // 0.5*0.8 + 0.5*0.9 = 0.85
      expect(grade.toNumber()).toBeCloseTo(0.85);
    });

    test("simulate with some scores missing", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
          },
        { assessmentId: "a2", score: null, 
          weight: new Prisma.Decimal(0.5), maxScore: null,
        }
      ];
      const simulated = [
        { assessmentId: "a2", simulatedScore: new Prisma.Decimal(70) }
      ];
      const grade = simulateFinalGrade(assessments, simulated);
      // a1 null => 100, a2 simulated 70 => 1*0.5 + 0.7*0.5 = 0.85
      expect(grade.toNumber()).toBeCloseTo(0.85);
    });
  });
})