import { Database } from '../config/prisma';
import type { PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../utils/httpError';
import type { StockType } from '@prisma/client';

export class InventoryAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  // GET: Inventories
  public getInventories = async ({
    page,
    limit,
    search,
    store_id,
    role,
    user_id,
    sort,
    order,
  }: {
    page: number;
    limit: number;
    search: string;
    store_id?: number;
    role: string;
    user_id?: number;
    sort?: string;
    order?: string;
  }) => {
    const skip = (page - 1) * limit;

    // Determine store access based on role
    let effectiveStoreId = store_id;
    if (role === 'store_admin' && user_id) {
      const storeAdmin = await this.prisma.store_admins.findFirst({
        where: { user_id },
      });
      if (!storeAdmin) throw new NotFoundError('Store admin not found.');
      effectiveStoreId = storeAdmin.store_id; // restrict to their own store
    }

    const [products, total] = await Promise.all([
      this.prisma.products.findMany({
        where: {
          name: { contains: search, mode: 'insensitive' },
        },
        include: {
          inventories: effectiveStoreId
            ? {
                where: { store_id: effectiveStoreId },
                include: { journals: true },
              }
            : { include: { journals: true, store: true } },
          images: true,
        },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.products.count({
        where: { name: { contains: search, mode: 'insensitive' } },
      }),
    ]);

    // Format product response
    let data = products.map((p) => {
      const inv = p.inventories[0];
      const photo = p.images[0]?.image_url ?? '';
      const stock = inv?.stock ?? 0;
      const inc =
        inv?.journals
          .filter((j) => j.type === 'in')
          .reduce((sum, j) => sum + j.quantity, 0) ?? 0;
      const dec =
        inv?.journals
          .filter((j) => j.type === 'out')
          .reduce((sum, j) => sum + j.quantity, 0) ?? 0;

      return {
        id: p.id,
        name: p.name,
        photo,
        stock,
        inc,
        dec,
      };
    });

    // Sorting logic
    if (sort === 'stock') {
      if (order === 'asc') data.sort((a, b) => a.stock - b.stock);
      if (order === 'desc') data.sort((a, b) => b.stock - a.stock);
    } else if (sort === 'alphabet') {
      if (order === 'asc') data.sort((a, b) => a.name.localeCompare(b.name));
      if (order === 'desc') data.sort((a, b) => b.name.localeCompare(a.name));
    }

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  };

  // POST: Inventories
  public createOrUpdateInventory = async ({
    product_id,
    store_id,
    type,
    quantity,
    note,
  }: {
    product_id: number;
    store_id: number;
    type: StockType;
    quantity: number;
    note?: string;
  }) => {
    if (!product_id || !store_id || !type || !quantity) {
      throw new BadRequestError('Missing Required Fields.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: product_id },
      });
      if (!product) throw new NotFoundError('Product not found.');

      const inventory = await tx.inventories.upsert({
        where: { product_id_store_id: { product_id, store_id } },
        update: {},
        create: { product_id, store_id, stock: 0 },
      });

      let newStock = inventory.stock;
      if (type === 'in') {
        newStock += quantity;
      } else if (type === 'out') {
        newStock -= quantity;
        if (newStock < 0) throw new BadRequestError('Stock cannot be below 0.');
      }

      await tx.inventories.update({
        where: { id: inventory.id },
        data: { stock: newStock },
      });

      const journal = await tx.stock_journals.create({
        data: {
          inventory_id: inventory.id,
          type,
          quantity,
          note,
        },
      });

      return {
        message: 'Stock updated successfully',
        inventory_id: inventory.id,
        new_stock: newStock,
        journal_id: journal.id,
      };
    });
  };

  // GET: Stores
  public getStores = async (role: string, user_id?: number) => {
    if (role === 'super_admin') {
      return await this.prisma.stores.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    }

    if (role === 'store_admin' && user_id) {
      const storeAdmin = await this.prisma.store_admins.findFirst({
        where: { user_id },
        include: { store: true },
      });
      if (!storeAdmin) throw new NotFoundError('Store admin not found.');
      return [{ id: storeAdmin.store.id, name: storeAdmin.store.name }];
    }

    throw new BadRequestError('Invalid Role');
  };
}
