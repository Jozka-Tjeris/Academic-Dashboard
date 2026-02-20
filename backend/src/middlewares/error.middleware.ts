import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { HttpError } from "../utils/httpError";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(
    {
      err,
      requestId: req.headers["x-request-id"],
      path: req.path,
    },
    "Unhandled error"
  );

  let status = 500;
  let message = 'Internal Server Error';

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(status).json({
    success: false,
    message,
    requestId: req.headers["x-request-id"],
  });
}