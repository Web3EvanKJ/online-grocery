import { RajaOngkirService } from '../utils/shipping';
import { LocationService } from './location.service';
import { prisma } from '../utils/prisma';
import { ShippingCostRequest, ShippingCostResponse } from '../types/shipping';

// services/shipping.service.ts
export class ShippingService {
  static async calculateShippingCost(data: ShippingCostRequest): Promise<ShippingCostResponse> {
    const address = await prisma.addresses.findUnique({
      where: { id: data.addressId },
      select: { subdistrict: true, city: true, province: true, latitude: true, longitude: true }
    });

    if (!address) {
      throw new Error('Address not found');
    }

    // Find nearest store berdasarkan koordinat
    const nearestStore = await LocationService.findNearestStore(
      Number(address.latitude), 
      Number(address.longitude)
    );

    // Check jika store dalam range 10km
    if (nearestStore.distance > 10) {
      throw new Error('No store available within 10km range');
    }

    // Get store city/subdistrict untuk RajaOngkir
    const storeLocation = await this.getStoreLocation(nearestStore.store.id);
    const userLocation = await this.getUserLocation(address);

    // Calculate total weight
    const totalWeight = data.items.reduce((total, item) => total + (item.quantity * 100), 1000); // Min 1kg

    // Get shipping method
    const shippingMethod = await prisma.shipping_methods.findUnique({
      where: { id: data.shippingMethodId }
    });

    if (!shippingMethod) {
      throw new Error('Shipping method not found');
    }

    // Calculate cost menggunakan RajaOngkir
    let shippingCost = 0;
    
    try {
      const rajaOngkirResult = await RajaOngkirService.getShippingCost(
        storeLocation.city_id,
        userLocation.city_id,
        totalWeight,
        shippingMethod.provider.toLowerCase()
      );

      if (rajaOngkirResult.costs.length > 0) {
        shippingCost = rajaOngkirResult.costs[0].cost[0].value;
      } else {
        // Fallback calculation based on distance
        shippingCost = this.calculateFallbackCost(nearestStore.distance, totalWeight);
      }
    } catch (error) {
      // Fallback jika RajaOngkir fails
      console.warn('RajaOngkir failed, using fallback calculation:', error);
      shippingCost = this.calculateFallbackCost(nearestStore.distance, totalWeight);
    }

    return {
      cost: shippingCost,
      estimated_days: this.getEstimatedDays(nearestStore.distance),
      service: shippingMethod.name,
      store: {
        id: nearestStore.store.id,
        name: nearestStore.store.name,
        address: nearestStore.store.address,
        city: nearestStore.store.city,
        distance: nearestStore.distance
      }
    };
  }

  private static async getStoreLocation(storeId: number) {
    const store = await prisma.stores.findUnique({
      where: { id: storeId },
      select: { city: true, province: true }
    });

    if (!store) throw new Error('Store not found');

    // Map city name to RajaOngkir city_id
    return await this.mapLocationToRajaOngkir(store.city, store.province);
  }

  private static async getUserLocation(address: any) {
    // Map user address to RajaOngkir city_id
    return await this.mapLocationToRajaOngkir(address.city, address.province);
  }

  private static async mapLocationToRajaOngkir(city: string, province: string) {
    // Simplified mapping - in real implementation, use RajaOngkir city API
    const cityMapping: { [key: string]: { city_id: string; province_id: string } } = {
      'jakarta': { city_id: '151', province_id: '6' },
      'bandung': { city_id: '23', province_id: '9' },
      'surabaya': { city_id: '444', province_id: '11' },
      'yogyakarta': { city_id: '135', province_id: '5' },
      'bogor': { city_id: '55', province_id: '9' },
      'depok': { city_id: '106', province_id: '9' },
      'tangerang': { city_id: '457', province_id: '3' },
      'bekasi': { city_id: '34', province_id: '9' }
    };

    const cityKey = city.toLowerCase();
    return cityMapping[cityKey] || { city_id: '151', province_id: '6' }; // Default Jakarta
  }

  private static calculateFallbackCost(distance: number, weight: number): number {
    // Realistic calculation: base cost + (distance * cost per km)
    const baseCost = 10000;
    const costPerKm = 1500;
    const weightMultiplier = Math.max(weight / 1000, 1); // Min 1kg
    
    return Math.round((baseCost + (distance * costPerKm)) * weightMultiplier);
  }

  private static getEstimatedDays(distance: number): number {
    if (distance <= 5) return 1;
    if (distance <= 15) return 2;
    return 3;
  }
}