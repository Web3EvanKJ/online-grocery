import { Database } from '../config/prisma';
import { NotFoundError } from '../utils/httpError';
import type { Prisma, PrismaClient } from '@prisma/client';

export class SalesAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  public getSalesReport = async (params: {
    role: string;
    storeId?: number | 'all';
    categoryId?: number | 'all';
    productName?: string;
    month?: string; // format 'YYYY-MM'
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
  }) => {
    const {
      role,
      storeId = 'all',
      categoryId = 'all',
      productName = '',
      month,
      page = 1,
      limit = 10,
      sort = 'desc',
    } = params;

    const validStatuses: (
      | 'Diproses'
      | 'Pesanan_Dikonfirmasi'
      | 'Dibatalkan'
    )[] = ['Diproses', 'Pesanan_Dikonfirmasi', 'Dibatalkan'];

    // Convert month into date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (month) {
      const [year, m] = month.split('-').map(Number);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 1);
    }

    const whereClause: Prisma.ordersWhereInput = {
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

    // Fetch orders
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

    // Transform into flat report items
    const report = orders
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
      })
      .sort((a, b) =>
        sort === 'asc'
          ? a.totalSales - b.totalSales
          : b.totalSales - a.totalSales
      );

    const totalRevenue = report.reduce((sum, i) => sum + i.totalSales, 0);
    const avgSales = report.length ? totalRevenue / report.length : 0;

    return {
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalRevenue,
        avgSales,
        totalProducts: report.length,
      },
      data: report,
    };
  };

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

  public getCategories = async () => {
    return await this.prisma.categories.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  };
}
