// src/services/order-validation.service.ts
import { prisma } from '../utils/prisma';
import { GeolocationService } from '../utils/geolocation';

export class OrderValidationService {
  static async validateAddress(userId: number, addressId: number) {
    const address = await prisma.addresses.findFirst({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error('Address not found');
    }

    // Validate that address has district and subdistrict
    if (!address.district || !address.subdistrict) {
      throw new Error('Address must include district and subdistrict information');
    }

    return address;
  }

  static async validateCart(userId: number) {
    const cartItems = await prisma.carts.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: {
            images: true,
            inventories: { include: { store: true } },
            discounts: {
              where: {
                start_date: { lte: new Date() },
                end_date: { gte: new Date() }
              }
            }
          }
        }
      }
    });

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    return cartItems;
  }

  static async findNearestStore(userLatitude: number, userLongitude: number) {
    const stores = await prisma.stores.findMany();
    const userLocation = {
      latitude: userLatitude,
      longitude: userLongitude
    };

    // Get nearest store within 10km
    const nearestStore = GeolocationService.findNearestStore(userLocation, stores, 10);
    
    if (!nearestStore) {
      throw new Error('No store available within 10km service range. Please try a different address.');
    }

    console.log(`Found store: ${nearestStore.name} at ${nearestStore.distance}km distance`);
    return nearestStore;
  }

  static async validateStock(cartItems: any[], storeId: number) {
    for (const item of cartItems) {
      const storeInventory = item.product.inventories.find(
        (inv: any) => inv.store_id === storeId
      );

      if (!storeInventory) {
        throw new Error(`Product ${item.product.name} not available in nearby store`);
      }

      if (storeInventory.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}. Available: ${storeInventory.stock}, Requested: ${item.quantity}`);
      }
    }
  }

  static async validateServiceArea(userLatitude: number, userLongitude: number) {
    const userLocation = {
      latitude: userLatitude,
      longitude: userLongitude
    };

    const serviceAreaCheck = await GeolocationService.validateServiceArea(userLocation);
    
    if (!serviceAreaCheck.isWithinRange) {
      throw new Error(`No stores available within 10km. Nearest store is ${serviceAreaCheck.distance}km away.`);
    }

    return serviceAreaCheck;
  }
}