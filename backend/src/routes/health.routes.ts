import { Router } from "express";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

// Liveness
healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness (DB check)
healthRouter.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ready",
      database: "up",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generic Server Error';
    res.status(503).json({
      status: "not_ready",
      database: "down",
      error: message,
    });
  }
});