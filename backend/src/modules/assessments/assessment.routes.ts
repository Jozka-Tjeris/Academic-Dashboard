import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { createAssessmentHandler } from "./assessment.controller";
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

export default router;
