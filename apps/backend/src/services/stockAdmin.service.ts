import { Database } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/httpError';
import type { PrismaClient } from '@prisma/client';

export class StockAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  /**
   * @method getStores
   * @description Mengambil daftar toko (untuk filter dropdown)
   */
  public getStores = async (role: string, storeId?: number | 'all') => {
    if (role === 'store_admin') {
      if (!storeId || storeId === 'all')
        throw new BadRequestError(
          'Store admin hanya dapat melihat toko sendiri'
        );
      const store = await this.prisma.stores.findUnique({
        where: { id: Number(storeId) },
      });
      if (!store) throw new NotFoundError('Toko tidak ditemukan');
      return [store];
    }

    // Super admin / admin: semua toko
    const stores = await this.prisma.stores.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return stores;
  };

  /**
   * @method getStockHistory
   * @description Mendapatkan data history stok dengan filter dan pagination
   */
  public getStockHistory = async (params: {
    role: string;
    storeId?: number | 'all';
    month: string; // format: YYYY-MM
    productName?: string;
    page?: number;
    limit?: number;
  }) => {
    const { role, storeId, month, productName, page = 1, limit = 10 } = params;

    if (!role) throw new BadRequestError('Role wajib diisi');
    if (!month)
      throw new BadRequestError('Parameter bulan (month) wajib diisi');

    const skip = (page - 1) * limit;

    // Filter awal
    const where: any = {
      inventory: {
        store: {},
        product: {},
      },
    };

    // Role-based filtering
    if (role === 'store_admin') {
      if (!storeId || storeId === 'all')
        throw new BadRequestError(
          'Store admin hanya dapat melihat stok tokonya sendiri'
        );
      where.inventory.store_id = Number(storeId);
    } else if (role === 'super_admin') {
      if (storeId && storeId !== 'all') {
        where.inventory.store_id = Number(storeId);
      }
    }

    // Filter bulan
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    where.created_at = {
      gte: startDate,
      lt: endDate,
    };

    // Filter produk
    if (productName) {
      where.inventory.product = {
        name: { contains: productName, mode: 'insensitive' },
      };
    }

    // Query utama
    const [data, total] = await Promise.all([
      this.prisma.stock_journals.findMany({
        where,
        include: {
          inventory: {
            include: {
              store: { select: { id: true, name: true } },
              product: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stock_journals.count({ where }),
    ]);

    // Mapping data agar mudah dibaca di FE
    const formatted = data.map((j) => ({
      id: j.id,
      date: j.created_at,
      store: j.inventory.store.name,
      product: j.inventory.product.name,
      type: j.type,
      quantity: j.quantity,
      note: j.note,
    }));

    // Ringkasan bulanan
    const summaryAgg = await this.prisma.stock_journals.groupBy({
      by: ['type'],
      where,
      _sum: { quantity: true },
    });

    const totalAdd =
      summaryAgg.find((x) => x.type === 'in')?._sum.quantity || 0;
    const totalDeduct =
      summaryAgg.find((x) => x.type === 'out')?._sum.quantity || 0;

    // Ambil stok akhir tiap produk
    const endStockData = await this.prisma.inventories.findMany({
      where: storeId && storeId !== 'all' ? { store_id: Number(storeId) } : {},
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    const totalEnd = endStockData.reduce((acc, item) => acc + item.stock, 0);

    return {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalAdd,
        totalDeduct,
        totalEnd,
      },
      data: formatted,
    };
  };
}
