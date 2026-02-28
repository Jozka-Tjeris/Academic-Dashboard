import { calculateCurrentGrade, calculateMaxPossibleGrade } from "../../../../src/domain/grade/gradeCalculator";
import { Assessment } from "@shared/types/types";
import { INVALID_GRADE } from "@shared/constants/constants";

describe("Grade Calculation Functions", () => {
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

  describe("calculateCurrentGrade", () => {
    test("returns correct grade when weights sum to 1", () => {
      const grade = calculateCurrentGrade(assessments);
      // a1: 80/100 * 0.4 = 0.32, a2: null => 0/100 * 0.6 = 0
      expect(grade).toBeCloseTo(0.32);
    });

    test("returns INVALID_GRADE if weights do not sum to 1", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: 0.1 }));
      const grade = calculateCurrentGrade(invalidAssessments);
      expect(grade).toBe(INVALID_GRADE);
    });
  });

  describe("calculateMaxPossibleGrade", () => {
    test("calculates grade assuming missing scores are max", () => {
      const grade = calculateMaxPossibleGrade(assessments);
      // a1: 80/100*0.4=0.32, a2: 100/100*0.6=0.6 => total 0.92
      expect(grade).toBeCloseTo(0.92);
    });

    test("returns INVALID_GRADE if weights invalid", () => {
      const invalidAssessments = assessments.map(a => ({ ...a, weight: 0.3 }));
      expect(calculateMaxPossibleGrade(invalidAssessments)).toBe(INVALID_GRADE);
    });
  });
});

describe("Grade Calculation Functions - Edge Cases", () => {
  describe("calculateCurrentGrade", () => {
    test("all scores null should return 0", () => {
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
      const grade = calculateCurrentGrade(assessments);
      expect(grade).toBe(0);
    });

    test("weights sum slightly off due to floating point", () => {
      const assessments: Assessment[] = [
        { assessmentId: "a1",    courseId: "c1",        title: "Test1", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: 80,      targetScore: null, 
          weight: 0.3333333,     latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        },
        { assessmentId: "a2",    courseId: "c1",        title: "Test2", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: 90,      targetScore: null, 
          weight: 0.6666667,     latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade).toBeCloseTo(0.8*0.3333333 + 0.9*0.6666667);
    });

    test("weight sum far off should return INVALID_GRADE", () => {
      const assessments: Assessment[] = [
        { assessmentId: "a1",    courseId: "c1",        title: "Test1", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: 80,      targetScore: null, 
          weight: 0.3,           latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        },
        { assessmentId: "a2",    courseId: "c1",        title: "Test2", description: null, 
          dueDate: new Date(),   status: "upcoming",    score: 90,      targetScore: null, 
          weight: 0.4,           latePenalty: null,     maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade).toBe(INVALID_GRADE);
    });

    test("zero weight assessments should not affect grade", () => {
      const assessments: Assessment[] = [
        { assessmentId: "a1",    courseId: "c1",      title: "Test1", description: null, 
          dueDate: new Date(),   status: "upcoming",  score: 80,      targetScore: null, 
          weight: 0,             latePenalty: null,   maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        },
        { assessmentId: "a2",    courseId: "c1",      title: "Test2", description: null, 
          dueDate: new Date(),   status: "upcoming",  score: 100,     targetScore: null, 
          weight: 1,             latePenalty: null,   maxScore: null, isSimulated: null,
          submitted: true,       createdAt: new Date(), updatedAt: new Date(),
        }
      ];
      const grade = calculateCurrentGrade(assessments);
      expect(grade).toBeCloseTo(1);
    });
  });

  describe("calculateMaxPossibleGrade", () => {
    test("all scores null should return 1 (max possible)", () => {
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
      const grade = calculateMaxPossibleGrade(assessments);
      expect(grade).toBe(1);
    });
  });
});
