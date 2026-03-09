import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { createAssessmentHandler, deleteAssessmentHandler, getAssessmentByIdHandler, getAssessmentCollisions } from "./assessment.controller";
import { updateAssessmentHandler } from "./assessment.controller";
import { csrfProtection } from "../auth/csrfProtection";

const router = Router();

router.get(
  "/assessments/:id",
  requireAuth,
  getAssessmentByIdHandler
);

router.post(
  "/courses/:id/assessments",
  requireAuth,
  csrfProtection,
  createAssessmentHandler
);

router.patch(
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

router.get(
  "/assessments/collisions",
  requireAuth,
  getAssessmentCollisions
);

export default router;
