import jwt from 'jsonwebtoken';

export const generateToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};