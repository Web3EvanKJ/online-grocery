// src/utils/shipping.ts
import axios from 'axios';
import { ShippingCostRequest, ShippingCostResponse, RajaOngkirResponse } from '../types/shipping';

export class ShippingService {
  static async calculateShippingCost(
    request: ShippingCostRequest
  ): Promise<ShippingCostResponse[]> {
    try {
      const response = await axios.post(
        'https://api.rajaongkir.com/starter/cost',
        {
          origin: request.origin,
          destination: request.destination,
          weight: request.weight,
          courier: request.courier
        },
        {
          headers: {
            'key': process.env.RAJAONGKIR_API_KEY!,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data: RajaOngkirResponse = response.data;
      
      if (!data.rajaongkir.results[0]?.costs) {
        throw new Error('No shipping costs available');
      }

      return data.rajaongkir.results[0].costs.map(cost => ({
        service: cost.service,
        description: cost.description,
        cost: cost.cost[0]?.value || 0,
        etd: cost.cost[0]?.etd || ''
      }));
    } catch (error) {
      console.error('RajaOngkir API Error:', error);
      throw new Error(`Shipping cost calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getProvinces() {
    try {
      const response = await axios.get(
        'https://api.rajaongkir.com/starter/province',
        {
          headers: {
            'key': process.env.RAJAONGKIR_API_KEY!
          }
        }
      );
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
      return [];
    }
  }

  static async getCities(provinceId: string) {
    try {
      const response = await axios.get(
        `https://api.rajaongkir.com/starter/city?province=${provinceId}`,
        {
          headers: {
            'key': process.env.RAJAONGKIR_API_KEY!
          }
        }
      );
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      return [];
    }
  }

  static async getAvailableCouriers(): Promise<string[]> {
    return ['jne', 'tiki', 'pos'];
  }

  static calculateWeightFromItems(quantity: number, weightPerItem: number = 1000): number {
    return quantity * weightPerItem;
  }

  static async validateCity(cityId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://api.rajaongkir.com/starter/city?id=${cityId}`,
        {
          headers: {
            'key': process.env.RAJAONGKIR_API_KEY!
          }
        }
      );
      return !!response.data.rajaongkir.results;
    } catch (error) {
      return false;
    }
  }
}