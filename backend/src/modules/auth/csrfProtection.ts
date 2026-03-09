import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../types/express";

export function csrfProtection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ message: "CSRF token missing" });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
}