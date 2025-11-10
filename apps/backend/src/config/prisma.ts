import { PrismaClient } from '@prisma/client';

/**
 * @class Database
 * @description
 * Mengelola koneksi database menggunakan PrismaClient.
 * Kelas ini menerapkan "Singleton Design Pattern". Tujuannya adalah untuk memastikan
 * bahwa HANYA ADA SATU instance (objek) PrismaClient yang dibuat selama aplikasi berjalan.
 * Ini mencegah pembuatan koneksi database yang berlebihan dan boros sumber daya.
 */
export class Database {
  /**
   * @property {PrismaClient} instance
   * @private
   * @static
   * Properti statis ini akan menyimpan satu-satunya instance PrismaClient.
   * Keyword `static` berarti properti ini milik kelas `Database`, bukan objeknya.
   */
  private static instance: PrismaClient | null = null;

  /**
   * @method getInstance
   * @description
   * Method publik untuk mendapatkan instance PrismaClient.
   * Jika instance belum ada, ia akan membuatnya. Jika sudah ada, ia akan
   * mengembalikan instance yang sama yang telah dibuat sebelumnya.
   * @returns {PrismaClient} Instance tunggal dari PrismaClient.
   */
  public getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient();
      console.info('Connected to database');
    }

    return Database.instance;
  }
}