import { Router } from "express";
import { createCourseHandler } from "./course.controller";
import { requireAuth } from "../auth/auth.middleware";
import { getCoursesHandler } from "./course.controller";
import { getCourseByIdHandler } from "./course.controller";

const router = Router();

// POST /courses
router.post("/", requireAuth, createCourseHandler);

// GET /courses
router.get("/", requireAuth, getCoursesHandler);

// GET /courses/:id
router.get("/:id", requireAuth, getCourseByIdHandler);

export default router;