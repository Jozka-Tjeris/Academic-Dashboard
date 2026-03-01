import { prismaMock } from "../mocks/mockPrismaSingleton";
import { getCourseServices } from "../../src/modules/courses/course.service";
import { Prisma } from "@prisma/client";

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
        updatedAt: new Date()
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
        updatedAt: new Date()
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
      },
      {
        courseId: "course2",
        userId: "user1",
        name: "Calculus 102",
        description: "",
        createdAt: new Date("2026"),
        updatedAt: new Date(),
        assessments: [],
      }];

      prismaMock.course.findMany.mockResolvedValue(mockCourse);

      const result = await service.getCoursesForUser("user1");

      expect(prismaMock.course.findMany).toHaveBeenCalled();
      result.map(r => {
        expect(r).toHaveProperty("gradeSummary");
      });
    });

    it("throws 422 if assessment status is invalid", async () => {
      const mockCourse: CourseWithAssessments[] = [{
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2025"),
        updatedAt: new Date(),
        assessments: [
          {
            courseId: "course1",
            userId: "user1",
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            assessmentId: "a1",
            title: "asdf",
            dueDate: new Date(),
            status: "invalid-type-here" as any,
            score: null,
            targetScore: null,
            weight: new Prisma.Decimal(0),
            latePenalty: null,
            maxScore: new Prisma.Decimal(100),
            isSimulated: null,
            submitted: false
          }
        ],
      }];

      prismaMock.course.findMany.mockResolvedValue(mockCourse);

      await expect(service.getCoursesForUser("user1"))
        .rejects.toMatchObject({ status: 422 });

      expect(prismaMock.course.findMany).toHaveBeenCalled();
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
      };

      prismaMock.course.findFirst.mockResolvedValue(mockCourse);

      const result = await service.getCourseById("user1", "course1");

      expect(prismaMock.course.findFirst).toHaveBeenCalled();
      expect(result).toHaveProperty("gradeSummary");
    });

    it("throws 422 if assessment status is invalid", async () => {
      const mockCourse: CourseWithAssessments = {
        courseId: "course1",
        userId: "user1",
        name: "Calculus 101",
        description: "",
        createdAt: new Date("2025"),
        updatedAt: new Date(),
        assessments: [
          {
            courseId: "course1",
            userId: "user1",
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            assessmentId: "a1",
            title: "asdf",
            dueDate: new Date(),
            status: "invalid-type-here" as any,
            score: null,
            targetScore: null,
            weight: new Prisma.Decimal(0),
            latePenalty: null,
            maxScore: new Prisma.Decimal(100),
            isSimulated: null,
            submitted: false
          }
        ],
      };

      prismaMock.course.findFirst.mockResolvedValue(mockCourse);

      await expect(service.getCourseById("user1", "course1"))
        .rejects.toMatchObject({ status: 422 });

      expect(prismaMock.course.findFirst).toHaveBeenCalled();
    });

    it("throws 404 if course not found", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.getCourseById("user1", "bad")
      ).rejects.toMatchObject({ status: 404 });
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
        updatedAt: new Date()
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
});
