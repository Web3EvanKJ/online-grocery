import { Prisma, DiscountInputType, DiscountType } from '@prisma/client';

export type DiscountRole = 'super_admin' | 'store_admin';

export interface DiscountCreateInput {
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

export interface DiscountUpdateInput extends Prisma.discountsUpdateInput {
  role: DiscountRole;
  user_id: number;
}

export interface DiscountQueryOptions {
  page: number;
  limit: number;
  type?: DiscountType;
  product_name?: string;
  sortBy?: string;
  sortOrder?: Prisma.SortOrder;
  date?: Date;
  store_id?: number;
}

// export type DiscountUpdateWithProductId = Omit<
//   Prisma.discountsUpdateInput,
//   'product'
// > & {
//   product_id?: number | null; // optional, can be null to disconnect
// };
