export interface Category {
  id?: string;
  name: string;
}

export interface Products {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  images: ProductImage[];
  category: Category;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
