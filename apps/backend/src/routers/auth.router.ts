import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

/**
 * @class AuthRouter
 * @description
 * Kelas ini bertanggung jawab untuk mendefinisikan semua route yang
 * berhubungan dengan fitur autentikasi.
 * Tujuannya adalah untuk mengelompokkan endpoint agar struktur proyek lebih rapi.
 */
class AuthRouter {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  /**
   * @class AuthRouter
   * @description
   * Kelas ini bertanggung jawab untuk mendefinisikan semua route yang
   * berhubungan dengan fitur autentikasi.
   * Tujuannya adalah untuk mengelompokkan endpoint agar struktur proyek lebih rapi.
   */
  private initializeRoutes() {
    // GET /register akan ditangani oleh method `register` dari authController.
    // Kita bisa langsung memanggilnya karena method di controller sudah menggunakan arrow function.
    this.router.get('/register', this.authController.register);

    // GET /login akan ditangani oleh method `login` dari authController.
    this.router.get('/login', this.authController.login);
  }
}

export default new AuthRouter().router;
