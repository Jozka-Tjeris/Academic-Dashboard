import { Router } from 'express';
import passport from './passport';
import { googleCallback } from './auth.controller';
import { requireAuth } from './auth.middleware';
import { getCurrentUser } from './auth.controller';
import { logout } from './auth.controller';
import { authRateLimiter } from './rateLimit';
import { env } from '../../config/env';

const router = Router();

router.get(
  '/google',
  authRateLimiter,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  authRateLimiter,
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login`,
  }),
  googleCallback
);

router.post('/logout', logout);

router.get('/me', requireAuth, getCurrentUser);

export default router;
