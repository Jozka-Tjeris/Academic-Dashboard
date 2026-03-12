import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { getUserDashboard } from "./dashboard.controller";

const router = Router();

router.get(
  "/dashboard",
  requireAuth,
  getUserDashboard
);

export default router;
