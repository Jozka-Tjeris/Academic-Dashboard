import { Prisma, PrismaClient } from "@prisma/client";
import { HttpError } from "../../utils/httpError";
import { calculateCurrentGrade, calculateMaxPossibleGrade } from "../../domain/grade/gradeCalculator";
import { GradeSummary } from "../../types/backendTypes";
import { simulateFinalGrade } from "../../domain/grade/simulation";
import { deriveStatusFromDate } from "src/domain/assessments/deriveStatusFromDate";
import { AssessmentStatus, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { calculateUrgencyScore } from "src/domain/assessments/calculateUrgencyScore";
import { detectDueDateCollisions } from "src/domain/assessments/detectDueDateCollisions";

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
    async getCourseAnalytics(userId: string, courseId: string){
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

      const now = new Date();

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
        const status = deriveStatusFromDate(a.dueDate, a.score, a.submitted, now);

        if (status === AssessmentStatus.SUBMITTED) submitted++;
        else if (status === AssessmentStatus.GRADED) graded++;
        else if (status === AssessmentStatus.OVERDUE) overdue++;
        else if (status === AssessmentStatus.DUE_IN_24_HOURS) in24hrs++;
        else pending++;
      }

      // ---------- Urgency Metrics ----------

      const activeAssessments = assessments.filter(a => !a.submitted);

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

      const topAssessments = urgencyScores
        .sort((a, b) => b.urgency.comparedTo(a.urgency))
        .slice(0, 3);

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
          topAssessments
        }
      };
    },
    async getCourseDashboard(userId: string, courseId: string){
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

      const now = new Date();
      const assessments = course.assessments;

      // Grade Analytics

      const currentGrade = calculateCurrentGrade(assessments);
      const maxPossibleGrade = calculateMaxPossibleGrade(assessments);

      // Upcoming Assessments

      const upcoming = assessments.filter(a => !a.submitted);

      const urgencyRanked = upcoming
        .map(a => ({
          ...a,
          urgency: calculateUrgencyScore(a, now)
        }))
        .sort((a, b) => b.urgency.comparedTo(a.urgency));

      // Workload Stats

      const sevenDays = new Date(now.getTime() + 7 * TWENTYFOUR_HOURS_IN_MS);
      const fourteenDays = new Date(now.getTime() + 14 * TWENTYFOUR_HOURS_IN_MS);

      let dueNext7Days = 0;
      let dueNext14Days = 0;
      let totalUpcomingWeight = new Prisma.Decimal(0);

      let highestWeightUpcoming: typeof upcoming[number] | null = null;

      for (const a of upcoming) {

        if (a.dueDate <= sevenDays) dueNext7Days++;
        if (a.dueDate <= fourteenDays) dueNext14Days++;

        totalUpcomingWeight = totalUpcomingWeight.add(a.weight);

        if (
          !highestWeightUpcoming ||
          a.weight.gt(highestWeightUpcoming.weight)
        ) {
          highestWeightUpcoming = a;
        }
      }

      // Busiest Week Detection

      const sorted = [...upcoming].sort(
        (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
      );

      let busiestWeek = null;
      let maxCount = 0;

      for (let i = 0; i < sorted.length; i++){

        const start = sorted[i].dueDate;
        const end = new Date(start.getTime() + 7 * TWENTYFOUR_HOURS_IN_MS);

        const count = sorted.filter(
          a => a.dueDate >= start && a.dueDate <= end
        ).length;

        if (count > maxCount) {
          maxCount = count;
          busiestWeek = {
            start,
            end,
            assessmentCount: count
          };
        }
      }

      // Collision Clusters

      const collisions = detectDueDateCollisions(upcoming);

      return {
        course,

        analytics: {
          currentGrade,
          maxPossibleGrade
        },

        workload: {
          upcomingAssessments: urgencyRanked.slice(0, 10),

          stats: {
            dueNext7Days,
            dueNext14Days,
            totalUpcomingWeight,
            highestWeightUpcoming,
            busiestWeek
          }
        },

        collisions
      };
    },
  }
}
