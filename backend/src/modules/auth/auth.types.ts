export interface JwtPayload {
  sub: string;        // user.id (subject field)
  email: string;
  name?: string | null;
  iat?: number;
  exp?: number;
}
