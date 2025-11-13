export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    images: { image_url: string }[];
  };
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}