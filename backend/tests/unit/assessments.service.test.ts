import { Prisma } from "@prisma/client";
import { prismaMock } from "../mocks/mockPrismaSingleton";
import { getAssessmentServices } from "../../src/modules/assessments/assessment.service";
import { AssessmentStatuses } from "@internal_package/shared";
import { HttpError } from "../../src/utils/httpError";

describe("Assessment Service", () => {
  let service: ReturnType<typeof getAssessmentServices>;
  type AssessmentWithCourse = Prisma.AssessmentGetPayload<{
    include: { course: true };
  }>;

  beforeEach(() => {
    service = getAssessmentServices(prismaMock);
  });

  describe("createAssessment", () => {
    it("creates assessment if weight valid", async () => {
      prismaMock.course.findFirst.mockResolvedValue({
        courseId: "course1",
        userId: "user1",
        name: "",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      prismaMock.assessment.aggregate.mockResolvedValue({
        _sum: { weight: new Prisma.Decimal(0.2) },
        _count: undefined,
        _avg: undefined,
        _min: undefined,
        _max: undefined
      });

      prismaMock.assessment.create.mockResolvedValue({
        assessmentId: "assess1",
        weight: new Prisma.Decimal(0.3),
        courseId: "",
        userId: "",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "",
        dueDate: new Date(),
        score: null,
        targetScore: null,
        maxScore: new Prisma.Decimal(100),
        submissionDate: null,
      });

      const result = await service.createAssessmentForCourse({
        userId: "user1",
        courseId: "course1",
        title: "Midterm",
        dueDate: new Date(),
        weight: 0.3,
      });

      expect(result.assessmentId).toBe("assess1");
    });

    it("throws if total weight exceeds 1", async () => {
      prismaMock.course.findFirst.mockResolvedValue({
        courseId: "course1",
        userId: "user1",
        name: "",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      prismaMock.assessment.aggregate.mockResolvedValue({
        _sum: { weight: new Prisma.Decimal(0.9) },
        _count: undefined,
        _avg: undefined,
        _min: undefined,
        _max: undefined
      });

      await expect(
        service.createAssessmentForCourse({
          userId: "user1",
          courseId: "course1",
          title: "Final",
          dueDate: new Date(),
          weight: 0.2,
        })
      ).rejects.toMatchObject({ status: 400 });
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

      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "assess1",
        weight: new Prisma.Decimal(0.3),
        courseId: "course-1",
        userId: "user-1",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "",
        dueDate: new Date(),
        score: null,
        targetScore: null,
        maxScore: new Prisma.Decimal(100),
        submissionDate: null,
      });

      await expect(
        service.createAssessmentForCourse({
          userId: "user1",
          courseId: "course1",
          title: "Final",
          dueDate: new Date(),
          weight: 0.2,
        })
      ).rejects.toMatchObject({ status: 409 });

      expect(prismaMock.assessment.create).not.toHaveBeenCalled();
      expect(prismaMock.assessment.aggregate).not.toHaveBeenCalled();
    });

    it("throws 404 if not found", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.createAssessmentForCourse({
          userId: "user1",
          courseId: "course1",
          title: "Final",
          dueDate: new Date(),
          weight: 0.2,
        })
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("updateAssessment", () => {
    it("updates score successfully", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "a1",
        userId: "user1",
        maxScore: new Prisma.Decimal(100),
        courseId: "course1",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "",
        dueDate: new Date(),
        score: null,
        targetScore: null,
        weight: new Prisma.Decimal(0),
        submissionDate: null,
      });

      prismaMock.assessment.update.mockResolvedValue({
        assessmentId: "a1",
        score: new Prisma.Decimal(80),
        description: null,
        weight: new Prisma.Decimal(0),
        targetScore: null,
        maxScore: new Prisma.Decimal(100),
        title: "",
        dueDate: new Date(),
        submissionDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        courseId: "",
        userId: ""
      });

      const result = await service.updateAssessment({
        userId: "user1",
        assessmentId: "a1",
        updates: {
          score: 80,
        }
      });

      expect(result.score?.toNumber()).toBe(80);
    });

    it("throws if score exceeds maxScore", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "a1",
        userId: "user1",
        maxScore: new Prisma.Decimal(50),
        courseId: "",
        title: "",
        description: null,
        dueDate: new Date(),
        score: null,
        targetScore: null,
        weight: new Prisma.Decimal(0),
        submissionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          updates: {
            score: 80,
          }
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws if score is negative", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "a1",
        userId: "user1",
        maxScore: new Prisma.Decimal(50),
        courseId: "",
        title: "",
        description: null,
        dueDate: new Date(),
        score: null,
        targetScore: null,
        weight: new Prisma.Decimal(0),
        submissionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          updates: {
            score: -80,
          }
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws if score already exists", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "a1",
        userId: "user1",
        maxScore: new Prisma.Decimal(50),
        courseId: "",
        title: "",
        description: null,
        dueDate: new Date(),
        score: new Prisma.Decimal(80),
        targetScore: null,
        weight: new Prisma.Decimal(0),
        submissionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          updates: {
            score: -80,
          }
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws 404 if not found", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          updates: {
            score: 80,
          }
        })
      ).rejects.toMatchObject({ status: 404 });
    });

    const existingAssessment = {
      assessmentId: "a1",
      userId: "user1",
      maxScore: new Prisma.Decimal(100),
      courseId: "course1",
      title: "",
      description: null,
      dueDate: new Date(),
      score: null,
      targetScore: null,
      weight: new Prisma.Decimal(0),
      submissionDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it("updates allowed fields successfully", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(existingAssessment);

      const updated = { ...existingAssessment, title: "Updated Title" };

      prismaMock.assessment.update.mockResolvedValue(updated);

      const result = await service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          updates: {
            title: "Updated Title",
          }
        });

      expect(result.title).toBe("Updated Title")
    });

    it("does not mutate immutable fields", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(existingAssessment);
      prismaMock.assessment.update.mockResolvedValue(existingAssessment);

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          updates: {
            assessmentId: "evil-change",
          }
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("sets submitted=true when score is provided", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(existingAssessment);
      prismaMock.assessment.update.mockResolvedValue({
        ...existingAssessment,
        score: new Prisma.Decimal(85),
        submissionDate: new Date(),
      });

      const result = await service.updateAssessment({
        userId: "user1",
        assessmentId: "a1",
        updates: {
          score: 80,
        }
      });

      expect(result).not.toBe(HttpError);
      expect(result.submissionDate).not.toBe(null)
    });

    it("does not set submitted when score is null", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(existingAssessment);
      prismaMock.assessment.update.mockResolvedValue(existingAssessment);

      const result = await service.updateAssessment({
        userId: "user1",
        assessmentId: "a1",
        updates: {
          score: null,
        }
      });

      expect(result.submissionDate).toBe(null);
    });
  });

  describe("deleteAssessment", () => {
    it("deletes assessment if exists", async () => {
      const mockAssessment = {
        assessmentId: "a1",
        courseId: "course1",
        userId: "user1",
        title: "",
        description: null,
        dueDate: new Date(),
        score: null,
        targetScore: null,
        weight: new Prisma.Decimal(0),
        maxScore: new Prisma.Decimal(100),
        submissionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.assessment.findFirst.mockResolvedValue(mockAssessment);

      prismaMock.assessment.delete.mockResolvedValue(mockAssessment);

      const result = await service.deleteAssessment(
        "user1",
        "a1"
      );

      expect(result.message).toBe(
        "Assessment deleted successfully"
      );
    });

    it("throws 404 if not found", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteAssessment("user1", "bad")
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("getAssessmentById", () => {
    it("returns assessment when found", async () => {
      const assessment = {
        assessmentId: "a1",
        courseId: "course1",
        userId: "user1",
        title: "",
        description: null,
        dueDate: new Date(),
        score: new Prisma.Decimal(80),
        targetScore: null,
        weight: new Prisma.Decimal(0),
        maxScore: new Prisma.Decimal(100),
        submissionDate: new Date(),
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
      }
      const assessmentWithCourse: AssessmentWithCourse = {
        ...assessment,
        course: {
          courseId: "course1",
          name: "courseName",
          userId: "user1",
          description: null,
          createdAt: new Date("2026-03-10"),
          updatedAt: new Date("2026-03-10"),
        },
      }

      const resShape = {
        assessment: {
          ...assessment,
        },
        course: {
          courseId: "course1",
          name: "courseName",
        },
        derived: {
          status: AssessmentStatuses.GRADED,
          urgencyScore: new Prisma.Decimal(0),
        },
      }

      prismaMock.assessment.findUniqueOrThrow.mockResolvedValue(assessmentWithCourse);

      const result = await service.getAssessmentById("a1", "user1");

      expect(result).toEqual(resShape);
      expect(prismaMock.assessment.findUniqueOrThrow).toHaveBeenCalled();
    })

    it("throws 404 when assessment does not exist", async () => {
      prismaMock.assessment.findUniqueOrThrow.mockRejectedValue((
        new HttpError(404, 'Assessment not found')
      ));

      await expect(service.getAssessmentById("missing", "user1"))
        .rejects
        .toThrow('Assessment not found');
    })
  })

  describe("getAssessmentCollisions", () => {
    it("returns empty array when no collisions", async () => {
      const assessments = [{
        assessmentId: "a1",
        courseId: "course1",
        userId: "user1",
        title: "",
        description: null,
        dueDate: new Date(),
        score: null,
        targetScore: null,
        weight: new Prisma.Decimal(0),
        maxScore: new Prisma.Decimal(100),
        submissionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      prismaMock.assessment.findMany.mockResolvedValue(assessments);

      const result = await service.getAssessmentCollisions("user1");

      expect(result).toMatchObject({ "clusters": []});
    })

    it("returns detected collisions", async () => {
      const assessments = [{
        assessmentId: "a1",
        courseId: "course1",
        userId: "user1",
        title: "",
        description: null,
        dueDate: new Date("2026-03-10"),
        score: null,
        targetScore: null,
        weight: new Prisma.Decimal(0),
        maxScore: new Prisma.Decimal(100),
        submissionDate: null,
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10")
      },
      {
        assessmentId: "a2",
        courseId: "course1",
        userId: "user1",
        title: "",
        description: null,
        dueDate: new Date("2026-03-10"),
        score: null,
        targetScore: null,
        weight: new Prisma.Decimal(0),
        maxScore: new Prisma.Decimal(100),
        submissionDate: null,
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10")
      }];

      const collisions = {
        "clusters": [
          {
            "assessmentIds": ["a1", "a2"], 
            "count": 2, 
            "endDate": "2026-03-10T00:00:00.000Z", 
            "startDate": "2026-03-10T00:00:00.000Z"
          }
        ]
      };
      prismaMock.assessment.findMany.mockResolvedValue(assessments);

      const result = await service.getAssessmentCollisions("user1");

      expect(result).toEqual(collisions);
    })
  })
});
