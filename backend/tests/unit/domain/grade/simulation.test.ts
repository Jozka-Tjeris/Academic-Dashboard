import { Assessment } from "@shared/types/types";
import { simulateFinalGrade } from "../../../../src/domain/grade/simulation";
import { INVALID_GRADE } from "@shared/constants/constants";

describe("Grade Simulation Functions", () => {
  const assessments: Assessment[] = [
    {
      assessmentId: "a1",    courseId: "c1",        title: "Quiz",  description: null,
      dueDate: new Date(),   status: "upcoming",    score: 80,      targetScore: null,
      weight: 0.4,           latePenalty: null,     maxScore: null, isSimulated: null,
      submitted: true,       createdAt: new Date(), updatedAt: new Date(),
    },
    {
      assessmentId: "a2",    courseId: "c1",        title: "Exam",  description: null,
      dueDate: new Date(),   status: "upcoming",    score: null,    targetScore: null,
      weight: 0.6,           latePenalty: null,     maxScore: null, isSimulated: null,
      submitted: true,       createdAt: new Date(), updatedAt: new Date(),
    }
  ];

  describe("simulateFinalGrade", () => {
    test("applies simulated scores correctly", () => {
      const simulated = [{ assessmentId: "a2", simulatedScore: 90 }];
      const grade = simulateFinalGrade(assessments, simulated);
      // a1: 80/100*0.4=0.32, a2: 90/100*0.6=0.54 => total 0.86
      expect(grade).toBeCloseTo(0.86);
    });

    test("uses actual scores when no simulation provided", () => {
      const grade = simulateFinalGrade(assessments, []);
      // a1: 80/100*0.4=0.32, a2: null=>100/100*0.6=0.6
      expect(grade).toBeCloseTo(0.92);
    });

    test("returns INVALID_GRADE if weights invalid", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: 0.2 }));
      const grade = simulateFinalGrade(invalidAssessments, []);
      expect(grade).toBe(INVALID_GRADE);
    });
  });
});


describe("Grade Simulation - Edge Cases", () => {
  describe("simulateFinalGrade", () => {
    test("simulate all assessments with custom scores", () => {
      const assessments: Assessment[] = [
        { assessmentId: "a1",    courseId: "c1",        title: "Test1", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: 50,    targetScore: null, 
          weight: 0.5,           latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        },
        { assessmentId: "a2",    courseId: "c1",        title: "Test2", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: null,    targetScore: null, 
          weight: 0.5,           latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        }
      ];
      const simulated = [
        { assessmentId: "a1", simulatedScore: 80 },
        { assessmentId: "a2", simulatedScore: 90 }
      ];
      const grade = simulateFinalGrade(assessments, simulated);
      // 0.5*0.8 + 0.5*0.9 = 0.85
      expect(grade).toBeCloseTo(0.85);
    });

    test("simulate with some scores missing", () => {
      const assessments: Assessment[] = [
        { assessmentId: "a1",    courseId: "c1",        title: "Test1", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: null,    targetScore: null, 
          weight: 0.5,           latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        },
        { assessmentId: "a2",    courseId: "c1",        title: "Test2", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: null,    targetScore: null, 
          weight: 0.5,           latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        }
      ];
      const simulated = [
        { assessmentId: "a2", simulatedScore: 70 }
      ];
      const grade = simulateFinalGrade(assessments, simulated);
      // a1 null => 100, a2 simulated 70 => 1*0.5 + 0.7*0.5 = 0.85
      expect(grade).toBeCloseTo(0.85);
    });
  });
})