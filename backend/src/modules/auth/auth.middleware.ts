import { Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { HttpError } from '../../utils/httpError';
import { logger } from '../../lib/logger';
import { AuthenticatedRequest } from '@/types/express';

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  // Read JWT from cookie
  const token = req.cookies?.access_token;

  // Verify (throw if invalid)
  if (!token) {
    logger.warn(
      { requestId: req.id },
      'Missing authentication token'
    );
    return next(new HttpError(401, 'Authentication required'));
  }

  try {
    // Verify token and attach to user
    const decoded = verifyToken(token);

    req.jwt = decoded;

    return next();
  } catch (error) {
    logger.warn(
      { requestId: req.id },
      'Invalid or expired token'
    );
    return next(error);
  }
}
