import { HttpError } from "@/utils/httpError";
import { AssessmentStatus, PrismaClient } from "@prisma/client";

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

interface UpdateAssessmentInput {
  userId: string;
  assessmentId: string;
  score?: number;
  submitted?: boolean;
  targetScore?: number;
}

export function getAssessmentServices(prisma: PrismaClient){
  return {
    async createAssessmentForCourse(input: CreateAssessmentInput){
      const { userId, courseId, title, dueDate,
         weight, description, maxScore, latePenalty, } = input;

      const course = await prisma.course.findFirst({
        where: {
          userId, courseId,
        }
      })

      if(!course){
        throw new HttpError(404, "Course not found");
      }

      const assessment = await prisma.assessment.findFirst({
        where: {
          userId, courseId, title
        }
      })

      if(assessment){
        throw new HttpError(
          409,
          "Conflict: Assessment with this name inside this Course already exists."
        );
      }

      const existingWeights = await prisma.assessment.aggregate({
        where: { courseId, userId },
        _sum: { weight: true },
      });

      const currentTotalWeight = existingWeights._sum.weight?.toNumber() ?? 0;

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
          status: AssessmentStatus.UPCOMING,
        },
      });
    },
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
        if(assessment.maxScore !== null && assessment.maxScore !== undefined && score > assessment.maxScore.toNumber()){
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
    },
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
