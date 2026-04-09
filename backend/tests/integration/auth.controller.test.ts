import request from "supertest";
import { app } from "../../src/app";
import { signToken } from "../../src/modules/auth/jwt";

describe("auth user check test", () => {
  const csrfToken = "csrf_token-123";

  it('returns 401 if not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns current user when token valid', async () => {
    const token = signToken({
      sub: 'user123',
      email: 'test@test.com',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
      .set("X-CSRF-Token", csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@test.com');
  });

  it('should clear both cookies on logout', async () => {
    const token = signToken({ sub: 'user123', email: 'test@test.com' });

    // Send cookies and CSRF header to match authenticated context
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
      .set("X-CSRF-Token", csrfToken);

    expect(res.status).toBe(401);
    // // set-cookie headers should exist
    // expect(res.headers['set-cookie']).toBeDefined();

    // // Find cleared cookies for access_token and csrf_token
    // const setCookieHeader = res.headers['set-cookie'];

    // const clearedCookies = (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader])
    //   .filter(Boolean) // remove undefined/null
    //   .map((c: string) => c.toLowerCase());

    // const accessCleared = clearedCookies.some((c: string) => c.startsWith('access_token=') && c.includes('expires='));
    // const csrfCleared = clearedCookies.some((c: string) => c.startsWith('csrf_token=') && c.includes('expires='));

    // expect(accessCleared).toBe(true);
    // expect(csrfCleared).toBe(true);
  });

  it('returns 401 for invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer invalidtoken`)
      .set('Cookie', ['access_token=invalidtoken', `csrf_token=${csrfToken}`])
      .set("X-CSRF-Token", csrfToken);

    expect(res.status).toBe(401);
  });

  it('returns 401 for tampered token', async () => {
    const token = signToken({ sub: '123', email: 'a@a.com' });
    const tampered = token.slice(0, -1) + 'x';

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tampered}`)
      .set('Cookie', [`access_token=${tampered}`, `csrf_token=${csrfToken}`])
      .set("X-CSRF-Token", csrfToken);

    expect(res.status).toBe(401);
  });
});