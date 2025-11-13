import { prisma } from '../utils/prisma';

export class OrderValidationService {
  static async validateCart(userId: number) {
    const cartItems = await prisma.carts.findMany({
      where: { user_id: userId },
      include: { 
        product: { 
          include: { inventories: true } 
        } 
      }
    });

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    return cartItems;
  }

  static async validateAddress(addressId: number, userId: number) {
    const address = await prisma.addresses.findUnique({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  static async validateStock(cartItems: any[], storeId: number) {
    for (const item of cartItems) {
      const inventory = await prisma.inventories.findFirst({
        where: { product_id: item.product_id, store_id: storeId }
      });

      if (!inventory || inventory.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
    }
  }

  static async findNearestStore(lat: number, lng: number) {
    const stores = await prisma.stores.findMany();
    
    if (stores.length === 0) {
      throw new Error('No stores available');
    }

    let nearestStore = stores[0];
    let shortestDistance = this.calculateDistance(
      lat, lng,
      Number(nearestStore.latitude), Number(nearestStore.longitude)
    );

    // Cari store terdekat
    for (const store of stores.slice(1)) {
      const distance = this.calculateDistance(
        lat, lng,
        Number(store.latitude), Number(store.longitude)
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStore = store;
      }
    }

    // Check 10km range - sesuai requirement
    if (shortestDistance > 10) {
      throw new Error(`No store available within 10km range. Nearest store is ${shortestDistance.toFixed(1)}km away`);
    }

    return nearestStore;
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
    const distance = R * c;
    
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}