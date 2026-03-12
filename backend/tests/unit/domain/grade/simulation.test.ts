import { GradeComponent } from "../../../../src/types/backendTypes";
import { simulateFinalGrade } from "../../../../src/domain/grade/simulation";
import { INVALID_GRADE, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

describe("Grade Simulation Functions with Late Penalties", () => {
  const today = new Date("2026-03-10");
  const tomorrow = new Date(today.getTime() + TWENTYFOUR_HOURS_IN_MS);

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
      dueDate: today, // unsubmitted, will only use maxScore if needed
    }
  ];

  describe("simulateFinalGrade", () => {
    test("applies simulated scores correctly", () => {
      const simulated = [{ assessmentId: "a2", simulatedScore: new Prisma.Decimal(90) }];
      const grade = simulateFinalGrade(assessments, simulated);
      // a1: 80/100*0.4=0.32, a2: 90/100*0.6=0.54 => total 0.86
      expect(grade.toNumber()).toBeCloseTo(0.86);
    });

    test("uses actual scores when no simulation provided, including late penalty", () => {
      const lateAssessments: GradeComponent[] = [
        {
          ...assessments[0],
          submissionDate: tomorrow, // 1 day late
        },
        assessments[1]
      ];
      const grade = simulateFinalGrade(lateAssessments, []);
      // a1: 80 - 5% penalty from 100 = 75, weighted 0.4 => 0.3
      // a2: unsubmitted => 0
      expect(grade.toNumber()).toBeCloseTo(0.3);
    });

    test("returns INVALID_GRADE if weights invalid", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: new Prisma.Decimal(0.2) }));
      const grade = simulateFinalGrade(invalidAssessments, []);
      expect(grade.toNumber()).toBe(INVALID_GRADE);
    });
  });
});


describe("Grade Simulation - Edge Cases with Penalties", () => {
  const today = new Date();

  describe("simulateFinalGrade", () => {
    test("simulate all assessments with custom scores", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today },
        { assessmentId: "a2", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today }
      ];
      const simulated = [
        { assessmentId: "a1", simulatedScore: new Prisma.Decimal(80) },
        { assessmentId: "a2", simulatedScore: new Prisma.Decimal(90) }
      ];
      const grade = simulateFinalGrade(assessments, simulated);
      // 0.5*0.8 + 0.5*0.9 = 0.85
      expect(grade.toNumber()).toBeCloseTo(0.85);
    });

    test("simulate with some scores missing, actual submissions get penalties", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80), weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: today, dueDate: today },
        { assessmentId: "a2", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today }
      ];
      const simulated = [
        { assessmentId: "a2", simulatedScore: new Prisma.Decimal(70) }
      ];
      const grade = simulateFinalGrade(assessments, simulated);
      // a1: 80/100 * 0.5 = 0.4, a2 simulated 70/100 * 0.5 = 0.35 => total 0.75
      expect(grade.toNumber()).toBeCloseTo(0.75);
    });

    test("applies late penalty to non-simulated actual submission only", () => {
      const assessments: GradeComponent[] = [
        { assessmentId: "a1", score: new Prisma.Decimal(80), weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: new Date(today.getTime() + TWENTYFOUR_HOURS_IN_MS), dueDate: today },
        { assessmentId: "a2", score: null, weight: new Prisma.Decimal(0.5), maxScore: null, submissionDate: null, dueDate: today }
      ];
      const simulated = [
        { assessmentId: "a2", simulatedScore: new Prisma.Decimal(70) }
      ];
      const grade = simulateFinalGrade(assessments, simulated);
      // a1: 80 - 5% penalty from 100 = 75, weight 0.5 => 0.375
      // a2: simulated 70/100 * 0.5 = 0.35
      expect(grade.toNumber()).toBeCloseTo(0.725);
    });
  });
});
