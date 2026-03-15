import { prismaMock } from "../mocks/mockPrismaSingleton";
import { getCourseServices } from "../../src/modules/courses/course.service";
import { Prisma } from "@prisma/client";
import { calculateRequiredScores } from "../../src/domain/grade/calculateRequiredScores";

const baseAssessments = [
  {
    userId: "user1",
    courseId: "c1",
    title: "Quiz",
    description: null,
    score: new Prisma.Decimal(80),
    targetScore: null,
    weight: new Prisma.Decimal(0.4),
    maxScore: null,
    submissionDate: new Date("2026-03-10"),
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date("2026-03-10"),
    dueDate: null,
  },
  {
    userId: "user1",
    courseId: "c2",
    title: "Exam",
    description: null,
    score: null,
    targetScore: null,
    weight: new Prisma.Decimal(0.3),
    maxScore: null,
    submissionDate: new Date("2026-03-10"),
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date("2026-03-10"),
    dueDate: null,
  },
  {
    userId: "user1",
    courseId: "c3",
    title: "Exam",
    description: null,
    score: null,
    targetScore: null,
    weight: new Prisma.Decimal(0.3),
    maxScore: null,
    submissionDate: null,
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date("2026-03-10"),
    dueDate: null,
  }
];

// Utility to clone and assign assessmentId + dueDate
const makeAssessment = (baseIndex: number, assessmentId: string, dueDate: string,
  score: number | null, maxScore: number, weight: number) => ({
  ...baseAssessments[baseIndex % baseAssessments.length],
  assessmentId,
  score: score ? new Prisma.Decimal(score) : null,
  maxScore: new Prisma.Decimal(maxScore),
  weight: new Prisma.Decimal(weight),
  dueDate: new Date(dueDate)
});

