import { Prisma } from "@prisma/client"
import { rankAssessmentsByUrgency } from "../../../../src/domain/assessments/rankAssessmentsByUrgency"
import { calculateUrgencyScore } from "../../../../src/domain/assessments/calculateUrgencyScore"
import { AssessmentBackend } from "../../../../src/types/backendTypes"

jest.mock("../../../../src/domain/assessments/calculateUrgencyScore");

const mockCalculateUrgencyScore = calculateUrgencyScore as jest.Mock;

const NOW = new Date("2025-01-01T00:00:00Z");

function createAssessment(
  id: string,
  overrides: Partial<AssessmentBackend> = {}
): AssessmentBackend {
  return {
    assessmentId: id,
    courseId: "course-1",
    title: `Assessment ${id}`,
    description: null,
    dueDate: new Date("2025-02-01T00:00:00Z"),
    score: null,
    targetScore: null,
    maxScore: new Prisma.Decimal(100),
    weight: new Prisma.Decimal(0.25),
    submissionDate: null,
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
    ...overrides,
  };
}

describe("rankAssessmentsByUrgency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sorts assessments by urgency descending", () => {
    const a1 = createAssessment("a1");
    const a2 = createAssessment("a2");

    mockCalculateUrgencyScore
      .mockReturnValueOnce(new Prisma.Decimal(0.2))
      .mockReturnValueOnce(new Prisma.Decimal(0.9));

    const result = rankAssessmentsByUrgency([a1, a2], NOW);

    expect(result[0].assessmentId).toBe("a2");
    expect(result[1].assessmentId).toBe("a1");
  });

  it("handles Decimal comparisons correctly", () => {
    const a1 = createAssessment("a1");
    const a2 = createAssessment("a2");

    mockCalculateUrgencyScore
      .mockReturnValueOnce(new Prisma.Decimal("0.451"))
      .mockReturnValueOnce(new Prisma.Decimal("0.45"));

    const result = rankAssessmentsByUrgency([a1, a2], NOW);

    expect(result[0].assessmentId).toBe("a1");
  });

  it("maintains stable ordering when urgency values are equal", () => {
    const a1 = createAssessment("a1");
    const a2 = createAssessment("a2");

    mockCalculateUrgencyScore
      .mockReturnValueOnce(new Prisma.Decimal(0.5))
      .mockReturnValueOnce(new Prisma.Decimal(0.5));

    const result = rankAssessmentsByUrgency([a1, a2], NOW);

    expect(result[0].assessmentId).toBe("a1");
    expect(result[1].assessmentId).toBe("a2");
  });

  it("adds urgency property to each assessment", () => {
    const a1 = createAssessment("a1");

    mockCalculateUrgencyScore.mockReturnValue(new Prisma.Decimal(0.7));

    const result = rankAssessmentsByUrgency([a1], NOW);

    expect(result[0]).toHaveProperty("urgency");
    expect(result[0].urgency).toBeInstanceOf(Prisma.Decimal);
  });

  it("returns empty array when given no assessments", () => {
    const result = rankAssessmentsByUrgency([], NOW);

    expect(result).toEqual([]);
  });

  it("passes the provided 'now' value to calculateUrgencyScore", () => {
    const a1 = createAssessment("a1");

    mockCalculateUrgencyScore.mockReturnValue(new Prisma.Decimal(0.3));

    rankAssessmentsByUrgency([a1], NOW);

    expect(mockCalculateUrgencyScore).toHaveBeenCalledWith(a1, NOW);
  });
});
