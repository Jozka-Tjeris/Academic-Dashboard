import { prismaMock } from "../mocks/mockPrismaSingleton";
import { getDashboardServices } from "../../src/modules/dashboard/dashboard.service";
import { buildDashboardMetrics } from "../../src/domain/dashboard/computeDashboardMetrics";
import { calculateCurrentGrade, calculateMaxPossibleGrade } from "../../src/domain/grade/gradeCalculator";
import { Prisma } from "@prisma/client";

jest.mock("../../src/domain/dashboard/computeDashboardMetrics");
jest.mock("../../src/domain/grade/gradeCalculator");

const mockMetrics = buildDashboardMetrics as jest.Mock;
const mockCurrentGrade = calculateCurrentGrade as jest.Mock;
const mockMaxGrade = calculateMaxPossibleGrade as jest.Mock;

const NOW = new Date("2026-03-10");

function createAssessment(id: string) {
  return {
    assessmentId: id,
    courseId: "c1",
    userId: "user1",
    title: "Assessment",
    description: null,
    dueDate: new Date("2026-03-15"),
    score: null,
    targetScore: null,
    weight: new Prisma.Decimal(0.25),
    maxScore: new Prisma.Decimal(100),
    submitted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

type CourseWithAssessments = Prisma.CourseGetPayload<{
    include: { assessments: true };
  }>;

describe("Dashboard Services", () => {

  let service: ReturnType<typeof getDashboardServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = getDashboardServices(prismaMock);
  });

  describe("getUserDashboard", () => {

    it("fetches courses with assessments", async () => {

      prismaMock.course.findMany.mockResolvedValue([]);

      mockMetrics.mockReturnValue({
        upcomingAssessments: [],
        stats: {},
        collisions: []
      });

      await service.getUserDashboard("user1");

      expect(prismaMock.course.findMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
        include: { assessments: true }
      });

    });

    it("passes all assessments to buildDashboardMetrics", async () => {

      const assessments = [createAssessment("a1"), createAssessment("a2")];

      const courseWithAssessments: CourseWithAssessments = {
        courseId: "c1",
        userId: "user1",
        name: "Math",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        assessments
      };

      prismaMock.course.findMany.mockResolvedValue([
        courseWithAssessments
      ]);

      mockMetrics.mockReturnValue({
        upcomingAssessments: [],
        stats: {},
        collisions: []
      });

      await service.getUserDashboard("user1", NOW);

      expect(mockMetrics).toHaveBeenCalledWith(assessments, NOW);

    });

    it("calculates grade summaries for each course", async () => {

      const assessments = [createAssessment("a1")];

      const courseWithAssessments: CourseWithAssessments = {
        courseId: "c1",
        userId: "user1",
        name: "Math",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        assessments
      };

      prismaMock.course.findMany.mockResolvedValue([
        courseWithAssessments
      ]);

      mockMetrics.mockReturnValue({
        upcomingAssessments: [],
        stats: {},
        collisions: []
      });

      mockCurrentGrade.mockReturnValue(new Prisma.Decimal(0.7));
      mockMaxGrade.mockReturnValue(new Prisma.Decimal(0.9));

      const result = await service.getUserDashboard("user1");

      expect(mockCurrentGrade).toHaveBeenCalledWith(assessments);
      expect(mockMaxGrade).toHaveBeenCalledWith(assessments);

      expect(result.courses[0]).toHaveProperty("gradeSummary");

    });

    it("returns workload metrics from domain function", async () => {

      prismaMock.course.findMany.mockResolvedValue([]);

      const metrics = {
        upcomingAssessments: [{ assessmentId: "a1" }],
        stats: { dueNext7Days: 2 },
        collisions: []
      };

      mockMetrics.mockReturnValue(metrics);

      const result = await service.getUserDashboard("user1");

      expect(result.workload.upcomingAssessments).toEqual(metrics.upcomingAssessments);
      expect(result.workload.stats).toEqual(metrics.stats);

    });

    it("returns collisions from metrics", async () => {

      prismaMock.course.findMany.mockResolvedValue([]);

      const metrics = {
        upcomingAssessments: [],
        stats: {},
        collisions: [{ date: new Date(), assessments: [] }]
      };

      mockMetrics.mockReturnValue(metrics);

      const result = await service.getUserDashboard("user1");

      expect(result.collisions).toEqual(metrics.collisions);

    });

    it("handles users with no courses", async () => {

      prismaMock.course.findMany.mockResolvedValue([]);

      mockMetrics.mockReturnValue({
        upcomingAssessments: [],
        stats: {},
        collisions: []
      });

      const result = await service.getUserDashboard("user1");

      expect(result.courses).toEqual([]);
      expect(result.workload.upcomingAssessments).toEqual([]);

    });

    it("uses current date when now is not provided", async () => {

      prismaMock.course.findMany.mockResolvedValue([]);

      mockMetrics.mockReturnValue({
        upcomingAssessments: [],
        stats: {},
        collisions: []
      });

      await service.getUserDashboard("user1");

      expect(mockMetrics).toHaveBeenCalled();
      expect(mockMetrics.mock.calls[0][1]).toBeInstanceOf(Date);

    });
  });
});
