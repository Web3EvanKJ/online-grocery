export interface ShippingCostRequest {
  addressId: number;
  shippingMethodId: number;
  items: ShippingItem[];
}

export interface ShippingItem {
  product_id: number;
  quantity: number;
  weight: number; // in grams
}

export interface ShippingCostResponse {
  cost: number;
  estimated_days: number;
  service: string;
  store: StoreInfo;
}

export interface StoreInfo {
  id: number;
  name: string;
  address: string;
  city: string;
}

export interface RajaOngkirResponse {
  code: string;
  name: string;
  costs: ShippingCost[];
}

export interface ShippingCost {
  service: string;
  description: string;
  cost: CostDetail[];
}

export interface CostDetail {
  value: number;
  etd: string;
  note: string;
}