import { HttpError } from "@/utils/httpError";
import { Request, NextFunction, Response } from "express";
import { createAssessmentService, deleteAssessmentService, updateAssessmentService } from "./assessment.service";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function createAssessmentHandler(req: Request, res: Response, next: NextFunction){
  const userId = req.user?.sub;
  const courseId = req.params.id;

  if(!userId){
    return next(new HttpError(401, "Authentication required"));
  }

  const { title, dueDate, weight, description, maxScore, latePenalty } = req.body;

  if(!title || !dueDate || typeof weight !== "number"){
    return next(new HttpError(400, "Title, dueDate, and numeric weight are required"));
  }

  if(Array.isArray(courseId)){
    return next(new HttpError(400, "Only one Course ID can be requested"))
  }

  try {
    const assessmentService = createAssessmentService(prisma);
    const assessment = await assessmentService.createAssessmentToCourse({
      userId, 
      courseId, 
      title, 
      dueDate,
      weight, 
      description, 
      maxScore, 
      latePenalty,
    });

    logger.info(
      { requestId: req.id, courseId, assessmendId: assessment.assessmentId },
      "Assessment created"
    );

    return res.status(201).json(assessment);
  }
  catch(error){
    logger.error(
      { requestId: req.id, err: error },
      "Failed to create assessment"
    );
    return next(error);
  }
}

export async function updateAssessmentHandler(req: Request, res: Response, next: NextFunction){
  const userId = req.user?.sub;
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

  const { score, submitted, targetScore } = req.body;

  try {
    const assessmentService = updateAssessmentService(prisma);
    const updated = await assessmentService.updateAssessment({
      userId,
      assessmentId,
      score,
      submitted,
      targetScore,
    });

    logger.info(
      { requestId: req.id, assessmentId },
      "Assessment updated"
    );

    return res.status(200).json(updated);
  } catch (error) {
    logger.error(
      { requestId: req.id, err: error },
      "Failed to update assessment"
    );
    return next(error);
  }
}

export async function deleteAssessmentHandler(req: Request, res: Response, next: NextFunction){
  const userId = req.user?.sub;
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
    const assessmentService = deleteAssessmentService(prisma);
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
