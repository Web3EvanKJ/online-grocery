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
    const store = await prisma.stores.findFirst();
    if (!store) throw new Error('No store available');
    return store;
  }
}