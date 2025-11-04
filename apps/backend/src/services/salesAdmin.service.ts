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
    month?: string; // 'YYYY-MM'
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
  }) => {
    const {
      role,
      storeId = 'all',
      categoryId = 'all',
      productName,
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

    // Handle month filter
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (month) {
      const [year, m] = month.split('-').map(Number);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 1);
    }

    // Build where clause for order_items
    const whereClause: Prisma.order_itemsWhereInput = {
      order: {
        status: { in: validStatuses },
        ...(startDate &&
          endDate && {
            created_at: { gte: startDate, lt: endDate },
          }),
        ...(role === 'store_admin' &&
          storeId !== 'all' && {
            store_id: Number(storeId),
          }),
        ...(role === 'super_admin' &&
          storeId !== 'all' && {
            store_id: Number(storeId),
          }),
      },
      product: {
        ...(categoryId !== 'all' && { category_id: Number(categoryId) }),
        ...(productName && {
          name: { contains: productName, mode: 'insensitive' },
        }),
      },
    };

    // Query directly from order_items
    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.order_items.count({ where: whereClause }),
      this.prisma.order_items.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              store: true,
            },
          },
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { price: sort },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Transform results
    const report = items.map((item) => ({
      store_id: item.order.store.id,
      store: item.order.store.name,
      category_id: item.product.category.id,
      category: item.product.category.name,
      product: item.product.name,
      price: Number(item.price),
      quantity: item.quantity,
      totalSales: Number(item.price) * item.quantity,
      period: month || item.order.created_at?.toISOString().slice(0, 7),
      status: item.order.status,
    }));

    // Summaries
    const allItems = await this.prisma.order_items.findMany({
      where: whereClause,
      select: { price: true, quantity: true },
    });

    const totalRevenue = allItems.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0
    );
    const totalProducts = allItems.length;
    const avgSales = totalProducts ? totalRevenue / totalProducts : 0;

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

    if (!admin) throw new NotFoundError('Store admin not found.');
    return [admin.store];
  };

  public getCategories = async () => {
    return await this.prisma.categories.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  };
}
