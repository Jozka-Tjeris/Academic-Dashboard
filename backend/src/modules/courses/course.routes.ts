import { Router } from "express";
import { createCourseHandler, deleteCourseHandler, simulateCourseHandler } from "./course.controller";
import { requireAuth } from "../auth/auth.middleware";
import { getCoursesHandler } from "./course.controller";
import { getCourseByIdHandler } from "./course.controller";
import { csrfProtection } from "../auth/csrfProtection";

const router = Router();

// POST /courses
router.post("/", requireAuth, csrfProtection, createCourseHandler);

// GET /courses
router.get("/", requireAuth, getCoursesHandler);

// GET /courses/:id
router.get("/:id", requireAuth, getCourseByIdHandler);

// DELETE /courses/:id
router.delete("/:id", requireAuth, csrfProtection, deleteCourseHandler);

router.post(
  "/:id/simulate",
  requireAuth,
  csrfProtection,
  simulateCourseHandler
);

export default router;