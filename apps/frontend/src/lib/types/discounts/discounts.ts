export type Discount = {
  id: number;
  store_id: number;
  product_name?: string | null;
  type: 'product' | 'store' | 'B1G1';
  inputType: 'percentage' | 'nominal';
  value: number;
  min_purchase?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
};
