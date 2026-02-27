import { HttpError } from "@/utils/httpError";
import { Request, NextFunction, Response } from "express";
import { createAssessmentService } from "./assessment.service";
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