export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  discount?: number;
  discountInputType?: string;
  stock?: number;
  isb1g1?: boolean;
};
