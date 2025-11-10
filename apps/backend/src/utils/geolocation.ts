// src/utils/geolocation.ts
import opencage from 'opencage-api-client';
import {
  Coordinates,
  LocationInfo,
  StoreWithDistance,
} from '../types/geolocation';
import { prisma } from './prisma';
import { any } from 'zod';

export class GeolocationService {
  static async getAddressFromCoordinates(
    lat: number,
    lng: number
  ): Promise<LocationInfo> {
    try {
      const response = await opencage.geocode({
        key: process.env.OPENCAGE_API_KEY!,
        q: `${lat},${lng}`,
        language: 'id',
        no_annotations: 1,
        limit: 1,
      });

      if (response.results.length === 0) {
        throw new Error('Address not found for the given coordinates');
      }

      const result = response.results[0];
      const components = result.components;

      // Focus on district and subdistrict level for 10km range
      const district =
        components.suburb ||
        components.village ||
        components.town ||
        components.neighbourhood ||
        '';

      const subdistrict =
        components.city_district ||
        components.residential ||
        components.quarter ||
        '';

      return {
        address: result.formatted,
        province: components.state || components.province || '',
        city:
          components.city || components.town || components.municipality || '',
        district: district,
        subdistrict: subdistrict,
        latitude: lat,
        longitude: lng,
      };
    } catch (error) {
      console.error('OpenCage API Error:', error);
      throw new Error(
        `Geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static async getCoordinatesFromAddress(
    district: string,
    subdistrict: string,
    city: string
  ): Promise<Coordinates> {
    try {
      // Focus search on district and subdistrict level
      const query = `${subdistrict}, ${district}, ${city}, Indonesia`;

      const response = await opencage.geocode({
        key: process.env.OPENCAGE_API_KEY!,
        q: query,
        language: 'id',
        no_annotations: 1,
        limit: 1,
      });

      if (response.results.length === 0) {
        throw new Error('Coordinates not found for the given address');
      }

      const geometry = response.results[0].geometry;

      return {
        latitude: geometry.lat,
        longitude: geometry.lng,
      };
    } catch (error) {
      console.error('OpenCage API Error:', error);
      throw new Error(
        `Reverse geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Round to 2 decimal places
    return Math.round(distance * 100) / 100;
  }

  static findNearestStore(
    userLocation: Coordinates,
    stores: any[],
    maxDistance: number = 10
  ): StoreWithDistance | null {
    let nearestStore: StoreWithDistance | null = null;
    let minDistance = Infinity;

    for (const store of stores) {
      const distance = this.calculateDistance(userLocation, {
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
      });

      // Only consider stores within maxDistance (10km)
      if (distance <= maxDistance && distance < minDistance) {
        minDistance = distance;
        nearestStore = {
          ...store,
          distance,
        };
      }
    }

    return nearestStore;
  }

  static isWithinServiceRange(
    store: StoreWithDistance,
    maxDistance: number = 10
  ): boolean {
    return store.distance <= maxDistance;
  }

  static async validateServiceArea(userCoordinates: Coordinates): Promise<{
    isWithinRange: boolean;
    nearestStore: StoreWithDistance | null;
    distance: number | null;
  }> {
    const stores = await prisma.stores.findMany();
    const nearestStore = this.findNearestStore(userCoordinates, stores, 10);

    return {
      isWithinRange: nearestStore !== null,
      nearestStore,
      distance: nearestStore?.distance || null,
    };
  }

  static async areStoresInSameArea(
    store1: StoreWithDistance,
    store2: StoreWithDistance,
    maxDistance: number = 5
  ): Promise<boolean> {
    const distance = this.calculateDistance(
      { latitude: store1.latitude, longitude: store1.longitude },
      { latitude: store2.latitude, longitude: store2.longitude }
    );

    return distance <= maxDistance;
  }

  // Method untuk mendapatkan stores dalam radius tertentu
  static async getStoresWithinRadius(
    userCoordinates: Coordinates,
    radiusKm: number = 10
  ): Promise<StoreWithDistance[]> {
    const stores = await prisma.stores.findMany();
    const storesWithinRadius: StoreWithDistance[] = [];

    for (const store of stores) {
      const distance = this.calculateDistance(userCoordinates, {
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
      });

      if (distance <= radiusKm) {
        storesWithinRadius.push({
          id: store.id,
          name: store.name,
          address: store.address,
          province: store.province,
          city: store.city,
          district: store.district,
          subdistrict: store.subdistrict,
          latitude: Number(store.latitude),
          longitude: Number(store.longitude),
          distance: Number(distance.toFixed(2)),
        });
      }
    }

    // Sort by distance (nearest first)
    return storesWithinRadius.sort((a, b) => a.distance - b.distance);
  }
}
