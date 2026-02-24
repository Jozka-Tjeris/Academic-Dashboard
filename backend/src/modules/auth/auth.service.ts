import { prisma } from '../../lib/prisma';
import { Profile } from 'passport-google-oauth20';

class AuthService {
  async handleGoogleLogin(profile: Profile) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const image = profile.photos?.[0]?.value;

    if (!email) {
      throw new Error('Google account does not provide email');
    }

    // Find user by google ID, if not found, create user
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          image,
        },
      });
    }

    // Return user object
    return user;
  }
}

export const authService = new AuthService();
