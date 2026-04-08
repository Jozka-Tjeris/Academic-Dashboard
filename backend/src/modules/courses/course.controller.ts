import { Response, NextFunction } from "express";
import { getCourseServices } from "./course.service";
import { HttpError } from "../../utils/httpError";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { AuthenticatedRequest } from "../../types/express";
import { serializeCourse, serializeCourses } from "./courseSerializer";
import { serializeCourseAnalytics } from "./courseAnalyticsSerializer";
import { serializeCourseDashboard } from "./courseDashboardSerializer";
import { calculateRequiredScores } from "../../domain/grade/calculateRequiredScores";

export async function createCourseHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { name, description, color } = req.body;
  const userId = req.jwt?.sub;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (!name || typeof name !== "string") {
    return next(new HttpError(400, "Course name is required and must be a string"));
  }

  try {
    const courseService = getCourseServices(prisma);
    const course = await courseService.createCourse({ userId, name, description, color });
    logger.info({ requestId: req.id, courseId: course.courseId }, "Course created");
    return res.status(201).json(course);
  } catch (error: unknown) {
    logger.error({ requestId: req.id, err: error }, "Failed to create course");
    return next(error);
  }
}

export async function getCoursesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.jwt?.sub;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const courseService = getCourseServices(prisma);
    const courses = await courseService.getCoursesForUser(userId);
    
    logger.info({ requestId: req.id, userId }, "Fetched courses for user");
    return res.status(200).json(serializeCourses(courses));
  } catch (error: unknown) {
    logger.error({ requestId: req.id, err: error }, "Failed to fetch courses");
    return next(new HttpError(500, "Failed to fetch courses"));
  }
}

export async function getCourseByIdHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.jwt?.sub;
  const courseId = req.params.id;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (!courseId) {
    return next(new HttpError(400, "Course ID is required"));
  }

  if(Array.isArray(courseId)){
    return next(new HttpError(400, "Only one Course ID can be requested"))
  }

  try {
    const courseService = getCourseServices(prisma);
    const course = await courseService.getCourseById(userId, courseId);

    logger.info(
      { requestId: req.id, userId, courseId },
      "Fetched course by id"
    );

    return res.status(200).json(serializeCourse(course));
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to fetch course"
    );
    return next(error);
  }
}

export async function updateCourseByIdHandler(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const courseId = req.params.id;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (!courseId) {
    return next(new HttpError(400, "Course ID is required"));
  }

  if(Array.isArray(courseId)){
    return next(new HttpError(400, "Only one Course ID can be requested"))
  }

  try {
    const courseService = getCourseServices(prisma);
    const result = await courseService.updateCourse(userId, courseId, req.body);

    logger.info(
      { requestId: req.id, userId, courseId },
      "Course updated"
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to update course"
    );
    return next(error);
  }
}

export async function deleteCourseHandler(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const courseId = req.params.id;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (!courseId) {
    return next(new HttpError(400, "Course ID is required"));
  }

  if(Array.isArray(courseId)){
    return next(new HttpError(400, "Only one Course ID can be requested"))
  }

  try {
    const courseService = getCourseServices(prisma);
    const result = await courseService.deleteCourse(userId, courseId);

    logger.info(
      { requestId: req.id, userId, courseId },
      "Course deleted"
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to delete course"
    );
    return next(error);
  }
}

export async function simulateCourseHandler(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const courseId = req.params.id;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (Array.isArray(courseId)) {
    return next(new HttpError(400, "Only one Course ID can be requested"));
  }

  const { simulations } = req.body;

  if (simulations && !Array.isArray(simulations)) {
    return next(new HttpError(400, "Simulations must be an array"));
  }

  try {
    const courseService = getCourseServices(prisma);
    const result = await courseService.simulateCourseGrade(courseId, simulations);

    logger.info(
      { requestId: req.id, courseId },
      "Course simulation calculated"
    );

    return res.json({
      currentGrade: result.currentGrade.toNumber(),
      maxPossibleGrade: result.maxPossibleGrade.toNumber(),
      simulatedFinalGrade: result.simulatedFinalGrade.toNumber(),
    });
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to simulate course grade"
    );
    return next(error);
  }
}

export async function getCourseAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const courseId = req.params.id;
  const date = typeof req.query.date === "string" ? new Date(req.query.date) : undefined;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (Array.isArray(courseId)) {
    return next(new HttpError(400, "Only one Course ID can be requested"));
  }

  try {
    const courseService = getCourseServices(prisma);
    const analytics = await courseService.getCourseAnalytics(userId, courseId, date);

    logger.info(
      { requestId: req.id, courseId },
      "Course analytics calculated"
    );

    return res.status(200).json(serializeCourseAnalytics(analytics));
  } catch (error) {
    logger.error(
      { requestId: req.id, error },
      "Failed to get course analytics"
    );
    return next(error);
  }
};

export async function getCourseDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const courseId = req.params.id;
  const date = typeof req.query.date === "string" ? new Date(req.query.date) : undefined;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (Array.isArray(courseId)) {
    return next(new HttpError(400, "Only one Course ID can be requested"));
  }

  try {
    const courseService = getCourseServices(prisma);
    const dashboard = await courseService.getCourseDashboard(userId, courseId, date);

    logger.info(
      { requestId: req.id, courseId },
      "Course dashboard retrieved"
    );

    return res.status(200).json(serializeCourseDashboard(dashboard));
  } catch (error) {
    logger.error(
      { requestId: req.id, error },
      "Failed to get course dashboard"
    );
    return next(error);
  }
};

export default async function calculateCourseGoalHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.jwt?.sub;
  const courseId = req.params.id;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (Array.isArray(courseId)) {
    return next(new HttpError(400, "Only one Course ID can be requested"));
  }

  const { targetGrade } = req.body;

  if (!targetGrade || typeof targetGrade !== "number") {
    return res.status(400).json({ message: "Invalid targetGrade" });
  }

  try {
    const courseService = getCourseServices(prisma);
    const result = await courseService.calculateGradeGoal(userId, courseId, targetGrade);
    logger.info(
      { requestId: req.id, courseId },
      "Coure goal retrieved"
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error(
      { requestId: req.id, error },
      "Failed to get course goals"
    );
    return next(error);
  }
};
