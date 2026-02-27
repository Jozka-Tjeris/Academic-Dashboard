import { Course, PrismaClient } from "@prisma/client";
import { HttpError } from "@/utils/httpError";
import { calculateCurrentGrade } from "../../domain/grade/gradeCalculator";
import { Assessment, AssessmentStatus } from "@shared/types/types";
import { AssessmentStatusTypes } from "@shared/constants/constants";

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

export function getCourseService(prisma: PrismaClient) {
  return {
    async getCoursesForUser(userId: string) {
      // Fetch courses including assessments
      const courses = await prisma.course.findMany({
        where: { userId },
        include: {
          assessments: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Compute grade summary for each course
      const coursesWithSummary = courses.map((course) => {
        const assessments: Assessment[] = course.assessments.map((v) => {
          if(v.status in AssessmentStatusTypes !== true){
            throw new HttpError(422, "Unprocessable Entity error");
          }
          return {
            ...v,
            status: v.status as AssessmentStatus
          }
        })
        const gradeSummary = calculateCurrentGrade(assessments);
        return {
          ...course,
          gradeSummary,
        };
      });

      return coursesWithSummary;
    }
  }
}

export function getCourseByIdService(prisma: PrismaClient){
  return {
    async getCourseById(userId: string, courseId: string){
      const course = await prisma.course.findFirst({
        where: {
          courseId,
          userId
        },
        include: {
          assessments: true,
        },
      })

      if(!course){
        throw new HttpError(404, "Course not found");
      }

      const assessments: Assessment[] = course.assessments.map((v) => {
        if(v.status in AssessmentStatusTypes !== true){
          throw new HttpError(422, "Unprocessable Entity error");
        }
        return {
          ...v,
          status: v.status as AssessmentStatus
        }
      })

      const gradeSummary = calculateCurrentGrade(assessments);

      return {
        ...course,
        gradeSummary,
      };
    }
  };
}