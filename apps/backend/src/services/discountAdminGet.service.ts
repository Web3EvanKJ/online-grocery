import { Prisma, PrismaClient } from '@prisma/client';
import { Database } from '../config/prisma';
import { DiscountQueryOptions } from '../utils/type/discounts';

export class DiscountAdminGetService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  public async getAll(options: DiscountQueryOptions) {
    const {
      page,
      limit,
      type,
      product_name,
      sortBy = 'id',
      sortOrder = 'desc',
      date,
      store_id,
    } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.discountsWhereInput = {
      ...(type && { type }),
      ...(store_id && { store_id }),
      ...(product_name && {
        product: { name: { contains: product_name, mode: 'insensitive' } },
      }),
      ...(date && { start_date: { lte: date }, end_date: { gte: date } }),
    };

    const [discounts, total] = await Promise.all([
      this.prisma.discounts.findMany({
        where,
        include: {
          product: { select: { name: true } },
          store: { select: { name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.discounts.count({ where }),
    ]);

    const formattedDiscounts = discounts.map((d) => ({
      id: d.id,
      store_id: d.store_id,
      product_id: d.product_id,
      type: d.type,
      inputType: d.inputType,
      value: Number(d.value),
      min_purchase: d.min_purchase ? Number(d.min_purchase) : null,
      max_discount: d.max_discount ? Number(d.max_discount) : null,
      start_date: d.start_date.toISOString(),
      end_date: d.end_date.toISOString(),
      product_name: d.product?.name ?? null,
      store_name: d.store?.name ?? null,
    }));

    return {
      data: formattedDiscounts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getHistory(options: DiscountQueryOptions) {
    const {
      page,
      limit,
      type,
      product_name,
      sortBy = 'id',
      sortOrder = 'desc',
      store_id,
    } = options;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.discountsWhereInput = {
      ...(type && { type }),
      ...(store_id && { store_id }),
      ...(product_name && {
        product: { name: { contains: product_name, mode: 'insensitive' } },
      }),
      OR: [{ end_date: { lt: now } }, { start_date: { gt: now } }],
    };

    const [discounts, total] = await Promise.all([
      this.prisma.discounts.findMany({
        where,
        include: {
          product: { select: { name: true } },
          store: { select: { name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.discounts.count({ where }),
    ]);

    const formattedDiscounts = discounts.map((d) => ({
      id: d.id,
      store_id: d.store_id,
      product_id: d.product_id,
      type: d.type,
      inputType: d.inputType,
      value: Number(d.value),
      min_purchase: d.min_purchase ? Number(d.min_purchase) : null,
      max_discount: d.max_discount ? Number(d.max_discount) : null,
      start_date: d.start_date.toISOString(),
      end_date: d.end_date.toISOString(),
      product_name: d.product?.name ?? null,
      store_name: d.store?.name ?? null,
    }));

    return {
      data: formattedDiscounts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
