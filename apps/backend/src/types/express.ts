import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  is_verified: boolean;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}

export interface JwtPayloadExtended extends JwtPayload {
  userId: number;
  email: string;
  role: string;
}