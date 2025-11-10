// src/middleware/auth.middleware.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { sendError } from '../utils/response';
import { AuthRequest, AuthUser } from '../types/express';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      sendError(res, 401, 'Access denied. No token provided.');
      return;
    }

    const user = await verifyToken(token);
    
    if (!user.is_verified) {
      sendError(res, 403, 'Please verify your email first.');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 401, 'Invalid token.');
  }
};

const extractToken = (req: AuthRequest): string | null => {
  const authHeader = req.header('Authorization');
  return authHeader ? authHeader.replace('Bearer ', '') : null;
};

const verifyToken = async (token: string): Promise<AuthUser> => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  
  const user = await prisma.users.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      is_verified: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Ensure phone is a string to satisfy AuthUser type (convert null to empty string)
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? '',
    role: user.role,
    is_verified: user.is_verified
  };

  return authUser;
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 403, 'Access denied. Insufficient permissions.');
      return;
    }
    next();
  };
};