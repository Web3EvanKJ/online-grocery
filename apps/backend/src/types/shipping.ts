export interface ShippingCostRequest {
  origin: string;
  destination: string;
  weight: number;
  courier: string;
}

export interface ShippingCostResponse {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface RajaOngkirResponse {
  rajaongkir: {
    results: {
      costs: {
        service: string;
        description: string;
        cost: {
          value: number;
          etd: string;
        }[];
      }[];
    }[];
  };
}