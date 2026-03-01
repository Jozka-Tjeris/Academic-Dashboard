import { Request } from 'express';
import { JwtPayload } from './auth.types';

export interface AuthenticatedRequest extends Request {
  jwt?: JwtPayload;
}
