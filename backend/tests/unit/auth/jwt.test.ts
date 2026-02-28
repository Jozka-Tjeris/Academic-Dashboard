import { signToken, verifyToken } from "../../../src/modules/auth/jwt";

describe('jwt utils', () => {
  it('should sign and verify token', () => {
    const token = signToken({ sub: '123', email: 'test@test.com' });
    const decoded = verifyToken(token);

    expect(decoded.sub).toBe('123');
  });
});
