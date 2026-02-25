import { prismaMock } from "tests/mocks/mockPrismaSingleton";
import { buildCourseService } from "@/modules/courses/course.service";

describe("createCourse (unit)", () => {
  let service: ReturnType<typeof buildCourseService>;

  beforeEach(() => {
    service = buildCourseService(prismaMock);
  });

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
    ).rejects.toThrow("Conflict: Course with this name already exists.");

    expect(prismaMock.course.create).not.toHaveBeenCalled();
  });
});
