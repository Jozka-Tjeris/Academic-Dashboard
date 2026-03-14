import { deriveStatusFromDate } from "../../domain/assessments/deriveStatusFromDate";
import { HttpError } from "../../utils/httpError";
import { Prisma, PrismaClient } from "@prisma/client";
import { calculateUrgencyScore } from "../../domain/assessments/calculateUrgencyScore";
import { AssessmentShared, DUEDATE_COLLISION_WINDOW_DAYS, MAX_ASSESSMENT_WEIGHT } from "@internal_package/shared";
import { detectDueDateCollisions } from "../../domain/assessments/detectDueDateCollisions";

interface CreateAssessmentInput {
  userId: string;
  courseId: string;
  title: string;
  dueDate: Date;
  weight: number;
  description?: string;
  maxScore?: number;
}

interface UpdateAssessmentInput {
  userId: string;
  assessmentId: string;
  updates: Partial<AssessmentShared>;
  now?: Date;
}

const IMMUTABLE_FIELDS = new Set([
  "assessmentId",
  "courseId",
  "userId",
  "createdAt",
  "updatedAt",
]);

export function getAssessmentServices(prisma: PrismaClient){
  return {
    async getAssessmentById(assessmentId: string, userId: string){
      const assessment = await prisma.assessment.findUniqueOrThrow({
        where: {
          assessmentId,
          userId,
        },
        include: {
          course: true,
        },
      });
  
      const derivedStatus = deriveStatusFromDate(
        assessment.dueDate,
        assessment.score,
        !!assessment.submissionDate,
        new Date(),
      );
      const urgencyScore = calculateUrgencyScore(assessment);

      const { course, ...assessmentWithoutCourse } = assessment;
      void course;
      
      const response = {
        assessment: {
          ...assessmentWithoutCourse,
        },
        course: {
          courseId: assessment.course.courseId,
          name: assessment.course.name,
        },
        derived: {
          status: derivedStatus,
          urgencyScore,
        },
      };

      return response;
    },
    async createAssessmentForCourse(input: CreateAssessmentInput){
      const { userId, courseId, title, dueDate,
         weight, description, maxScore, } = input;

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

      if(currentTotalWeight + weight > MAX_ASSESSMENT_WEIGHT){
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
        },
      });
    },
    async updateAssessment(input: UpdateAssessmentInput){
      const { userId, assessmentId, updates } = input;

      if (!updates || typeof updates !== "object") {
        throw new HttpError(400, "Updates object is required");
      }

      for (const key of Object.keys(updates)) {
        if (IMMUTABLE_FIELDS.has(key)) {
          throw new HttpError(400, `Field '${key}' cannot be updated`);
        }
      }

      const assessment = await prisma.assessment.findFirst({
        where: {
          assessmentId, 
          userId,
        }
      });

      if(!assessment){
        throw new HttpError(404, "Assessment not found");
      }

      if(assessment.score && updates.score){
        throw new HttpError(400, "Score is already present and cannot be updated");
      }

      const updateData: Prisma.AssessmentUpdateInput = {
        ...updates,
        maxScore: updates.maxScore ?? assessment.maxScore,
      };

      if(updates.score !== undefined && updates.score !== null){
        if(typeof updates.score !== "number" || updates.score < 0){
          throw new HttpError(400, "Score must be a positive number");
        }
        if(assessment.maxScore !== null && assessment.maxScore !== undefined && updates.score > assessment.maxScore.toNumber()){
          throw new HttpError(400, "Score cannot exceed maxScore");
        }
        if (updates.score !== null) {
          updateData.submissionDate = input.now ?? new Date();
        }
      }

      return prisma.assessment.update({
        where: {
          assessmentId, userId,
        },
        data: updateData,
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
    },
    async getAssessmentCollisions(userId: string, daysWindow: number = DUEDATE_COLLISION_WINDOW_DAYS){
      const assessments = await prisma.assessment.findMany({
        where: {
          course: { userId },
          submissionDate: null,
        },
        include: {
          course: true
        },
        orderBy: {
          dueDate: "asc"
        }
      });

      return { clusters: detectDueDateCollisions(assessments, daysWindow) };
    },
  }
}
