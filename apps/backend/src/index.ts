import './logger';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { config } from './config/dotenv';
import { apiRequestLogger } from './helpers/logging.helper';
import authRouter from './routers/auth.router';

/**
 * @class Server
 * @description
 * Kelas utama yang membungkus dan mengonfigurasi seluruh aplikasi Express.
 * Bertanggung jawab untuk memulai server dan menyatukan semua komponen
 * seperti middleware, routes, dan error handling.
 */
class Server {
  private app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = config.PORT;

    // Memanggil semua method inisialisasi dengan urutan yang benar
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Mengonfigurasi semua middleware yang dibutuhkan oleh aplikasi.
   * Middleware dieksekusi secara berurutan untuk setiap request yang masuk.
   */
  private initializeMiddleware() {
    this.app.use(cors()); // Mengizinkan request dari origin yang berbeda (Cross-Origin Resource Sharing)
    this.app.use(express.json()); // Mem-parsing body request yang berformat JSON
    this.app.use(apiRequestLogger); // Middleware custom untuk logging setiap request yang masuk
  }

  /**
   * Mendaftarkan semua router utama ke dalam aplikasi.
   * Setiap router mewakili sebuah fitur atau modul.
   */
  private initializeRoutes() {
    // Endpoint dasar untuk health check atau selamat datang
    this.app.get('/api', (req: Request, res: Response) => {
      res.send('Selamat datang di-Backend Monorepo');
    });

    // Semua request yang diawali dengan '/api/auth' akan diarahkan ke authRouter
    this.app.use('/api/auth', authRouter);

    // TODO: Daftarkan router lain di sini jika ada, contoh:
    // this.app.use('/api/products', productRouter);
  }

  /**
   * Mengonfigurasi middleware untuk penanganan error.
   * PENTING: Middleware ini harus didaftarkan SETELAH semua routes.
   */
  private initializeErrorHandling() {
    // Middleware untuk menangani route yang tidak ditemukan (404 Not Found)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).send({
        msg: 'Not Found!',
        error: `Path ${req.originalUrl} tidak ditemukan`,
      });
    });

    // Middleware global untuk menangani semua error lain (Error 500 atau lainnya)
    // Error yang dilempar dari mana saja (terutama dari controller) akan ditangkap di sini.
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error('GLOBAL_ERROR_HANDLER:', err.stack);
        res.status(err.status || 500).send({
          msg: err.message || 'Internal Server Error',
          error: err.name || 'Error',
        });
      }
    );
  }

  /**
   * Method publik untuk menjalankan server.
   */
  public listen() {
    this.app.listen(this.port, () => {
      console.info(
        `✅ Server Api Running... \n ➜  [API] 🚀 Local: http://localhost:${this.port}`
      );
    });
  }
}

// === Titik Awal Aplikasi ===
// Membuat instance dari Server dan menjalankannya.
const server = new Server();
server.listen();
