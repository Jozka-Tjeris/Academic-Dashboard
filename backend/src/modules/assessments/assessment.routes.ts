import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { createAssessmentHandler, deleteAssessmentHandler } from "./assessment.controller";
import { updateAssessmentHandler } from "./assessment.controller";

const router = Router();

router.post(
  "/courses/:id/assessments",
  requireAuth,
  createAssessmentHandler
);

router.put(
  "/assessments/:id",
  requireAuth,
  updateAssessmentHandler
);

router.delete(
  "/assessments/:id",
  requireAuth,
  deleteAssessmentHandler
);

export default router;
