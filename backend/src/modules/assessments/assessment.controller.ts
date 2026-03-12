import { HttpError } from "../../utils/httpError";
import { NextFunction, Response } from "express";
import { getAssessmentServices } from "./assessment.service";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { AuthenticatedRequest } from "../../types/express";
import { serializeAssessment } from "./assessmentSerializer";

export async function getAssessmentByIdHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.jwt?.sub;
  const assessmentId = req.params.id;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (Array.isArray(assessmentId)) {
    return next(new HttpError(400, "Only one assessment ID can be requested"));
  }

  try {
    const assessmentService = getAssessmentServices(prisma);
    const response = await assessmentService.getAssessmentById(assessmentId, userId);

    const serializedResponse = {
      ...response,
      assessment: serializeAssessment(response.assessment)
    }
    logger.info(
      { requestId: req.id, assessmentId },
      "Assessment fetched"
    );
    return res.json(serializedResponse);
  } catch (error) {
    logger.error(
      { requestId: req.id, assessmentId, err: error },
      "Failed to get assessment"
    );
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return next(new HttpError(404, "Assessment not found"));
    }
    else{
      return next(error);
    }
  }
}

export async function createAssessmentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const courseId = req.params.id;

  if(!userId){
    return next(new HttpError(401, "Authentication required"));
  }

  const { title, dueDate, weight, description, maxScore } = req.body;

  if(!title || !dueDate || typeof weight !== "number"){
    return next(new HttpError(400, "Title, dueDate, and numeric weight are required"));
  }

  if(Array.isArray(courseId)){
    return next(new HttpError(400, "Only one Course ID can be requested"))
  }

  try {
    const assessmentService = getAssessmentServices(prisma);
    const assessment = await assessmentService.createAssessmentForCourse({
      userId, 
      courseId, 
      title, 
      dueDate,
      weight, 
      description, 
      maxScore, 
    });

    logger.info(
      { requestId: req.id, courseId, assessmendId: assessment.assessmentId },
      "Assessment created"
    );

    return res.status(201).json(serializeAssessment(assessment));
  }
  catch(error){
    logger.error(
      { requestId: req.id, err: error },
      "Failed to create assessment"
    );
    return next(error);
  }
}

export async function updateAssessmentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const assessmentId = req.params.id;

  if(!userId){
    return next(new HttpError(401, "Authentication required"));
  }

  if(!assessmentId){
    return next(new HttpError(400, "Assessment ID is required"));
  }

  if(Array.isArray(assessmentId)){
    return next(new HttpError(400, "Only one Assessment ID can be requested"))
  }

  try {
    const assessmentService = getAssessmentServices(prisma);
    const updated = await assessmentService.updateAssessment({
      userId,
      assessmentId,
      updates: req.body,
    });

    logger.info(
      { requestId: req.id, assessmentId },
      "Assessment updated"
    );

    return res.status(200).json(serializeAssessment(updated));
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to update assessment"
    );
    return next(error);
  }
}

export async function deleteAssessmentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;
  const assessmentId = req.params.id;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  if(!assessmentId){
    return next(new HttpError(400, "Assessment ID is required"));
  }

  if(Array.isArray(assessmentId)){
    return next(new HttpError(400, "Only one Assessment ID can be requested"))
  }

  try {
    const assessmentService = getAssessmentServices(prisma);
    const result = await assessmentService.deleteAssessment(userId, assessmentId);

    logger.info(
      { requestId: req.id, userId, assessmentId },
      "Assessment deleted"
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to delete assessment"
    );
    return next(error);
  }
}

export async function getAssessmentCollisions(req: AuthenticatedRequest, res: Response, next: NextFunction){
  const userId = req.jwt?.sub;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const days = req.query.days ? Number(req.query.days) : undefined;
    const assessmentService = getAssessmentServices(prisma);
    const collisions = await assessmentService.getAssessmentCollisions(
      userId,
      days
    );

    logger.info(
      { requestId: req.id, userId },
      "Assessment collisions have been computed"
    );

    return res.status(200).json(collisions);
  } catch (error) {
    logger.error(
      { requestId: req.id, error },
      "Failed to calculate assessment collisions"
    );
    return next(error);
  }
};
