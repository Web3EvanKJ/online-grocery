import { Database } from '../config/prisma';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/httpError';
import type { PrismaClient } from '@prisma/client';

export class CategoryAdminService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new Database().getInstance();
  }

  public create = async (name: string) => {
    if (!name.trim()) throw new BadRequestError('Category name is required');

    const exist = await this.prisma.categories.findFirst({ where: { name } });
    if (exist) throw new ConflictError('Category already exists');

    const cat = await this.prisma.categories.create({ data: { name } });
    return { message: 'Category created successfully', data: cat };
  };

  public getAll = async (query: {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
  }) => {
    const { page, limit, sort = 'asc' } = query;
    const limits = Number(limit);
    const skip = (Number(page) - 1) * limits;
    const [data, total] = await Promise.all([
      this.prisma.categories.findMany({
        skip,
        take: limits,
        orderBy: { name: sort },
      }),
      this.prisma.categories.count(),
    ]);
    return {
      message: 'Categories fetched successfully',
      data,
      pagination: {
        page,
        limits,
        total,
        totalPages: Math.ceil(total / limits),
      },
    };
  };

  public getById = async (id: number) => {
    const cat = await this.prisma.categories.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Category not found');
    return { message: 'Category detail fetched', data: cat };
  };

  public update = async (id: number, name: string) => {
    const cat = await this.prisma.categories.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Category not found');
    const dup = await this.prisma.categories.findFirst({
      where: { name, NOT: { id } },
    });
    if (dup) throw new ConflictError('Category name already exists');
    const updated = await this.prisma.categories.update({
      where: { id },
      data: { name },
    });
    return { message: 'Category updated successfully', data: updated };
  };

  public delete = async (id: number) => {
    const cat = await this.prisma.categories.findUnique({ where: { id } });
    if (!cat) throw new NotFoundError('Category not found');

    const linkedProducts = await this.prisma.products.count({
      where: { category_id: id },
    });
    if (linkedProducts > 0) {
      throw new BadRequestError(
        'Cannot delete category with existing products'
      );
    }

    await this.prisma.categories.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  };
}
