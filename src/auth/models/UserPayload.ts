export interface UserPayload {
  sub: number;
  email: string;
  name: string;
  phone: string,
  username: string,
  iat?: number;
  exp?: number;
}
