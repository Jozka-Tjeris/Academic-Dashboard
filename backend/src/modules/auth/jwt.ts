import jwt from 'jsonwebtoken';
import { JwtPayload } from './auth.types';
import { env } from '../../config/env';
import { HttpError } from '../../utils/httpError';

const JWT_SECRET = env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const JWT_EXPIRES_IN = '7d';

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JwtPayload;
  } catch (error) {
    void error; //to prevent unused variable warning
    throw new HttpError(401, 'Invalid or expired token');
  }
}
