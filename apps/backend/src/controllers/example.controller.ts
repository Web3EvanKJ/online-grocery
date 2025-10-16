import { ExampleService } from '../services/example.service';

import type { NextFunction, Request, Response } from 'express';

/**
 * @class AuthController
 * @description
 * Bertindak sebagai penghubung antara HTTP layer (route) dan business logic layer (service).
 * Tanggung jawab utamanya adalah menerima `request`, memanggil `service` yang sesuai,
 * dan mengirim `response` kembali ke client.
 */
export class ExampleController {
  private service: ExampleService;

  constructor() {
    // Dependency Injection: Controller ini bergantung pada AuthService.
    // Kita membuat instance service di sini.
    this.service = new ExampleService();

    // Lakukan bind jika tidak menggunakan arrow function
    this.register = this.register.bind(this);
  }

  /**
   * @method login
   * @description Menangani request untuk login pengguna.
   * Proses: Panggil Service -> Jika error, tangkap dan teruskannya (next(error)).
   *
   * @style_guide
   * SEMUA method controller yang akan digunakan sebagai route handler WAJIB
   * didefinisikan sebagai "public arrow function property" seperti di bawah ini.
   * Tujuannya adalah untuk mengikat konteks `this` secara otomatis, sehingga kita
   * bisa mengakses `this.service` tanpa masalah saat method ini dipanggil oleh Express Router.
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string };
      const response = await this.service.login(email);
      res.json(response);
    } catch (error) {
      // Meneruskan error ke middleware error handler global
      console.error('ERROR_LOGIN:', error);
      next(error);
    }
  };

  /**
   * @method register
   * @description Menangani request untuk register pengguna.
   *
   * @style_guide
   * Jika ingin menggunakan async funtion langsung
   * Anda harus melakukan 'bind' dalam constructor
   * contoh code -> this.register = this.register.bind(this);
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body as { email: string };
      const response = await this.service.register(email);
      res.json(response);
    } catch (error) {
      // Meneruskan error ke middleware error handler global
      console.error('ERROR_REGISTER:', error);
      next(error);
    }
  }
}
