import { PrismaClient } from '@prisma/client';
import { Database } from '../config/prisma';
import { ConflictError, NotFoundError } from '../utils/httpError';

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
  public login = async (email: string) => {
    // TODO: Implementasikan logika validasi user dan password di sini.

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      // Throwing Custom Error: Service hanya fokus pada error bisnis
      throw new NotFoundError('User tidak ditemukan');
    }

    return { message: 'User login successfully' };
  };

  /**
   * Logika untuk proses registrasi pengguna baru.
   * @returns {Promise<{ message: string }>}
   */
  public register = async (email: string) => {
    // TODO: Implementasikan logika pembuatan user baru di sini.

    const userExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist) {
      // Throwing Custom Error
      throw new ConflictError('Email sudah terdaftar');
    }

    return { message: 'User register successfully' };
  };
}
