import { calculateUrgencyScore } from "@/domain/grade/urgency";
import { Assessment } from "@shared/types/types";

describe("Urgency", () => {
  const baseAssessment: Assessment = {
    assessmentId: "a1",              courseId: "c1",        title: "Test",  description: null,
    dueDate: new Date("2026-01-10"), status: "upcoming",    score: null,    targetScore: null,
    weight: 0.5,                     latePenalty: null,     maxScore: null, isSimulated: null,
    createdAt: new Date(),           updatedAt: new Date(),
  };

  describe("calculateUrgencyScore", () => {
    test("submitted assessment has zero urgency", () => {
      const assessment = { ...baseAssessment, score: 90 };
      const urgency = calculateUrgencyScore(
        assessment,
        new Date("2026-01-01")
      );
      expect(urgency).toBe(0);
    });

    test("upcoming assessment has positive urgency", () => {
      const urgency = calculateUrgencyScore(
        baseAssessment,
        new Date("2026-01-01")
      );
      expect(urgency).toBeGreaterThan(0);

      // An assignment due today should be more urgent than an assignment due in 9 days
      const urgencyToday = calculateUrgencyScore(
        baseAssessment,
        new Date("2026-01-10")
      );
      expect(urgencyToday).toBeGreaterThan(urgency);
    });

    test("overdue assessment has higher urgency", () => {
      const overdue = {
        ...baseAssessment,
        dueDate: new Date("2026-01-01")
      };

      const urgency = calculateUrgencyScore(
        overdue,
        new Date("2026-01-05")
      );

      expect(urgency).toBeGreaterThan(baseAssessment.weight);
    });
  });
});
