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

interface UpdateAssessmentInput {
  userId: string;
  assessmentId: string;
  score?: number;
  submitted?: boolean;
  targetScore?: number;
}

export function updateAssessmentService(prisma: PrismaClient){
  return {
    async updateAssessment(input: UpdateAssessmentInput){
      const { userId, assessmentId, score, submitted, targetScore } = input;

      const assessment = await prisma.assessment.findFirst({
        where: {
          assessmentId, 
          userId,
        }
      });

      if(!assessment){
        throw new HttpError(404, "Assessment not found");
      }

      if(score !== undefined){
        if(typeof score !== "number" || score < 0){
          throw new HttpError(400, "Score must be a positive number");
        }
        if(assessment.maxScore !== null && assessment.maxScore !== undefined && score > assessment.maxScore){
          throw new HttpError(400, "Score cannot exceed maxScore");
        }
      }

      return prisma.assessment.update({
        where: {
          assessmentId, userId,
        },
        data: {
          ...(score !== undefined && { score }),
          ...(submitted !== undefined && { submitted }),
          ...(targetScore !== undefined && { targetScore }),
        },
      });
    }
  }
}

export function deleteAssessmentService(prisma: PrismaClient){
  return {
    async deleteAssessment(userId: string, assessmentId: string){
      const assessment = await prisma.assessment.findFirst({
        where: { assessmentId, userId },
      });

      if (!assessment) {
        throw new HttpError(404, "Assessment not found");
      }

      await prisma.assessment.delete({
        where: { assessmentId, userId },
      });

      return { message: "Assessment deleted successfully" };
    }
  }
}
