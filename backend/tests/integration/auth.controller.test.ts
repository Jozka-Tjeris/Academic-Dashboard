import request from "supertest";
import { app } from "@/app";
import { signToken } from "@/modules/auth/jwt";

describe("auth user check test", () => {
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
      .set('Cookie', [`access_token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@test.com');
  });

  it('should clear cookie on logout', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
})
