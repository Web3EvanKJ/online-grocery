export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    id: number;
    name: string;
    price: number;
    images: Array<{
      id: number;
      image_url: string;
    }>;
    availableStock: number;
    isAvailable: boolean;
  };
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}