import { Prisma } from "@prisma/client";
import { buildDashboardMetrics } from "../../../../src/domain/dashboard/computeDashboardMetrics";
import { rankAssessmentsByUrgency } from "../../../../src/domain/assessments/rankAssessmentsByUrgency";
import { detectDueDateCollisions } from "../../../../src/domain/assessments/detectDueDateCollisions";
import { deriveStatusFromDate } from "../../../../src/domain/assessments/deriveStatusFromDate";
import { AssessmentBackend } from "../../../../src/types/backendTypes";
import { AssessmentStatuses } from "@internal_package/shared";

jest.mock("../../../../src/domain/assessments/rankAssessmentsByUrgency");
jest.mock("../../../../src/domain/assessments/detectDueDateCollisions");
jest.mock("../../../../src/domain/assessments/deriveStatusFromDate");

const mockRank = rankAssessmentsByUrgency as jest.Mock;
const mockCollisions = detectDueDateCollisions as jest.Mock;
const mockStatus = deriveStatusFromDate as jest.Mock;

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

describe("buildDashboardMetrics", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockRank.mockImplementation(a => a);
    mockCollisions.mockReturnValue([]);
  });

  it("filters out graded assessments", () => {
    const graded = createAssessment("a1");
    const upcoming = createAssessment("a2");

    mockStatus
      .mockReturnValueOnce(AssessmentStatuses.GRADED)
      .mockReturnValueOnce(AssessmentStatuses.UPCOMING);

    buildDashboardMetrics([graded, upcoming], NOW);

    expect(mockRank).toHaveBeenCalledWith([upcoming], NOW);
  });

  it("counts assessments due within 7 and 14 days", () => {

    const a1 = createAssessment("a1", {
      dueDate: new Date("2025-01-05")
    });

    const a2 = createAssessment("a2", {
      dueDate: new Date("2025-01-10")
    });

    const a3 = createAssessment("a3", {
      dueDate: new Date("2025-01-20")
    });

    mockStatus.mockReturnValue(AssessmentStatuses.UPCOMING);

    const result = buildDashboardMetrics([a1, a2, a3], NOW);

    expect(result.stats.dueNext7Days).toBe(1);
    expect(result.stats.dueNext14Days).toBe(2);
  });

  it("sums total upcoming weight correctly", () => {

    const a1 = createAssessment("a1", {
      weight: new Prisma.Decimal(0.3)
    });

    const a2 = createAssessment("a2", {
      weight: new Prisma.Decimal(0.2)
    });

    mockStatus.mockReturnValue(AssessmentStatuses.UPCOMING);

    const result = buildDashboardMetrics([a1, a2], NOW);

    expect(result.stats.totalUpcomingWeight.toNumber()).toBeCloseTo(0.5);
  });

  it("identifies the highest weight upcoming assessment", () => {

    const a1 = createAssessment("a1", {
      weight: new Prisma.Decimal(0.1)
    });

    const a2 = createAssessment("a2", {
      weight: new Prisma.Decimal(0.4)
    });

    mockStatus.mockReturnValue(AssessmentStatuses.UPCOMING);

    const result = buildDashboardMetrics([a1, a2], NOW);

    expect(result.stats.highestWeightUpcoming?.assessmentId).toBe("a2");
  });

  it("lists all upcomingAssessments results", () => {

    const assessments = Array.from({ length: 15 }, (_, i) =>
      createAssessment(`a${i}`)
    );

    mockStatus.mockReturnValue(AssessmentStatuses.UPCOMING);

    mockRank.mockReturnValue(assessments);

    const result = buildDashboardMetrics(assessments, NOW);

    expect(result.upcomingAssessments.length).toBe(15);
  });

  it("detects busiest week window", () => {

    const a1 = createAssessment("a1", { dueDate: new Date("2025-01-01") });
    const a2 = createAssessment("a2", { dueDate: new Date("2025-01-02") });
    const a3 = createAssessment("a3", { dueDate: new Date("2025-01-03") });
    const a4 = createAssessment("a4", { dueDate: new Date("2025-02-01") });

    mockStatus.mockReturnValue(AssessmentStatuses.UPCOMING);

    const result = buildDashboardMetrics([a1, a2, a3, a4], NOW);

    expect(result.stats.busiestWeek?.assessmentCount).toBe(3);
    expect(result.stats.busiestWeek?.start).toEqual(new Date("2025-01-01"));
  });

  it("returns collisions from detectDueDateCollisions", () => {

    const a1 = createAssessment("a1", { dueDate: new Date("2025-01-01") });
    const a2 = createAssessment("a2", { dueDate: new Date("2025-01-01") });

    const collisions = [{
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-01T00:00:00Z",
        assessmentIds: ["a1", "a2"],
        count: 2,
    }];

    mockStatus.mockReturnValue(AssessmentStatuses.UPCOMING);
    mockCollisions.mockReturnValue(collisions);

    const result = buildDashboardMetrics([a1, a2], NOW);

    expect(result.collisions).toBe(collisions);
    expect(mockCollisions).toHaveBeenCalledWith([a1, a2]);
  });

  it("handles empty input", () => {

    const result = buildDashboardMetrics([], NOW);

    expect(result.upcomingAssessments).toEqual([]);
    expect(result.stats.dueNext7Days).toBe(0);
    expect(result.stats.dueNext14Days).toBe(0);
    expect(result.stats.highestWeightUpcoming).toBeNull();
    expect(result.stats.busiestWeek).toBeNull();
  });

});
