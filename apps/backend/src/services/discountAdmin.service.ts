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

  public async create({ role, user_id, data }: DiscountCreateInput) {
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
          throw new BadRequestError(`Invalid product mame.`);
        }
      }

      // Automatically get store_id based on user_id (if store_admin)
      let targetStores: { id: number }[] = [];

      if (role === 'store_admin') {
        const storeAdmin = await tx.store_admins.findUnique({
          where: { user_id: user_id },
          select: { store_id: true },
        });

        if (!storeAdmin) {
          throw new UnauthorizedError('You are not assigned to any store.');
        }

        const store_id = storeAdmin.store_id;

        //  Check overlapping discount for the same store
        const overlapping = await tx.discounts.findFirst({
          where: {
            store_id,
            OR: [{ start_date: { lte: end }, end_date: { gte: start } }],
          },
        });

        if (overlapping) {
          throw new ConflictError(
            `There is already an active discount overlapping this date range.`
          );
        }

        targetStores = [{ id: store_id }];
      } else if (role === 'super_admin') {
        targetStores = await tx.stores.findMany({ select: { id: true } });
      } else {
        throw new UnauthorizedError('Invalid role for creating discounts.');
      }

      const created = await Promise.all(
        targetStores.map((s) =>
          tx.discounts.create({
            data: {
              store_id: s.id,
              product_id: data.product_id ?? null,
              type: data.type,
              inputType: data.inputType ?? 'nominal',
              value: data.value ?? new Prisma.Decimal(0),
              min_purchase: data.min_purchase ?? null,
              max_discount: data.max_discount ?? null,
              start_date: start,
              end_date: end,
            },
          })
        )
      );

      return created;
    });
  }

  public async update(id: number, data: DiscountUpdateInput) {
    const existing = await this.prisma.discounts.findUnique({ where: { id } });
    if (!existing) throw new BadRequestError('Discount not found.');
    console.log(data);

    const start = new Date(data.start_date as Date);
    const end = new Date(data.end_date as Date);

    if (end < start) {
      throw new BadRequestError('End date must be greater than start date.');
    }

    if (data.role === 'store_admin') {
      const storeAdmin = await this.prisma.store_admins.findUnique({
        where: { user_id: data.user_id },
        select: { store_id: true },
      });

      if (!storeAdmin) {
        throw new UnauthorizedError('You are not assigned to any store.');
      }

      if (existing.store_id !== storeAdmin.store_id) {
        throw new UnauthorizedError(
          'You are not authorized to update discounts for another store.'
        );
      }
    } else if (data.role !== 'super_admin') {
      throw new UnauthorizedError('Invalid role for updating discounts.');
    }

    const overlap = await this.prisma.discounts.findFirst({
      where: {
        store_id: existing.store_id,
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
