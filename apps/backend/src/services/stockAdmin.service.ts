import { Database } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/httpError';
import type { Prisma, PrismaClient } from '@prisma/client';

export class StockAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  public getStores = async (role: string, user_id?: number) => {
    if (role === 'store_admin') {
      if (!user_id)
        throw new BadRequestError('User ID is required for store_admin.');

      const admin = await this.prisma.store_admins.findUnique({
        where: { user_id: Number(user_id) },
        include: { store: { select: { id: true, name: true } } },
      });

      if (!admin) throw new NotFoundError('No store found for this admin.');

      // Return as an array to keep consistent return type
      return [admin.store];
    }

    // Super admin
    if (role === 'super_admin') {
      const stores = await this.prisma.stores.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
      return stores;
    }
  };

  public getStockHistory = async (params: {
    role: string;
    storeId?: number | 'all';
    month: string; // format YYYY-MM
    productName?: string;
    page?: number;
    limit?: number;
  }) => {
    const { role, storeId, month, productName, page = 1, limit = 10 } = params;

    if (!role) throw new BadRequestError('Role is required.');
    if (!month) throw new BadRequestError('Month is Required.');

    const skip = (page - 1) * limit;

    const where: Prisma.stock_journalsWhereInput = {
      inventory: {},
    };

    // Role-based filtering
    if (role === 'store_admin') {
      if (!storeId || storeId === 'all')
        throw new BadRequestError('Invalid Store.');

      where.inventory = {
        store_id: Number(storeId),
      };
    } else if (role === 'super_admin' && storeId && storeId !== 'all') {
      where.inventory = {
        store_id: Number(storeId),
      };
    }

    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 1);
    where.created_at = {
      gte: startDate,
      lt: endDate,
    };

    if (productName) {
      const inventoryFilter: Prisma.inventoriesWhereInput = {
        ...where.inventory,
        product: {
          name: { contains: productName, mode: 'insensitive' },
        },
      };
      where.inventory = inventoryFilter;
    }

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

    const formatted = data.map((j) => ({
      id: j.id,
      date: j.created_at,
      store: j.inventory.store.name,
      product: j.inventory.product.name,
      type: j.type,
      quantity: j.quantity,
      note: j.note,
    }));

    const summaryAgg = await this.prisma.stock_journals.groupBy({
      by: ['type'],
      where,
      _sum: { quantity: true },
    });

    const totalAdd =
      summaryAgg.find((x) => x.type === 'in')?._sum.quantity || 0;
    const totalDeduct =
      summaryAgg.find((x) => x.type === 'out')?._sum.quantity || 0;

    const totalEnd = totalAdd - totalDeduct;

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
