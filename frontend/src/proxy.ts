import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Only run this on the root path
  if (pathname === '/') {
    const sessionToken = request.cookies.get('access_token');

    // If no session, go to login
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Optional: Call your API to verify the session
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      });

      if (response.ok) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (err) {
      console.error("Middleware auth check failed", err);
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'], // Only match the root route
};
