import {
  Prisma,
  PrismaClient,
  DiscountInputType,
  DiscountType,
} from '@prisma/client';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../utils/httpError';

const prisma = new PrismaClient();

type DiscountRole = 'super_admin' | 'store_admin';

interface DiscountCreateInput {
  role: DiscountRole;
  user_id: number;
  store_id?: number;
  data: {
    store_id?: number | null;
    product_id?: number | null;
    type: DiscountType;
    inputType: DiscountInputType;
    value: number;
    min_purchase?: number | null;
    max_discount?: number | null;
    start_date: string;
    end_date: string;
  };
}

interface DiscountQueryOptions {
  page: number;
  limit: number;
  type?: DiscountType;
  product_name?: string;
  sortBy?: string;
  sortOrder?: Prisma.SortOrder;
  date?: Date;
  store_id?: number;
}

type DiscountUpdateWithProductId = Omit<
  Prisma.discountsUpdateInput,
  'product'
> & {
  product_id?: number | null; // optional, can be null to disconnect
};

export class DiscountAdminService {
  public async create({ role, user_id, store_id, data }: DiscountCreateInput) {
    return await prisma.$transaction(async (tx) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);

      if (data.product_id) {
        const product = await tx.products.findUnique({
          where: { id: data.product_id },
        });
        if (!product) {
          throw new BadRequestError(`Invalid product name.`);
        }
      }

      if (role === 'store_admin') {
        if (!store_id) {
          throw new BadRequestError(
            'Store ID is required for store_admin role.'
          );
        }

        const isAssigned = await tx.store_admins.findFirst({
          where: {
            user_id,
            store_id,
          },
        });

        if (!isAssigned) {
          throw new UnauthorizedError(
            `You are not authorized to create discounts for this store.`
          );
        }

        const overlapping = await tx.discounts.findFirst({
          where: {
            store_id: store_id!,
            OR: [{ start_date: { lte: end }, end_date: { gte: start } }],
          },
        });
        if (overlapping) {
          throw new ConflictError(
            `There is already an active discount overlapping this date range.`
          );
        }
      }

      const targetStores =
        role === 'super_admin'
          ? await tx.stores.findMany({ select: { id: true } })
          : [{ id: store_id! }];

      const created = await Promise.all(
        targetStores.map((s) =>
          tx.discounts.create({
            data: {
              store_id: s.id,
              product_id: data.product_id ?? null,
              type: data.type,
              inputType: data.inputType,
              value: data.value,
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

    const discounts = await prisma.discounts.findMany({
      where,
      include: {
        product: { select: { name: true } },
        store: { select: { name: true } },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    // 🧹 Deduplicate only if store_id is NOT specified
    const uniqueDiscounts = store_id
      ? discounts
      : discounts.filter(
          (d, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.product_id === d.product_id &&
                t.type === d.type &&
                t.inputType === d.inputType &&
                t.value.equals(d.value) &&
                (t.min_purchase?.equals(
                  d.min_purchase ?? new Prisma.Decimal(0)
                ) ??
                  d.min_purchase === null) &&
                (t.max_discount?.equals(
                  d.max_discount ?? new Prisma.Decimal(0)
                ) ??
                  d.max_discount === null) &&
                t.start_date.getTime() === d.start_date.getTime() &&
                t.end_date.getTime() === d.end_date.getTime()
            )
        );

    const total = uniqueDiscounts.length;
    const paginated = uniqueDiscounts.slice(skip, skip + limit);

    const formattedDiscounts = paginated.map((d) => ({
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
      date,
      store_id,
    } = options;
    const skip = (page - 1) * limit;
    const now = new Date();

    // Base where filter
    let where: Prisma.discountsWhereInput = {
      ...(type && { type }),
      ...(store_id && { store_id }),
      ...(product_name && {
        product: { name: { contains: product_name, mode: 'insensitive' } },
      }),
    };

    // Add date logic
    if (date) {
      // If date filter is provided → show discounts active on that date
      where = {
        ...where,
        start_date: { lte: date },
        end_date: { gte: date },
      };
    } else {
      // Otherwise → only show expired or future discounts
      where = {
        ...where,
        OR: [{ end_date: { lt: now } }, { start_date: { gt: now } }],
      };
    }

    const discounts = await prisma.discounts.findMany({
      where,
      include: { product: true, store: true },
      orderBy: { [sortBy]: sortOrder },
    });

    // Deduplicate if no specific store filter
    const uniqueDiscounts = store_id
      ? discounts
      : discounts.filter(
          (d, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.product_id === d.product_id &&
                t.type === d.type &&
                t.inputType === d.inputType &&
                t.value.equals(d.value) &&
                (t.min_purchase?.equals(
                  d.min_purchase ?? new Prisma.Decimal(0)
                ) ??
                  d.min_purchase === null) &&
                (t.max_discount?.equals(
                  d.max_discount ?? new Prisma.Decimal(0)
                ) ??
                  d.max_discount === null) &&
                t.start_date.getTime() === d.start_date.getTime() &&
                t.end_date.getTime() === d.end_date.getTime()
            )
        );

    const total = uniqueDiscounts.length;
    const paginated = uniqueDiscounts.slice(skip, skip + limit);

    const formattedDiscounts = paginated.map((d) => ({
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

  public async update(id: number, data: DiscountUpdateWithProductId) {
    const existing = await prisma.discounts.findUnique({ where: { id } });

    if (!existing) throw new BadRequestError('Discount not found');

    const start = new Date(data.start_date as Date);
    const end = new Date(data.end_date as Date);

    const overlap = await prisma.discounts.findFirst({
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

    // Prepare data for update
    console.log(data);

    const updateData: any = {
      type: data.type,
      inputType: data.inputType,
      value: data.value,
      min_purchase: data.min_purchase,
      max_discount: data.max_discount,
      start_date: start,
      end_date: end,
    };

    // If product_id is provided, use nested connect
    if (data.product_id !== undefined) {
      updateData.product = { connect: { id: data.product_id } };
      delete updateData.product_id; // remove product_id from root
    }

    return await prisma.discounts.update({
      where: { id },
      data: updateData,
    });
  }

  public async getProducts(search?: string) {
    const where: Prisma.productsWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const products = await prisma.products.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return products;
  }
}