describe("Course Services", () => {
  type CourseWithAssessments = Prisma.CourseGetPayload<{
    include: { assessments: true };
  }>;
  let service: ReturnType<typeof getCourseServices>;

  beforeEach(() => {
    service = getCourseServices(prismaMock);
  });

  describe("createCourse", () => {
    it("creates course if no duplicate exists", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      prismaMock.course.create.mockResolvedValue({
        courseId: "course-1",
        userId: "user-1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: "#ffffff",
      });

      const result = await service.createCourse({
        userId: "user-1",
        name: "Calculus 101",
      });

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith({
        where: { userId: "user-1", name: "Calculus 101" },
      });

      expect(result.name).toBe("Calculus 101");
    });

    it("throws 409 if duplicate exists", async () => {
      prismaMock.course.findFirst.mockResolvedValue({
        courseId: "course-1",
        userId: "user-1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: "#ffffff",
      });

      await expect(
        service.createCourse({
          userId: "user-1",
          name: "Calculus 101",
        })
      ).rejects.toMatchObject({ status: 409 });

      expect(prismaMock.course.create).not.toHaveBeenCalled();
    });
  });

  describe("getCourseForUser", () => {
    it("returns courses with grade summary", async () => {
      const mockCourse: CourseWithAssessments[] = [{
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2025"),
        updatedAt: new Date(),
        assessments: [],
        color: "#ffffff",
      },
      {
        courseId: "course2",
        userId: "user1",
        name: "Calculus 102",
        description: "",
        createdAt: new Date("2026"),
        updatedAt: new Date(),
        assessments: [],
        color: "#ffffff",
      }];

      prismaMock.course.findMany.mockResolvedValue(mockCourse);

      const result = await service.getCoursesForUser("user1");

      expect(prismaMock.course.findMany).toHaveBeenCalled();
      result.map(r => {
        expect(r).toHaveProperty("gradeSummary");
      });
    });

    it("throws 404 if course not found", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.getCourseById("user1", "bad")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("getCourseById", () => {
    it("returns course with grade summary", async () => {
      const mockCourse: CourseWithAssessments = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        assessments: [],
        color: "#ffffff",
      };

      prismaMock.course.findFirst.mockResolvedValue(mockCourse);

      const result = await service.getCourseById("user1", "course1");

      expect(prismaMock.course.findFirst).toHaveBeenCalled();
      expect(result).toHaveProperty("gradeSummary");
    });

    it("throws 404 if course not found", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.getCourseById("user1", "bad")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("updateCourse", () => {
    it("updates a course when it exists", async () => {
      const existingCourse = {
        courseId: "course1",
        userId: "user1",
        name: "Old Name",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: "#ffffff",
      };

      prismaMock.course.findFirst.mockResolvedValue(existingCourse);

      prismaMock.course.update.mockResolvedValue({
        ...existingCourse,
        name: "New Name",
      });

      const result = await service.updateCourse("user1", "course1", {
        name: "New Name",
      });

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith({
        where: { courseId: "course1", userId: "user1" },
      });

      expect(prismaMock.course.update).toHaveBeenCalledWith({
        where: { courseId: "course1", userId: "user1" },
        data: { name: "New Name" },
      });

      expect(result.name).toBe("New Name");
    });

    it("throws 404 if course not found", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.updateCourse("user1", "bad-course", { name: "New Name" })
      ).rejects.toMatchObject({ status: 404 });

      expect(prismaMock.course.update).not.toHaveBeenCalled();
    });

    it("throws 400 if immutable field is updated", async () => {
      prismaMock.course.findFirst.mockResolvedValue({
        courseId: "course1",
        userId: "user1",
        name: "Old Name",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: "#ffffff",
      });

      await expect(
        service.updateCourse("user1", "course1", {
          courseId: "new-id",
        })
      ).rejects.toMatchObject({ status: 400 });

      expect(prismaMock.course.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteCourse", () => {
    it("deletes course if it exists and belongs to user", async () => {
      const courseToDelete = {
        courseId: "course-1",
        userId: "user-1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: "#ffffff",
      };
      prismaMock.course.findFirst.mockResolvedValue(courseToDelete);

      prismaMock.course.delete.mockResolvedValue(courseToDelete);

      const result = await service.deleteCourse("user1", "course1");

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith({
        where: { courseId: "course1", userId: "user1" },
      });

      expect(prismaMock.course.delete).toHaveBeenCalledWith({
        where: { courseId: "course1", userId: "user1" },
      });

      expect(result).toEqual({
        message: "Course deleted successfully",
      });
    });

    it("throws 404 if course not found", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteCourse("user1", "invalid")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("simulateCourseGrade", () => {
    it("returns calculated course grade", async () => {
      const assessments = [
        makeAssessment(0, "a1", "2026-03-10", 0, 100, 0.5),
        makeAssessment(1, "a2", "2026-03-10", 90, 100, 0.5),
      ];

      const simulations = [
        { assessmentId: "a1", simulatedScore: 80 }
      ];

      prismaMock.assessment.findMany.mockResolvedValue(assessments);

      const result = await service.simulateCourseGrade("course1", simulations);

      expect(result.currentGrade.toNumber()).toBeCloseTo(0.45);
      expect(result.maxPossibleGrade.toNumber()).toBeCloseTo(0.95);
      expect(result.simulatedFinalGrade.toNumber()).toBeCloseTo(0.85);
    });

    it("handles missing scores", async () => {
      const assessments = [
        makeAssessment(0, "a1", "2026-03-10", null, 100, 0.5),
        makeAssessment(1, "a2", "2026-03-10", 90, 100, 0.5),
      ];

      const simulations = [
        { assessmentId: "a1", simulatedScore: 80 }
      ];

      prismaMock.assessment.findMany.mockResolvedValue(assessments);

      const result = await service.simulateCourseGrade("course1", simulations);

      expect(result.currentGrade.toNumber()).toBeCloseTo(0.45);
      expect(result.maxPossibleGrade.toNumber()).toBeCloseTo(0.95);
      expect(result.simulatedFinalGrade.toNumber()).toBeCloseTo(0.85);
    });

    it("throws 404 for missing assessments", async () => {
      prismaMock.assessment.findMany.mockResolvedValue([]);

      await expect(service.simulateCourseGrade("course1", []))
      .rejects
      .toMatchObject({ status: 404 });
    })

    it("throws 400 for bad simulated assessment data", async () => {
      const assessments = [
        makeAssessment(0, "a1", "", 0, 100, 0.5),
        makeAssessment(1, "a2", "", 90, 100, 0.5),
      ];

      const simulations = [
        { assessmentId: "a-bad", simulatedScore: 80 }
      ];

      prismaMock.assessment.findMany.mockResolvedValue(assessments);

      await expect(service.simulateCourseGrade("course1", simulations))
      .rejects
      .toMatchObject({ status: 400 });
    });
  });

  describe("getCourseAnalytics", () => {
    it("returns grade statistics", async () => {
      const assessments = [
        makeAssessment(0, "a1", "2026-03-15", 80, 100, 0.25),
        makeAssessment(1, "a2", "2026-03-15", 90, 100, 0.5),
        makeAssessment(0, "a3", "2026-03-15", null, 100, 0.25),
      ];

      const courseWithAssessments: CourseWithAssessments = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
        assessments,
        color: "#ffffff",
      };

      prismaMock.course.findFirst.mockResolvedValue(courseWithAssessments);
      prismaMock.assessment.findMany.mockResolvedValue(assessments);

      const result = await service.getCourseAnalytics("course1", "user1", new Date("2026-03-10"));

      expect(result.currentGrade.toNumber()).toBeCloseTo(0.65);
      expect(result.maxPossibleGrade.toNumber()).toBeCloseTo(0.90);
    })

    it("returns workload statistics", async () => {
      const assessments = [
        makeAssessment(0, "a1", "2026-03-15", 80, 100, 0.25), //graded
        makeAssessment(1, "a2", "2026-03-15", null, 100, 0.0), //submitted
        makeAssessment(2, "a3", "2026-03-10", null, 100, 0.25), //in24hrs
        makeAssessment(2, "a4", "2026-03-15", null, 100, 0.25), //pending
        makeAssessment(2, "a5", "2026-03-01", null, 100, 0.25), //overdue
      ];

      const courseWithAssessments: CourseWithAssessments = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
        assessments,
        color: "#ffffff",
      };

      prismaMock.course.findFirst.mockResolvedValue(courseWithAssessments);
      prismaMock.assessment.findMany.mockResolvedValue(assessments);

      const result = await service.getCourseAnalytics("course1", "user1", new Date("2026-03-10"));
      expect(result.assessmentCounts).toMatchObject({
        total: 5,
        submitted: 1,
        graded: 1,
        in24hrs: 1,
        pending: 1,
        overdue: 1,
      });
      expect(result.urgency.totalUrgency.toNumber()).toBeGreaterThan(0);
      expect(result.urgency.averageUrgency.toNumber()).toBeGreaterThan(0);
      expect(result.urgency.topAssessments.length).toBe(4);
      expect(result.urgency.topAssessments[0].assessmentId).toEqual("a5");
      expect(result.urgency.topAssessments[1].assessmentId).toEqual("a3");
      expect(result.urgency.topAssessments[2].assessmentId).toEqual("a4");
    })

    it("throws 404 for missing course", async () => {
      prismaMock.assessment.findMany.mockResolvedValue([]);

      await expect(service.getCourseAnalytics("course1", "user1"))
      .rejects
      .toMatchObject({ status: 404 });
    });
  });

  describe("getCourseDashboard", () => {
    it("aggregates analytics and urgency ranking", async () => {
      const assessments = [
        makeAssessment(0, "a1", "2026-03-15", 80, 100, 0.25), //graded
        makeAssessment(1, "a2", "2026-03-15", null, 100, 0.0), //submitted
        makeAssessment(2, "a3", "2026-03-10", null, 100, 0.25), //in24hrs
        makeAssessment(2, "a4", "2026-03-25", null, 100, 0.25), //pending
        makeAssessment(2, "a5", "2026-03-01", null, 100, 0.25), //overdue
      ];

      const courseWithAssessments: CourseWithAssessments = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
        assessments,
        color: "#ffffff",
      };

      const courseWithAssessmentsAndGradeSummary = {
        ...courseWithAssessments,
        gradeSummary: {
          currentGrade: new Prisma.Decimal(0.2),
          maxPossibleGrade: new Prisma.Decimal(0.95),
        }
      }

      prismaMock.course.findFirst.mockResolvedValue(courseWithAssessments);

      const result = await service.getCourseDashboard("course1", "user1", new Date("2026-03-10"));

      expect(result).toHaveProperty("workload");
      expect(result).toHaveProperty("collisions");
      expect(result).toHaveProperty("course");

      expect(result.course).toEqual(courseWithAssessmentsAndGradeSummary);
      expect(result.workload.upcomingAssessments.length).toEqual(4);
      expect(result.workload.stats).toMatchObject({
        dueNext7Days: 3,
        dueNext14Days: 3,
        totalUpcomingWeight: new Prisma.Decimal(0.75),
        highestWeightUpcoming: {
          assessmentId: "a3",
          courseId: "c3",
          createdAt: new Date("2026-03-10"),
          description: null,
          dueDate: new Date("2026-03-10"),
          maxScore: new Prisma.Decimal(100),
          score: null,
          submissionDate: null,
          targetScore: null,
          title: "Exam",
          updatedAt: new Date("2026-03-10"),
          userId: "user1",
          weight: new Prisma.Decimal(0.25),
        },
        busiestWeek: {
          assessmentCount: 2,
          end: new Date("2026-03-17"),
          start: new Date("2026-03-10"),
        },
      });
    });

    it("handles courses with no assessments", async () => {
      const course: CourseWithAssessments = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
        assessments: [],
        color: "#ffffff",
      };

      prismaMock.course.findFirst.mockResolvedValue(course);
      prismaMock.assessment.findMany.mockResolvedValue([]);

      const result = await service.getCourseDashboard("course1", "user1");

      expect(result.course.gradeSummary).toEqual({
        "currentGrade": new Prisma.Decimal(NaN), 
        "maxPossibleGrade": new Prisma.Decimal(NaN)
      });
    });

    it("throws 404 for missing course", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(service.getCourseDashboard("course1", "user1"))
      .rejects
      .toMatchObject({ status: 404 });
    });
  });

  describe("calculateGradeGoal", () => {
    it("returns required scores for target grade", async () => {
      const assessments = [
        {
          assessmentId: "a1",
          courseId: "course1",
          userId: "user1",
          title: "Midterm",
          description: null,
          dueDate: new Date("2026-03-15"),
          createdAt: new Date("2026-03-10"),
          updatedAt: new Date("2026-03-10"),
          weight: new Prisma.Decimal(0.4),
          maxScore: new Prisma.Decimal(100),
          score: new Prisma.Decimal(80),
          submissionDate: null,
          targetScore: null,
        },
        {
          assessmentId: "a2",
          courseId: "course1",
          userId: "user1",
          title: "Final",
          description: null,
          dueDate: new Date("2026-04-10"),
          createdAt: new Date("2026-03-10"),
          updatedAt: new Date("2026-03-10"),
          weight: new Prisma.Decimal(0.6),
          maxScore: new Prisma.Decimal(100),
          score: null,
          submissionDate: null,
          targetScore: null,
        },
      ];

      const course = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
        color: "#ffffff",
        assessments,
      };

      prismaMock.course.findFirst.mockResolvedValue(course);

      const result = await service.calculateGradeGoal(
        "user1",
        "course1",
        0.85
      );

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith({
        where: {
          courseId: "course1",
          userId: "user1",
        },
        include: {
          assessments: true,
        },
      });

      expect(result.possible).toBe(true);
    });

    it("handles courses with no assessments", async () => {
      const course = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
        color: "#ffffff",
        assessments: [],
      };

      prismaMock.course.findFirst.mockResolvedValue(course);

      const result = await service.calculateGradeGoal(
        "user1",
        "course1",
        0.9
      );

      expect(result.possible).toBe(false);
    });

    it("throws 404 if course not found", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.calculateGradeGoal("user1", "course1", 0.9)
      ).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});
