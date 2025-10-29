import { Database } from '../config/prisma';
import { NotFoundError } from '../utils/httpError';
import type { PrismaClient } from '@prisma/client';

export class SalesAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  /**
   * 🔹 Mendapatkan laporan penjualan dengan filter
   */
  public getSalesReport = async (params: {
    role: string;
    storeId?: number | 'all';
    categoryId?: number | 'all';
    productName?: string;
    month?: string; // format 'YYYY-MM'
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc'; // 🆕 add sort param
  }) => {
    const {
      role,
      storeId = 'all',
      categoryId = 'all',
      productName = '',
      month,
      page = 1,
      limit = 10,
      sort = 'desc', // 🆕 default sort: highest first
    } = params;

    // Filter order status
    const validStatuses = ['Diproses', 'Pesanan_Dikonfirmasi', 'Dibatalkan'];

    // Konversi bulan ke rentang tanggal
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (month) {
      const [year, m] = month.split('-').map(Number);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 1);
    }

    const whereClause: any = {
      status: { in: validStatuses },
      ...(startDate &&
        endDate && {
          created_at: { gte: startDate, lt: endDate },
        }),
      ...(role === 'store_admin' &&
        storeId &&
        !isNaN(Number(storeId)) && { store_id: Number(storeId) }),
      ...(role === 'super_admin' &&
        storeId !== 'all' &&
        !isNaN(Number(storeId)) && { store_id: Number(storeId) }),
    };

    // Ambil data orders beserta item dan produk
    const [totalCount, orders] = await this.prisma.$transaction([
      this.prisma.orders.count({ where: whereClause }),
      this.prisma.orders.findMany({
        where: whereClause,
        include: {
          store: true,
          order_items: {
            include: {
              product: { include: { category: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    // 🔹 Transformasi data ke bentuk laporan
    // 🔹 Transformasi data ke bentuk laporan
    let report = orders
      .flatMap((order) =>
        order.order_items.map((item) => ({
          store_id: order.store.id,
          store: order.store.name,
          category_id: item.product.category.id,
          category: item.product.category.name,
          product: item.product.name,
          totalSales: Number(item.price) * item.quantity,
          period: month || order.created_at?.toISOString().slice(0, 7),
          status: order.status,
        }))
      )
      .filter((item) => {
        const matchStore =
          storeId === 'all' || item.store_id === Number(storeId);

        const matchCategory =
          categoryId === 'all' || item.category_id === Number(categoryId);

        const matchProduct =
          !productName ||
          item.product.toLowerCase().includes(productName.toLowerCase());

        return matchStore && matchCategory && matchProduct;
      });

    // 🧮 Sort by totalSales
    report = report.sort((a, b) =>
      sort === 'asc' ? a.totalSales - b.totalSales : b.totalSales - a.totalSales
    );

    return {
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      data: report,
    };
  };

  /**
   * 🔹 Ambil daftar toko untuk filter
   */
  public getStores = async (role: string, userId: number) => {
    if (role === 'super_admin') {
      return await this.prisma.stores.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    }

    const admin = await this.prisma.store_admins.findUnique({
      where: { user_id: userId },
      include: { store: { select: { id: true, name: true } } },
    });

    if (!admin) throw new NotFoundError('Store admin tidak ditemukan');
    return [admin.store];
  };

  /**
   * 🔹 Ambil daftar kategori untuk filter
   */
  public getCategories = async () => {
    return await this.prisma.categories.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  };
}
