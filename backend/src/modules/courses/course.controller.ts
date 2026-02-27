import { Request, Response, NextFunction } from "express";
import { buildCourseService, getCourseByIdService, getCourseService } from "./course.service";
import { HttpError } from "../../utils/httpError";
import { logger } from "../../lib/logger";
import { prisma } from "@/lib/prisma";

export async function createCourseHandler(req: Request, res: Response, next: NextFunction) {
  const { name, description } = req.body;
  const userId = req.user?.sub;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (!name || typeof name !== "string") {
    return next(new HttpError(400, "Course name is required and must be a string"));
  }

  try {
    const courseService = buildCourseService(prisma);
    const course = await courseService.createCourse({ userId, name, description });
    logger.info({ requestId: req.id, courseId: course.courseId }, "Course created");
    return res.status(201).json(course);
  } catch (error: unknown) {
    logger.error({ requestId: req.id, err: error }, "Failed to create course");
    return next(new HttpError(400, error instanceof Error ? error.message : "Bad Request"));
  }
}

export async function getCoursesHandler(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.sub;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const courseService = getCourseService(prisma);
    const courses = await courseService.getCoursesForUser(userId);
    logger.info({ requestId: req.id, userId }, "Fetched courses for user");
    return res.status(200).json(courses);
  } catch (error: unknown) {
    logger.error({ requestId: req.id, err: error }, "Failed to fetch courses");
    return next(new HttpError(500, "Failed to fetch courses"));
  }
}

export async function getCourseByIdHandler(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.sub;
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
    const courseService = getCourseByIdService(prisma);
    const course = await courseService.getCourseById(userId, courseId);

    logger.info(
      { requestId: req.id, userId, courseId },
      "Fetched course by id"
    );

    return res.status(200).json(course);
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to fetch course"
    );
    return next(error);
  }
}