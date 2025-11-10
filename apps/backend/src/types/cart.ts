export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  // add null
  created_at: Date | null;
  updated_at: Date | null;
  product: ProductWithDetails;
}

export interface ProductWithDetails {
  id: number;
  name: string;
  price: number;
  images: ProductImage[];
  inventories: InventoryWithStore[];
  availableStock: number;
  isAvailable: boolean;
}

export interface ProductImage {
  id: number;
  image_url: string;
}

export interface InventoryWithStore {
  id: number;
  stock: number;
  store: Store;
}

export interface Store {
  id: number;
  name: string;
}