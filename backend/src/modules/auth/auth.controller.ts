import { Request, Response } from 'express';
import { signToken } from './jwt';
import { env } from '../../config/env';
import { TWENTYFOUR_HOURS_IN_MS } from '@internal_package/shared';
import { AuthenticatedRequest } from '../../types/express';
import crypto from "crypto";

export function googleCallback(req: Request, res: Response) {
  const user = req.user as { sub: string; email: string; name?: string };

  const token = signToken({
    sub: user.sub,
    email: user.email,
    name: user.name,
  });

  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * TWENTYFOUR_HOURS_IN_MS,
  });

  // NOT httpOnly (frontend must read it)
  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    sameSite: "none",
    secure: true,
  });

  return res.redirect(env.FRONTEND_URL);
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('access_token', {
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  const user = req.jwt;

  return res.status(200).json({
    id: user.sub,
    email: user.email,
    name: user.name ?? null,
  });
}