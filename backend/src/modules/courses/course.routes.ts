import { Router } from "express";
import { createCourseHandler } from "./course.controller";
import { requireAuth } from "../auth/auth.middleware";

const router = Router();

// POST /courses
router.post("/", requireAuth, createCourseHandler);

export default router;