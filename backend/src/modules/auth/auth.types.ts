export interface JwtPayload {
  sub: string;        // user.id (subject field)
  email: string;
  name?: string | null;
  image?: string;
  iat?: number;
  exp?: number;
}
