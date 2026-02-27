import { HttpError } from "@/utils/httpError";
import { PrismaClient } from "@prisma/client";

interface CreateAssessmentInput {
  userId: string;
  courseId: string;
  title: string;
  dueDate: Date;
  weight: number;
  description?: string;
  maxScore?: number;
  latePenalty?: number;
}

export function createAssessmentService(prisma: PrismaClient){
  return {
    async createAssessmentToCourse(input: CreateAssessmentInput){
      const { userId, courseId, title, dueDate,
         weight, description, maxScore, latePenalty, } = input;

      const course = await prisma.course.findFirst({
        where: {
          userId, courseId,
        }
      })

      if(!course){
        throw new HttpError(400, "Course not found");
      }

      const existingWeights = await prisma.assessment.aggregate({
        where: { courseId, userId },
        _sum: { weight: true },
      });

      const currentTotalWeight = existingWeights._sum.weight ?? 0;

      if(currentTotalWeight + weight > 100){
        throw new HttpError(400, "Total assessment weight cannot exceed 100%");
      }

      return prisma.assessment.create({
        data: {
          userId, 
          courseId, 
          title, 
          dueDate,
          weight, 
          description, 
          maxScore, 
          latePenalty,
          submitted: false,
          status: "Pending",
        },
      });
    }
  }
}