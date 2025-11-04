import { Prisma, PrismaClient } from '@prisma/client';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../utils/httpError';
import {
  DiscountCreateInput,
  DiscountUpdateInput,
} from '../utils/type/discounts';
import { Database } from '../config/prisma';

export class DiscountAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  public async create({ role, store_id, data }: DiscountCreateInput) {
    return await this.prisma.$transaction(async (tx) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);

      if (end < start) {
        throw new BadRequestError('End date must be greater than start date.');
      }

      if (data.product_id) {
        const product = await tx.products.findUnique({
          where: { id: data.product_id },
        });
        if (!product) {
          throw new BadRequestError(`Invalid product name.`);
        }
      }

      // Verify the store exists
      const store = await tx.stores.findUnique({ where: { id: store_id } });
      if (!store) {
        throw new BadRequestError(`Store not found.`);
      }

      // For store_admin, ensure they can only create for their own store
      if (role === 'store_admin') {
        const storeAdmin = await tx.store_admins.findUnique({
          where: { store_id },
        });

        if (!storeAdmin) {
          throw new UnauthorizedError(
            'You are not authorized to create discounts for this store.'
          );
        }
      } else if (role !== 'super_admin') {
        throw new UnauthorizedError('Invalid role for creating discounts.');
      }

      // Check overlapping discounts
      const overlapping = await tx.discounts.findFirst({
        where: {
          store_id,
          product_id: data.product_id,
          OR: [{ start_date: { lte: end }, end_date: { gte: start } }],
        },
      });

      if (overlapping) {
        throw new ConflictError(
          'There is already an active discount overlapping this date range.'
        );
      }

      const created = await tx.discounts.create({
        data: {
          store_id: Number(store_id),
          product_id: data.product_id ?? null,
          type: data.type,
          inputType: data.inputType ?? 'nominal',
          value: data.value ?? new Prisma.Decimal(0),
          min_purchase: data.min_purchase ?? null,
          max_discount: data.max_discount ?? null,
          start_date: start,
          end_date: end,
        },
      });

      return created;
    });
  }

  public async update(id: number, data: DiscountUpdateInput) {
    const existing = await this.prisma.discounts.findUnique({ where: { id } });
    if (!existing) throw new BadRequestError('Discount not found.');

    const start = new Date(data.start_date as Date);
    const end = new Date(data.end_date as Date);

    if (end < start) {
      throw new BadRequestError('End date must be greater than start date.');
    }

    // Validate store ownership for store_admin
    if (data.role === 'store_admin') {
      if (existing.store_id !== data.store_id) {
        throw new UnauthorizedError(
          'You are not authorized to update discounts for another store.'
        );
      }
    } else if (data.role !== 'super_admin') {
      throw new UnauthorizedError('Invalid role for updating discounts.');
    }

    // Check overlap
    const overlap = await this.prisma.discounts.findFirst({
      where: {
        store_id: data.store_id,
        product_id: data.product_id,
        id: { not: id },
        OR: [{ start_date: { lte: end }, end_date: { gte: start } }],
      },
    });

    if (overlap) {
      throw new ConflictError(
        'There is already an active discount overlapping this date range.'
      );
    }

    const updateData: Prisma.discountsUpdateInput = {
      type: data.type,
      inputType: data.inputType ?? 'nominal',
      value: data.value ?? new Prisma.Decimal(0),
      min_purchase: data.min_purchase ?? null,
      max_discount: data.max_discount ?? null,
      start_date: start,
      end_date: end,
    };

    return await this.prisma.discounts.update({
      where: { id },
      data: updateData,
    });
  }

  public async getProducts(search?: string) {
    const where: Prisma.productsWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const products = await this.prisma.products.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return products;
  }
}
