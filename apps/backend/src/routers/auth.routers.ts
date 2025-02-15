import { Router } from 'express';
import { AuthController } from '../controllers/auth.controllers';

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/register', this.authController.register);
    this.router.get('/login', this.authController.login);
  }
}
