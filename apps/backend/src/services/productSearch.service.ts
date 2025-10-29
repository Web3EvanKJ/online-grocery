import { Database } from '../config/prisma';
import { NotFoundError } from '../utils/httpError';
import type { PrismaClient } from '@prisma/client';

/**
 * @class ProductSearchService
 * @description
 * Business logic for product search with pagination, filter, sorting,
 * and warehouse-aware stock + discount info.
 */
export class ProductSearchService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  /**
   * @method getProducts
   * @description Fetch products with pagination, filters, sorting, and store context.
   */
  public getProducts = async (params: {
    page?: number;
    limit?: number;
    name?: string;
    category?: string;
    discounted?: string;
    sort?: 'asc' | 'desc';
    store_id?: number;
  }) => {
    const {
      page = 1,
      limit = 10,
      name,
      category,
      discounted,
      sort = 'asc',
      store_id = 1, // ✅ default to store_id 1
    } = params;

    const skip = (page - 1) * limit;

    // === Build filter ===
    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (category) {
      where.category = { name: { equals: category, mode: 'insensitive' } };
    }

    // Filter only discounted products
    if (discounted === 'true') {
      const now = new Date();
      where.discounts = {
        some: {
          start_date: { lte: now },
          end_date: { gte: now },
        },
      };
    }

    // === Fetch products ===
    const [products, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        include: {
          category: true,
          images: { take: 1 },
          discounts: {
            where: {
              start_date: { lte: new Date() },
              end_date: { gte: new Date() },
              store_id: store_id,
            },
          },
          inventories: {
            where: { store_id },
          },
        },
        skip,
        take: limit,
        orderBy: { price: sort },
      }),
      this.prisma.products.count({ where }),
    ]);

    // === Transform result to match Product type ===
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: products.map((p) => {
        const hasDiscount = p.discounts.length > 0;
        const discountData = hasDiscount ? p.discounts[0] : null;

        const isB1G1 =
          discountData?.type === 'b1g1' &&
          discountData?.start_date <= new Date() &&
          discountData?.end_date >= new Date();

        const originalPrice = Number(p.price);
        let finalPrice = originalPrice;
        let discountValue: number | null = null;

        if (discountData && discountData.type !== 'b1g1') {
          if (discountData.inputType === 'percentage') {
            discountValue = Number(discountData.value);
            finalPrice = originalPrice * (1 - discountValue / 100);
          } else {
            discountValue = Number(discountData.value);
            finalPrice = originalPrice - discountValue;
          }
        }

        const inventory = p.inventories[0];
        const stock = inventory ? inventory.stock : 0;

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: Math.max(finalPrice, 0),
          originalPrice: hasDiscount ? originalPrice : undefined,
          image: p.images[0]?.image_url || null,
          category: p.category.name,
          discount: discountValue || undefined,
          isB1G1: isB1G1 || false,
          stock,
        };
      }),
    };
  };

  // productSearch.service.ts
  public getProductBySlug = async (slug: string, store_id = 1) => {
    const product = await this.prisma.products.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        discounts: {
          where: {
            start_date: { lte: new Date() },
            end_date: { gte: new Date() },
            store_id: store_id,
          },
        },
        inventories: {
          where: { store_id },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Produk dengan slug "${slug}" tidak ditemukan`);
    }

    // ====== Compute discount and final price ======
    const discountData = product.discounts[0];
    const isB1G1 =
      discountData?.type === 'b1g1' &&
      discountData?.start_date <= new Date() &&
      discountData?.end_date >= new Date();

    const originalPrice = Number(product.price);
    let finalPrice = originalPrice;
    let discountValue: number | null = null;

    if (discountData && discountData.type !== 'b1g1') {
      if (discountData.inputType === 'percentage') {
        discountValue = Number(discountData.value);
        finalPrice = originalPrice * (1 - discountValue / 100);
      } else {
        discountValue = Number(discountData.value);
        finalPrice = originalPrice - Number(discountData.value);
      }
    }

    const stock = product.inventories[0]?.stock ?? 0;

    // ====== Return matching Product type ======
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Math.max(finalPrice, 0),
      originalPrice: discountData ? originalPrice : undefined,
      description: product.description || '',
      images: product.images.map((img) => img.image_url),
      category: product.category.name,
      discount: discountValue || undefined,
      stock,
      isB1G1,
    };
  };
}
