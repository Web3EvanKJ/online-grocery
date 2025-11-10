import { Database } from '../config/prisma';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/httpError';
import { uploadToCloudinary } from '../utils/cloudinary';
import { Prisma, PrismaClient } from '@prisma/client';
import slugify from 'slugify';

export class ProductAdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  public uploadImages = async (files: Express.Multer.File[]) => {
    if (!files?.length) throw new BadRequestError('No files provided');
    const urls: string[] = [];
    for (const file of files) {
      const { url } = await uploadToCloudinary(file);
      urls.push(url);
    }
    return { message: 'Images uploaded successfully', data: urls };
  };

  // Create Product
  public create = async (data: {
    name: string;
    category_id: number;
    description?: string;
    price: number;
    imageUrls: string[];
  }) => {
    const { name, price, category_id, imageUrls } = data;
    if (!name || !price || !category_id || imageUrls.length === 0)
      throw new BadRequestError('Missing required fields');

    const exist = await this.prisma.products.findFirst({ where: { name } });
    if (exist) throw new ConflictError('Product with this name already exists');

    const numCategory = Number(category_id);
    const slug = slugify(name, { lower: true, strict: true });
    const product = await this.prisma.products.create({
      data: {
        name,
        slug,
        category_id: numCategory,
        description: data.description ?? '',
        price,
        images: {
          createMany: {
            data: (imageUrls || []).map((url) => ({ image_url: url })),
          },
        },
      },
      include: { images: true, category: true },
    });

    return { message: 'Product created successfully', data: product };
  };

  /** READ PRODUCTS */
  public getAll = async (query: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'asc' | 'desc' | 'price_asc' | 'price_desc';
  }) => {
    const { page = 1, limit = 10, search, sort } = query;
    const limits = Number(limit);
    const skip = (Number(page) - 1) * limits;
    const where: Prisma.productsWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy =
      sort === 'price_asc'
        ? { price: 'asc' as Prisma.SortOrder }
        : sort === 'price_desc'
          ? { price: 'desc' as Prisma.SortOrder }
          : { name: (sort === 'desc' ? 'desc' : 'asc') as Prisma.SortOrder };

    const [data, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        skip,
        take: limits,
        orderBy,
        include: { images: true, category: true },
      }),
      this.prisma.products.count({ where }),
    ]);

    return {
      message: 'Products fetched successfully',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limits),
      },
    };
  };

  /** UPDATE */
  public update = async (
    id: number,
    data: Partial<{
      name: string;
      category_id: number;
      description: string;
      price: number;
      imageUrls: string[];
    }>
  ) => {
    const existing = await this.prisma.products.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Product not found');

    if (data.name) {
      const duplicate = await this.prisma.products.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (duplicate)
        throw new ConflictError('Another product with same name exists');
    }

    await this.prisma.$transaction(async (tx) => {
      if (data.imageUrls && data.imageUrls.length > 0) {
        await tx.product_images.deleteMany({ where: { product_id: id } });
        await tx.product_images.createMany({
          data: data.imageUrls.map((url) => ({
            product_id: id,
            image_url: url,
          })),
        });
      }

      const updated = await tx.products.update({
        where: { id },
        data: {
          name: data.name,
          slug: slugify(data.name ?? existing.slug, {
            lower: true,
            strict: true,
          }),
          description: data.description,
          price: data.price,
          category: data.category_id
            ? { connect: { id: data.category_id } }
            : undefined,
        },
        include: { images: true, category: true },
      });

      return { data: updated };
    });
  };

  /** DELETE */
  public delete = async (id: number) => {
    const exist = await this.prisma.products.findUnique({ where: { id } });
    if (!exist) throw new NotFoundError('Product not found');

    try {
      await this.prisma.$transaction([
        this.prisma.product_images.deleteMany({ where: { product_id: id } }),
        this.prisma.discounts.deleteMany({ where: { product_id: id } }),
        this.prisma.products.delete({ where: { id } }),
      ]);

      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          if (error.message.includes('inventories_product_id_fkey')) {
            throw new BadRequestError(
              'Cannot delete because inventory has initialized.'
            );
          } else {
            throw new BadRequestError(
              'Cannot delete this product because it is referenced by other data.'
            );
          }
        }
      }
      throw error;
    }
  };
}
