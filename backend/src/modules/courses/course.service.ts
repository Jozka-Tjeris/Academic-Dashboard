import { Course, PrismaClient } from "@prisma/client";
import { HttpError } from "@/utils/httpError";

interface CreateCourseInput {
  userId: string;
  name: string;
  description?: string;
}

export function buildCourseService(prisma: PrismaClient) {
  return {
    async createCourse(input: CreateCourseInput): Promise<Course> {
      const { userId, name, description } = input;

      const existing = await prisma.course.findFirst({
        where: { userId, name },
      });

      if (existing) {
        throw new HttpError(
          409,
          "Conflict: Course with this name already exists."
        );
      }

      return prisma.course.create({
        data: {
          userId,
          name,
          description,
        },
      });
    },
  };
}
