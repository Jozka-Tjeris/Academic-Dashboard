import { PrismaClient } from "@prisma/client";
import { buildDashboardMetrics } from "../../domain/dashboard/computeDashboardMetrics";
import { calculateCurrentGrade, calculateMaxPossibleGrade } from "../../domain/grade/gradeCalculator";


export function getDashboardServices(prisma: PrismaClient){
  return {
    async getUserDashboard(userId: string, now?: Date){

      if(!now) now = new Date();

      const courses = await prisma.course.findMany({
        where: { userId },
        include: {
          assessments: true
        }
      });

      const allAssessmentsWithCourse = courses.flatMap(c => {
        return c.assessments.map(a => {
          return {
            ...a,
            course: {
              name: c.name
            }
          }
        });
      });

      const metrics = buildDashboardMetrics(allAssessmentsWithCourse, now);

      return {
        courses: courses.map(course => ({
          ...course,
          gradeSummary: {
            currentGrade: calculateCurrentGrade(course.assessments),
            maxPossibleGrade: calculateMaxPossibleGrade(course.assessments)
          }
        })),

        workload: {
          upcomingAssessments: metrics.upcomingAssessments,
          stats: metrics.stats
        },

        collisions: metrics.collisions
      };
    }
  }
}
