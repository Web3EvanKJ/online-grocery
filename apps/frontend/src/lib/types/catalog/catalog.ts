export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  discount?: number;
  stock?: number;
  distance?: number;
  isb1g1?: boolean;
};
