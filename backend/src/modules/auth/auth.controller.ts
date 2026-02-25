import { Request, Response } from 'express';
import { signToken } from './jwt';
import { env } from '../../config/env';
import { TWENTYFOUR_HOURS_IN_MS } from '@shared/constants/constants';
import { JwtPayload } from 'jsonwebtoken';

export function googleCallback(req: Request, res: Response) {
  const user = req.user as { id: string; email: string; name?: string };

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  res.cookie('access_token', token, {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * TWENTYFOUR_HOURS_IN_MS,
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

export function getCurrentUser(req: Request, res: Response) {
  const user = req.user as JwtPayload;

  return res.status(200).json({
    id: user.sub,
    email: user.email,
    name: user.name ?? null,
  });
}