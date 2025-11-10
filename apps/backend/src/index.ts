import cors from 'cors';
import express from 'express';

import { config } from './config/dotenv';
// import exampleRouter from './routers/example.router';
import { HttpError } from './utils/httpError';

import type { Application, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import userAdminRouter from './routers/userAdmin.router';
import productAdminRouter from './routers/productAdmin.router';
import categoryAdminRouter from './routers/categoryAdmin.router';
import inventoryAdminRouter from './routers/inventoryAdmin.router';
import discountAdminRouter from './routers/discountAdmin.router';
import salesAdminRouter from './routers/salesAdmin.router';
import stockAdminRouter from './routers/stockAdmin.router';
import productSearchRouter from './routers/productSearch.router';
import storeLocationRouter from './routers/storeLocation.router';

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

    // const limiter = rateLimit({
    //   windowMs: 15 * 60 * 1000, // 15 minutes
    //   max: 100, // limit each IP to 100 requests per windowMs
    // });
    // this.app.use(limiter);
  }

  /**
   * @method initializeRoutes
   * @description Mendaftarkan semua router utama ke dalam aplikasi.
   * Setiap router mewakili sebuah fitur atau modul.
   */
  private initializeRoutes() {
    // Endpoint dasar untuk health check atau selamat datang
    this.app.get('/api', (_req: Request, res: Response) => {
      res.send('Selamat datang di-Backend Monorepo');
    });

    // Semua request yang diawali dengan '/api/auth' akan diarahkan ke exampleRouter
    // this.app.use('/api/auth', exampleRouter);

    this.app.use('/api/admin/users', userAdminRouter);
    this.app.use('/api/admin/products', productAdminRouter);
    this.app.use('/api/admin/categories', categoryAdminRouter);
    this.app.use('/api/admin/inventories', inventoryAdminRouter);
    this.app.use('/api/admin/discounts', discountAdminRouter);
    this.app.use('/api/admin/sales', salesAdminRouter);
    this.app.use('/api/admin/stocks', stockAdminRouter);
    this.app.use('/api/productSearch', productSearchRouter);
    this.app.use('/api/store-location/', storeLocationRouter);
  }

  /**
   * @method initializeErrorHandling
   * @description Mengonfigurasi middleware untuk penanganan error.
   * PENTING: Harus didaftarkan SETELAH SEMUA ROUTES.
   */
  private initializeErrorHandling() {
    // Middleware untuk menangani route yang tidak ditemukan (404 Not Found)
    this.app.use((req: Request, res: Response, _next: NextFunction) => {
      res.status(404).send({
        msg: 'Not Found!',
        error: `Path ${req.originalUrl} tidak ditemukan`,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * @function GlobalErrorHandler
     * @description Middleware global untuk menangani semua error (Custom Error atau System Error).
     * Error yang dilempar dari controller (melalui next(error)) akan ditangkap di sini.
     */
    this.app.use(
      (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        const isCustomError = err instanceof HttpError;

        const status = isCustomError ? err.status : 500;
        const message = isCustomError ? err.message : 'Internal Server Error';
        const errorName = isCustomError ? err.name : 'UnknownError';

        if (err instanceof Error) {
          if (status >= 500) {
            console.error('GLOBAL_SERVER_ERROR:', err.stack);
          } else {
            console.warn(`HTTP_ERROR [${status.toString()}]: ${err.message}`);
          }
        }

        res.status(status).send({
          msg: message,
          error: errorName,
          timestamp: new Date().toISOString(),
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
        `✅ Server Api Running... \n ➜  [API] 🚀 Local: http://localhost:${String(this.port)}`
      );
    });
  }
}

// === Titik Awal Aplikasi ===
// Membuat instance dari Server dan menjalankannya.
const server = new Server();
server.listen();
