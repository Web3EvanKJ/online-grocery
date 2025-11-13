import { prisma } from '../utils/prisma';

export class LocationService {
  static async findNearestStore(userLat: number, userLng: number) {
    const stores = await prisma.stores.findMany();
    
    if (stores.length === 0) {
      throw new Error('No stores available');
    }

    // Simple distance calculation (Haversine formula)
    let nearestStore = stores[0];
    let shortestDistance = this.calculateDistance(
      userLat, userLng,
      Number(nearestStore.latitude), Number(nearestStore.longitude)
    );

    for (const store of stores.slice(1)) {
      const distance = this.calculateDistance(
        userLat, userLng,
        Number(store.latitude), Number(store.longitude)
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStore = store;
      }
    }

    // Check if store is within service range (50km)
    if (shortestDistance > 50) {
      throw new Error('No store available within service range (50km)');
    }

    return {
      store: nearestStore,
      distance: shortestDistance
    };
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  static async getStoreCityId(storeId: number): Promise<string | null> {
    const store = await prisma.stores.findUnique({
      where: { id: storeId },
      select: { city: true }
    });

    if (!store) return null;

    // In real implementation, map city name to RajaOngkir city ID
    // For now, return mock city ID based on city name
    const cityMap: { [key: string]: string } = {
      'jakarta': '151',
      'bandung': '23',
      'surabaya': '444',
      'yogyakarta': '135'
    };

    const cityKey = store.city.toLowerCase();
    return cityMap[cityKey] || '151'; // Default to Jakarta
  }
}