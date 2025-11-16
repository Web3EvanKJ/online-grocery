import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user.role; // pastikan JWT menyimpan role
    console.log('authorizeRole check:', userRole, roles);
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};
