import { Router } from "express";
import calculateCourseGoalHandler, { createCourseHandler, deleteCourseHandler, getCourseAnalytics, getCourseDashboard, simulateCourseHandler, updateCourseByIdHandler } from "./course.controller";
import { requireAuth } from "../auth/auth.middleware";
import { getCoursesHandler } from "./course.controller";
import { getCourseByIdHandler } from "./course.controller";
import { csrfProtection } from "../auth/csrfProtection";

const router = Router();

router.post(
  "/:id/simulate",
  requireAuth,
  csrfProtection,
  simulateCourseHandler
);

router.post(
  "/:id/goal",
  requireAuth,
  csrfProtection,
  calculateCourseGoalHandler
);

router.get(
  "/:id/analytics",
  requireAuth,
  getCourseAnalytics
);

router.get(
  "/:id/dashboard",
  requireAuth,
  getCourseDashboard
);

// GET /courses/:id
router.get("/:id", requireAuth, getCourseByIdHandler);

// PATCH /courses/:id
router.patch("/:id", requireAuth, csrfProtection, updateCourseByIdHandler);

// DELETE /courses/:id
router.delete("/:id", requireAuth, csrfProtection, deleteCourseHandler);

// POST /courses
router.post("/", requireAuth, csrfProtection, createCourseHandler);

// GET /courses
router.get("/", requireAuth, getCoursesHandler);

export default router;