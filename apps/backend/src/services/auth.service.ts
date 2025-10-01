import { PrismaClient } from '@prisma/client';
import { Database } from '../config/prisma';

/**
 * @class AuthService
 * @description
 * Berisi semua logika bisnis yang terkait dengan autentikasi.
 * Kelas ini bertanggung jawab untuk berinteraksi dengan database dan
 * melakukan validasi data. Service TIDAK BOLEH tahu tentang `req` dan `res` dari Express.
 */

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    // Menginisialisasi koneksi Prisma melalui instance singleton
    this.prisma = new Database().getInstance();
  }

  /**
   * Logika untuk proses login pengguna.
   * @returns {Promise<{ message: string }>}
   */
  public login = async () => {
    // TODO: Implementasikan logika validasi user dan password di sini.
    // Contoh: const user = await this.prisma.user.findUnique(...);
    return { message: 'User login successfully' };
  };

  /**
   * Logika untuk proses registrasi pengguna baru.
   * @returns {Promise<{ message: string }>}
   */
  public register = async () => {
    // TODO: Implementasikan logika pembuatan user baru di sini.
    // Contoh: const newUser = await this.prisma.user.create(...);
    return { message: 'User register successfully' };
  };
}
