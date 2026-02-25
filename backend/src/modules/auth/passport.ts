import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '../../config/env';
import { authService } from './auth.service';
import { logger } from '../../lib/logger';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.BACKEND_URL}/api/auth/google/callback`,
      // Prevent CSRF attacks (Cross_Site_Request_Forgery)
      state: true,
    },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await authService.handleGoogleLogin(profile);

        logger.info(
          { userId: user.id },
          'Google authentication successful'
        );

        return done(null, user);
      } catch (error) {
        logger.error({ error }, 'Google authentication failed');
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
