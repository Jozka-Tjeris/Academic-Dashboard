import { prismaMock } from "../mocks/mockPrismaSingleton";
import { getAssessmentServices } from "@/modules/assessments/assessment.service";

describe("Assessment Service", () => {
  let service: ReturnType<typeof getAssessmentServices>;

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
        _sum: { weight: 20 },
        _count: undefined,
        _avg: undefined,
        _min: undefined,
        _max: undefined
      });

      prismaMock.assessment.create.mockResolvedValue({
        assessmentId: "assess1",
        weight: 30,
        courseId: "",
        userId: "",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "",
        dueDate: new Date(),
        status: "",
        score: null,
        targetScore: null,
        latePenalty: null,
        maxScore: 100,
        isSimulated: null,
        submitted: false
      });

      const result = await service.createAssessmentForCourse({
        userId: "user1",
        courseId: "course1",
        title: "Midterm",
        dueDate: new Date(),
        weight: 30,
      });

      expect(result.assessmentId).toBe("assess1");
    });

    it("throws if total weight exceeds 100", async () => {
      prismaMock.course.findFirst.mockResolvedValue({
        courseId: "course1",
        userId: "user1",
        name: "",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      prismaMock.assessment.aggregate.mockResolvedValue({
        _sum: { weight: 90 },
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
          weight: 20,
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
        weight: 30,
        courseId: "course-1",
        userId: "user-1",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "",
        dueDate: new Date(),
        status: "",
        score: null,
        targetScore: null,
        latePenalty: null,
        maxScore: 100,
        isSimulated: null,
        submitted: false
      });

      await expect(
        service.createAssessmentForCourse({
          userId: "user1",
          courseId: "course1",
          title: "Final",
          dueDate: new Date(),
          weight: 20,
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
          weight: 20,
        })
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("updateAssessment", () => {
    it("updates score successfully", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "a1",
        userId: "user1",
        maxScore: 100,
        courseId: "course1",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "",
        dueDate: new Date(),
        status: "",
        score: null,
        targetScore: null,
        weight: 0,
        latePenalty: null,
        isSimulated: null,
        submitted: false
      });

      prismaMock.assessment.update.mockResolvedValue({
        assessmentId: "a1",
        score: 80,
        description: null,
        weight: 0,
        targetScore: null,
        latePenalty: null,
        maxScore: 100,
        title: "",
        dueDate: new Date(),
        status: "",
        isSimulated: null,
        submitted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        courseId: "",
        userId: ""
      });

      const result = await service.updateAssessment({
        userId: "user1",
        assessmentId: "a1",
        score: 80,
      });

      expect(result.score).toBe(80);
    });

    it("throws if score exceeds maxScore", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "a1",
        userId: "user1",
        maxScore: 50,
        courseId: "",
        title: "",
        description: null,
        dueDate: new Date(),
        status: "",
        score: null,
        targetScore: null,
        weight: 0,
        latePenalty: null,
        isSimulated: null,
        submitted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          score: 80,
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws if score is negative", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue({
        assessmentId: "a1",
        userId: "user1",
        maxScore: 50,
        courseId: "",
        title: "",
        description: null,
        dueDate: new Date(),
        status: "",
        score: null,
        targetScore: null,
        weight: 0,
        latePenalty: null,
        isSimulated: null,
        submitted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          score: -80,
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws 404 if not found", async () => {
      prismaMock.assessment.findFirst.mockResolvedValue(null);

      await expect(
        service.updateAssessment({
          userId: "user1",
          assessmentId: "a1",
          score: 80,
        })
      ).rejects.toMatchObject({ status: 404 });
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
        status: "",
        score: null,
        targetScore: null,
        weight: 0,
        latePenalty: null,
        maxScore: 100,
        isSimulated: null,
        submitted: false,
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
});
