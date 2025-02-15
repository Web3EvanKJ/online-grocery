import { NextFunction, Request, Response } from 'express';
import { loginService, registerService } from '../services/auth.services';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const response = await registerService();
      res.json(response);
    } catch (error) {
      console.error('ERROR_REGISTER:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await loginService(req.body);
      res.json(response);
    } catch (error) {
      console.error('ERROR_LOGIN:', error);
      next(error);
    }
  }
}
