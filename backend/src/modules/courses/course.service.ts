import { Prisma, PrismaClient } from "@prisma/client";
import { HttpError } from "../../utils/httpError";
import { calculateCurrentGrade, calculateMaxPossibleGrade } from "../../domain/grade/gradeCalculator";
import { GradeSummary } from "../../types/backendTypes";
import { simulateFinalGrade } from "../../domain/grade/simulation";
import { deriveStatusFromDate } from "../../domain/assessments/deriveStatusFromDate";
import { AssessmentStatus } from "@internal_package/shared";
import { calculateUrgencyScore } from "../../domain/assessments/calculateUrgencyScore";
import { rankAssessmentsByUrgency } from "../../domain/assessments/rankAssessmentsByUrgency";
import { buildDashboardMetrics } from "../../domain/dashboard/computeDashboardMetrics";

interface CreateCourseInput {
  userId: string;
  name: string;
  description?: string;
}

export function getCourseServices(prisma: PrismaClient){
  return {
    async createCourse(input: CreateCourseInput){
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
    async getCoursesForUser(userId: string){
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
        const gradeSummary: GradeSummary = {
          currentGrade: calculateCurrentGrade(course.assessments),
          maxPossibleGrade: calculateMaxPossibleGrade(course.assessments),
        }
        return {
          ...course,
          gradeSummary,
        };
      });

      return coursesWithSummary;
    },
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

      const gradeSummary: GradeSummary = {
        currentGrade: calculateCurrentGrade(course.assessments),
        maxPossibleGrade: calculateMaxPossibleGrade(course.assessments),
      }
      return {
        ...course,
        gradeSummary,
      };
    },
    async deleteCourse(userId: string, courseId: string){
      const course = await prisma.course.findFirst({
        where: { courseId, userId },
      });

      if (!course) {
        throw new HttpError(404, "Course not found");
      }

      await prisma.course.delete({
        where: { courseId, userId },
      });

      return { message: "Course deleted successfully" };
    },
    async simulateCourseGrade(courseId: string, simulations: { assessmentId: string; simulatedScore: number }[]){
      const assessments = await prisma.assessment.findMany({
        where: {
          courseId,
        },
      });
  
      if (assessments.length === 0) {
        throw new HttpError(404, "No assessments found for this course");
      }
      
      const simulationInputs =
        simulations?.map((sim: { assessmentId: string; simulatedScore: number }) => {
          if (!sim.assessmentId || typeof sim.simulatedScore !== "number") {
            throw new HttpError(400, "Invalid simulation input");
          }

          return {
            assessmentId: sim.assessmentId,
            simulatedScore: new Prisma.Decimal(sim.simulatedScore),
          };
        }) ?? [];

      const assessmentIds = new Set(assessments.map(a => a.assessmentId));

      for (const sim of simulationInputs) {
        if (!assessmentIds.has(sim.assessmentId)) {
          throw new HttpError(400, "Simulation references invalid assessment");
        }
      }

      const currentGrade = calculateCurrentGrade(assessments);
      const maxPossibleGrade = calculateMaxPossibleGrade(assessments);
      const simulatedFinalGrade = simulateFinalGrade(assessments, simulationInputs);

      return {
        currentGrade,
        maxPossibleGrade,
        simulatedFinalGrade,
      };
    },
    async getCourseAnalytics(userId: string, courseId: string, now?: Date){
      const course = await prisma.course.findFirst({
        where: {
          courseId,
          userId
        },
        include: {
          assessments: true
        }
      });

      if (!course) {
        throw new HttpError(404, "Course not found");
      }

      const assessments = course.assessments;

      if(!now) now = new Date();

      // ---------- Grade Metrics ----------

      const currentGrade = calculateCurrentGrade(assessments);
      const maxPossibleGrade = calculateMaxPossibleGrade(assessments);

      // ---------- Status Counts ----------

      let submitted = 0;
      let graded = 0;
      let pending = 0;
      let in24hrs = 0;
      let overdue = 0;

      for (const a of assessments) {
        const status = deriveStatusFromDate(a.dueDate, a.score, !!a.submissionDate, now);

        if (status === AssessmentStatus.SUBMITTED) submitted++;
        else if (status === AssessmentStatus.GRADED) graded++;
        else if (status === AssessmentStatus.OVERDUE) overdue++;
        else if (status === AssessmentStatus.DUE_IN_24_HOURS) in24hrs++;
        else pending++;
      }

      // ---------- Urgency Metrics ----------

      const activeAssessments = assessments.filter(
        a => deriveStatusFromDate(a.dueDate, a.score, !!a.submissionDate, now) !== AssessmentStatus.GRADED
      );

      const ranked = rankAssessmentsByUrgency(activeAssessments, now);

      const urgencyScores = activeAssessments.map(a => ({
        assessmentId: a.assessmentId,
        title: a.title,
        dueDate: a.dueDate,
        urgency: calculateUrgencyScore(a, now)
      }));

      const totalUrgency = urgencyScores.reduce(
        (sum, a) => sum.add(a.urgency),
        new Prisma.Decimal(0)
      );

      const averageUrgency =
        urgencyScores.length === 0
          ? new Prisma.Decimal(0)
          : totalUrgency.div(urgencyScores.length);

      return {
        currentGrade,
        maxPossibleGrade,

        assessmentCounts: {
          total: assessments.length,
          submitted,
          graded,
          in24hrs,
          pending,
          overdue
        },

        urgency: {
          totalUrgency,
          averageUrgency,
          topAssessments: ranked
        }
      };
    },
    async getCourseDashboard(userId: string, courseId: string, now?: Date){

      const course = await prisma.course.findFirst({
        where: { courseId, userId },
        include: { assessments: true }
      });

      if (!course) {
        throw new HttpError(404, "Course not found");
      }

      if(!now) now = new Date();

      const metrics = buildDashboardMetrics(course.assessments, now);

      return {
        course: {
          ...course,
          gradeSummary: {
            currentGrade: calculateCurrentGrade(course.assessments),
            maxPossibleGrade: calculateMaxPossibleGrade(course.assessments)
          }
        },

        workload: {
          upcomingAssessments: metrics.upcomingAssessments,
          stats: metrics.stats
        },

        collisions: metrics.collisions
      };
    }
  }
}
