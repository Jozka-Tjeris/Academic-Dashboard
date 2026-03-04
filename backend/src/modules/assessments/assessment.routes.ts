import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { createAssessmentHandler, deleteAssessmentHandler } from "./assessment.controller";
import { updateAssessmentHandler } from "./assessment.controller";
import { csrfProtection } from "../auth/csrfProtection";

const router = Router();

router.post(
  "/courses/:id/assessments",
  requireAuth,
  csrfProtection,
  createAssessmentHandler
);

router.put(
  "/assessments/:id",
  requireAuth,
  csrfProtection,
  updateAssessmentHandler
);

router.delete(
  "/assessments/:id",
  requireAuth,
  csrfProtection,
  deleteAssessmentHandler
);

export default router;
