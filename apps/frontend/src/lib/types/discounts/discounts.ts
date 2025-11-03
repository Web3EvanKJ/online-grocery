import { Dispatch, SetStateAction } from 'react';

export type Discount = {
  id: number;
  store_id: number;
  store_name?: string;
  product_id?: number | null;
  product_name?: string | null;
  type: 'product' | 'store' | 'b1g1';
  inputType: 'percentage' | 'nominal';
  value: number;
  min_purchase?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
};

export interface onSubmitDiscountProps {
  type: 'product' | 'store' | 'b1g1';
  inputType: 'percentage' | 'nominal';
  value: number;
  min_purchase?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
  product_id?: number | null;
  role?: string;
  user_id?: number;
}

export interface DiscountFormProps {
  discount?: Discount;
  onSubmit: (values: onSubmitDiscountProps) => void;
  loading?: boolean;
  setOpen: (values: boolean) => void;
  isEdit: boolean;
}

export interface DiscountTableProps {
  onEdit: (discount: Discount) => void;
  setError: (err: string | null) => void;
  store_id: number;
}

export type DiscountFilters = {
  type: string;
  search: string;
  date: string;
  sortBy: string;
  sortOrder: string;
};

export interface DiscountTableFiltersProps {
  filters: DiscountFilters;
  setFilters: Dispatch<SetStateAction<DiscountFilters>>;
  pendingFilters: DiscountFilters;
  setPendingFilters: Dispatch<SetStateAction<DiscountFilters>>;
  onApply: () => void;
  setPage: Dispatch<SetStateAction<number>>;
}

export interface DiscountModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  discount?: Discount;
  onSuccess: () => void;
  setError: (err: string | null) => void;
  role: string;
  user_id: number;
}

export interface Product {
  id: number;
  name: string;
}

export interface ProductSearchFieldProps {
  onChange: (id: number | null) => void;
}
