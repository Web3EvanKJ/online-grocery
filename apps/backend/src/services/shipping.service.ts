import { RajaOngkirService } from '../utils/shipping';
import { LocationService } from './location.service';
import { prisma } from '../utils/prisma';
import { ShippingCostRequest, ShippingCostResponse } from '../types/shipping';

export class ShippingService {
  static async calculateShippingCost(data: ShippingCostRequest): Promise<ShippingCostResponse> {
    // Get user address
    const address = await prisma.addresses.findUnique({
      where: { id: data.addressId }
    });

    if (!address) {
      throw new Error('Address not found');
    }

    // Find nearest store
    const nearestStore = await LocationService.findNearestStore(
      Number(address.latitude),
      Number(address.longitude)
    );

    // Get store city ID for RajaOngkir
    const storeCityId = await LocationService.getStoreCityId(nearestStore.store.id);
    
    // Get destination city ID (simplified - using mock mapping)
    const destinationCityId = await this.getDestinationCityId(address.city);

    // Calculate total weight (simplified - 100g per item)
    const totalWeight = data.items.reduce((total, item) => total + (item.quantity * 100), 0);
    const weightInGrams = Math.max(totalWeight, 1000); // Min 1kg

    // Get shipping method
    const shippingMethod = await prisma.shipping_methods.findUnique({
      where: { id: data.shippingMethodId }
    });

    if (!shippingMethod) {
      throw new Error('Shipping method not found');
    }

    // Calculate cost using RajaOngkir or fallback
    let shippingCost = 0;
    
    try {
      const rajaOngkirResult = await RajaOngkirService.getShippingCost(
        storeCityId || '151',
        destinationCityId,
        weightInGrams,
        shippingMethod.provider.toLowerCase()
      );

      if (rajaOngkirResult.costs.length > 0) {
        shippingCost = rajaOngkirResult.costs[0].cost[0].value;
      } else {
        // Fallback calculation
        shippingCost = this.calculateFallbackCost(nearestStore.distance, weightInGrams);
      }
    } catch (error) {
      // Fallback if RajaOngkir fails
      console.warn('RajaOngkir failed, using fallback calculation:', error);
      shippingCost = this.calculateFallbackCost(nearestStore.distance, weightInGrams);
    }

    return {
      cost: shippingCost,
      estimated_days: 2,
      service: shippingMethod.name,
      store: {
        id: nearestStore.store.id,
        name: nearestStore.store.name,
        address: nearestStore.store.address,
        city: nearestStore.store.city
      }
    };
  }

  private static async getDestinationCityId(cityName: string): Promise<string> {
    // Simplified city mapping
    const cityMap: { [key: string]: string } = {
      'jakarta': '151',
      'bandung': '23',
      'surabaya': '444',
      'yogyakarta': '135',
      'bogor': '55'
    };

    const cityKey = cityName.toLowerCase();
    return cityMap[cityKey] || '151'; // Default to Jakarta
  }

  private static calculateFallbackCost(distance: number, weight: number): number {
    // Simple fallback calculation: base cost + (distance * cost per km)
    const baseCost = 10000;
    const costPerKm = 2000;
    const weightMultiplier = Math.max(weight / 1000, 1); // Min 1kg
    
    return Math.round((baseCost + (distance * costPerKm)) * weightMultiplier);
  }
}