import { Response, NextFunction } from "express";
import { logger } from "../../lib/logger";
import { AuthenticatedRequest } from "../../types/express";
import { HttpError } from "../../utils/httpError";
import { getDashboardServices } from "./dashboard.service";
import { prisma } from "../../lib/prisma";
import { serializeUserDashboard } from "./dashboardSerializer";

export async function getUserDashboard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
){
  const userId = req.jwt?.sub;
  const date = typeof req.query.date === "string"
    ? new Date(req.query.date)
    : undefined;

  if (!userId) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const courseService = getDashboardServices(prisma);

    const dashboard = await courseService.getUserDashboard(userId, date);

    logger.info(
      { requestId: req.id },
      "User dashboard retrieved"
    );

    return res.status(200).json(serializeUserDashboard(dashboard));
  } catch (error) {
    logger.error(
      { requestId: req.id, error },
      "Failed to get user dashboard"
    );
    return next(error);
  }
}
