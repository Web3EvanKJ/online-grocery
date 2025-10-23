import { Database } from '../config/prisma';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/httpError';
import type { PrismaClient } from '@prisma/client';

export class InventoryAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  /**
   * Membuat data inventory baru jika belum ada untuk kombinasi product_id + store_id.
   */
  public create = async (data: {
    product_id: number;
    store_id: number;
    stock: number;
  }) => {
    const { product_id, store_id, stock } = data;

    if (!product_id || !store_id)
      throw new BadRequestError('Product ID dan Store ID wajib diisi');
    if (stock < 0) throw new BadRequestError('Stock tidak boleh di bawah 0');

    const existing = await this.prisma.inventories.findFirst({
      where: { product_id, store_id },
    });
    if (existing)
      throw new ConflictError('Inventory untuk produk dan toko ini sudah ada');

    const inventory = await this.prisma.inventories.create({
      data: { product_id, store_id, stock },
    });

    return { message: 'Inventory created successfully', inventory };
  };

  /**
   * Mengambil semua inventory dengan pagination + filter + search.
   */
  public getAll = async ({
    page,
    limit,
    storeId,
    role,
    search,
  }: {
    page: number;
    limit: number;
    storeId?: number;
    role?: string;
    search?: string;
  }) => {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role === 'store_admin' && storeId) where.store_id = storeId;
    if (role === 'super_admin' && storeId) where.store_id = storeId;
    if (search)
      where.product = { name: { contains: search, mode: 'insensitive' } };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventories.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
          journals: true,
        },
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.inventories.count({ where }),
    ]);

    const result = items.map((inv) => {
      const inc = inv.journals
        .filter((j) => j.type === 'in')
        .reduce((sum, j) => sum + j.quantity, 0);
      const dec = inv.journals
        .filter((j) => j.type === 'out')
        .reduce((sum, j) => sum + j.quantity, 0);

      return {
        id: inv.product.id,
        name: inv.product.name,
        photo: inv.product.images?.[0]?.image_url || '',
        stock: inv.stock,
        inc,
        dec,
      };
    });

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: result,
    };
  };

  /**
   * Update stok inventory (biasanya dipanggil dari journal creation).
   */
  public update = async (inventoryId: number, data: { stock: number }) => {
    if (data.stock < 0)
      throw new BadRequestError('Stock tidak boleh di bawah 0');

    const existing = await this.prisma.inventories.findUnique({
      where: { id: inventoryId },
    });
    if (!existing) throw new NotFoundError('Inventory tidak ditemukan');

    const updated = await this.prisma.inventories.update({
      where: { id: inventoryId },
      data: { stock: data.stock },
    });

    return { message: 'Inventory updated successfully', updated };
  };

  /**
   * Membuat jurnal perubahan stok dan update stok produk.
   */
  public createJournal = async (data: {
    inventory_id: number;
    type: 'in' | 'out';
    quantity: number;
    note?: string;
  }) => {
    const { inventory_id, type, quantity, note } = data;

    if (!inventory_id || !type || !quantity)
      throw new BadRequestError('Semua field wajib diisi');
    if (quantity <= 0) throw new BadRequestError('Quantity harus lebih dari 0');

    return await this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventories.findUnique({
        where: { id: inventory_id },
      });
      if (!inventory) throw new NotFoundError('Inventory tidak ditemukan');

      const newStock =
        type === 'in' ? inventory.stock + quantity : inventory.stock - quantity;

      if (newStock < 0)
        throw new BadRequestError('Stock tidak boleh di bawah 0');

      const journal = await tx.stock_journals.create({
        data: {
          inventory_id,
          type,
          quantity,
          note,
        },
      });

      const updatedInventory = await tx.inventories.update({
        where: { id: inventory_id },
        data: { stock: newStock },
      });

      return {
        message: 'Stock journal created and inventory updated successfully',
        journal,
        updatedInventory,
      };
    });
  };
}
