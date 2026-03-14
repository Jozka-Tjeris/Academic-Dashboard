import { AssessmentWithCourseName } from "../../../../src/types/backendTypes";
import { detectDueDateCollisions } from "../../../../src/domain/assessments/detectDueDateCollisions";
import { Prisma } from "@prisma/client";

// Reusable base assessments
const baseAssessments: AssessmentWithCourseName[] = [
  {
    courseId: "c1",
    assessmentId: "a1",
    title: "Quiz",
    description: null,
    score: new Prisma.Decimal(80),
    targetScore: null,
    weight: new Prisma.Decimal(0.4),
    maxScore: null,
    submissionDate: new Date(),
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    course: {
      name: "Course1"
    }
  },
  {
    courseId: "c2",
    assessmentId: "a2",
    title: "Exam",
    description: null,
    score: null,
    targetScore: null,
    weight: new Prisma.Decimal(0.3),
    maxScore: null,
    submissionDate: new Date(),
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    course: {
      name: "Course2"
    }
  }
];

// Utility to clone and assign assessmentId + dueDate
const makeAssessment = (baseIndex: number, assessmentId: string, dueDate: string): AssessmentWithCourseName => ({
  ...baseAssessments[baseIndex % baseAssessments.length],
  assessmentId,
  dueDate: new Date(dueDate)
});

describe("detectDueDateCollisions", () => {
  it("returns empty array if no assessments", () => {
    expect(detectDueDateCollisions([])).toEqual([]);
  });

  it("returns empty array if only one assessment", () => {
    const assessments = [makeAssessment(0, "a1", "2026-04-10")];
    expect(detectDueDateCollisions(assessments)).toEqual([]);
  });

  it("detects same-day collision", () => {
    const assessments = [
      makeAssessment(0, "a1", "2026-04-10"),
      makeAssessment(1, "a2", "2026-04-10"),
      makeAssessment(0, "a3", "2026-04-11"),
    ];
    const result = detectDueDateCollisions(assessments, 0);
    expect(result.length).toBe(1);

    const resultIds = result[0].assessmentIdAndLabels.map(a => a.assessmentId);
    expect(resultIds).toEqual(["a1","a2"]);
    expect(new Date(result[0].startDate).toISOString()).toBe(new Date("2026-04-10").toISOString());
  });

  it("detects multi-day collision within window", () => {
    const assessments = [
      makeAssessment(0, "a1", "2026-04-10"),
      makeAssessment(1, "a2", "2026-04-10"),
      makeAssessment(0, "a3", "2026-04-11"),
      makeAssessment(1, "a4", "2026-04-14"),
    ];
    const result = detectDueDateCollisions(assessments, 1);
    expect(result.length).toBe(1);
    const resultIds = result[0].assessmentIdAndLabels.map(a => a.assessmentId);
    expect(resultIds).toEqual(["a1","a2","a3"]);
    expect(new Date(result[0].startDate).toISOString()).toBe(new Date("2026-04-10").toISOString());
    expect(new Date(result[0].endDate).toISOString()).toBe(new Date("2026-04-11").toISOString());
  });

  it("detects multiple collision clusters", () => {
    const assessments = [
      makeAssessment(0, "a1", "2026-04-10"),
      makeAssessment(1, "a2", "2026-04-10"),
      makeAssessment(0, "a3", "2026-04-11"),
      makeAssessment(1, "a4", "2026-04-14"),
      makeAssessment(0, "a5", "2026-04-14"),
    ];
    const result = detectDueDateCollisions(assessments, 0);
    expect(result.length).toBe(2);
    const resultIds = result[0].assessmentIdAndLabels.map(a => a.assessmentId);
    expect(resultIds).toEqual(["a1","a2"]);
    const resultIds2 = result[1].assessmentIdAndLabels.map(a => a.assessmentId);
    expect(resultIds2).toEqual(["a4","a5"]);
  });

  it("handles unsorted input array", () => {
    const assessments = [
      makeAssessment(0, "a3", "2026-04-11"),
      makeAssessment(0, "a1", "2026-04-10"),
      makeAssessment(1, "a2", "2026-04-10"),
    ];
    const result = detectDueDateCollisions(assessments, 0);
    expect(result.length).toBe(1);
    const resultIds = result[0].assessmentIdAndLabels.map(a => a.assessmentId);
    expect(resultIds).toEqual(["a1","a2"]);
  });

  it("handles all assessments on same day", () => {
    const assessments = [
      makeAssessment(0, "a1", "2026-04-10"),
      makeAssessment(1, "a2", "2026-04-10"),
      makeAssessment(0, "a3", "2026-04-10"),
      makeAssessment(1, "a4", "2026-04-10"),
    ];
    const result = detectDueDateCollisions(assessments, 0);
    expect(result.length).toBe(1);
    expect(result[0].count).toBe(4);
    const resultIds = result[0].assessmentIdAndLabels.map(a => a.assessmentId);
    expect(resultIds).toEqual(["a1","a2","a3","a4"]);
  });

  it("returns empty array if no assessments within window", () => {
    const assessments = [
      makeAssessment(0, "a1", "2026-04-10"),
      makeAssessment(1, "a2", "2026-04-13"),
      makeAssessment(0, "a3", "2026-04-20"),
    ];
    const result = detectDueDateCollisions(assessments, 1);
    expect(result).toEqual([]);
  });

});
