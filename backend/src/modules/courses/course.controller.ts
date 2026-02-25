import { Request, Response, NextFunction } from "express";
import { buildCourseService } from "./course.service";
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
  } catch (error: any) {
    logger.error({ requestId: req.id, err: error }, "Failed to create course");
    return next(new HttpError(400, error.message));
  }
}
