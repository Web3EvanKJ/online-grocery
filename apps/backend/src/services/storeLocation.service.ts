import { Database } from '../config/prisma';
import { BadRequestError, NotFoundError } from '../utils/httpError';
import type { PrismaClient } from '@prisma/client';

export class StoreLocationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new Database().getInstance();
  }

  /**
   * Find the nearest store based on user's coordinates.
   * Uses Haversine formula to calculate distance in kilometers.
   */
  public findNearestStore = async (latitude: number, longitude: number) => {
    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestError('Latitude dan longitude wajib diisi');
    }

    const stores = await this.prisma.stores.findMany();

    if (!stores.length) {
      throw new NotFoundError('Tidak ada toko yang tersedia');
    }

    const R = 6371; // Earth's radius in km

    const toRad = (value: number) => (value * Math.PI) / 180;

    const storesWithDistance = stores.map((store) => {
      const dLat = toRad(Number(store.latitude) - latitude);
      const dLon = toRad(Number(store.longitude) - longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(latitude)) *
          Math.cos(toRad(Number(store.latitude))) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return {
        ...store,
        distance: parseFloat(distance.toFixed(2)), // in km
      };
    });

    const nearestStore = storesWithDistance.reduce((prev, curr) =>
      prev.distance < curr.distance ? prev : curr
    );

    return {
      store_id: nearestStore.id,
      store_name: nearestStore.name,
      distance_km: nearestStore.distance,
    };
  };
}
