// src/services/order-calculation.service.ts
import { prisma } from '../utils/prisma';
import { DiscountService } from '../utils/discount';
import { ShippingService } from '../utils/shipping';

export class OrderCalculationService {
  static calculateItemsTotal(cartItems: any[]) {
    let totalAmount = 0;
    let discountAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const { itemTotal, itemDiscount, finalPrice } = this.calculateItemTotal(item);
      
      totalAmount += itemTotal;
      discountAmount += itemDiscount;

      orderItems.push({
        product_id: item.product.id,
        quantity: item.quantity,
        price: finalPrice,
        discount: itemDiscount
      });
    }

    return { totalAmount, discountAmount, orderItems };
  }

  private static calculateItemTotal(item: any) {
    let productPrice = Number(item.product.price);
    let itemDiscount = 0;

    itemDiscount += this.applyProductDiscounts(item, productPrice);
    itemDiscount += this.applyB1G1Discount(item);
    
    const finalPrice = productPrice - (itemDiscount / item.quantity);
    const itemTotal = finalPrice * item.quantity;

    return { itemTotal, itemDiscount, finalPrice };
  }

  private static applyProductDiscounts(item: any, productPrice: number) {
    if (item.product.discounts.length === 0) return 0;

    const discount = item.product.discounts[0];
    const discountCalc = DiscountService.calculateProductDiscount(
      productPrice,
      Number(discount.value),
      discount.inputType.toLowerCase() as 'percentage' | 'nominal'
    );
    
    return discountCalc.discountAmount * item.quantity;
  }

  private static applyB1G1Discount(item: any) {
    return DiscountService.validateB1G1Discount(
      item.product.id,
      item.quantity,
      item.product.discounts
    );
  }

  static async applyVoucherDiscount(voucherCode: string, totalAmount: number) {
    if (!voucherCode) return { discount: 0, voucher: null };

    const voucher = await prisma.vouchers.findFirst({
      where: { code: voucherCode, expired_at: { gte: new Date() } }
    });

    if (!voucher) return { discount: 0, voucher: null };

    const validation = DiscountService.calculateVoucherDiscount(totalAmount, voucher);
    
    if (!validation.isValid) {
      throw new Error(validation.message || 'Invalid voucher');
    }

    return { discount: validation.discountValue, voucher };
  }

  static async calculateShipping(
    addressId: number,
    shippingMethodId: number,
    cartItems: any[],
    store: any
  ): Promise<number> {
    try {
      const shippingMethod = await prisma.shipping_methods.findUnique({
        where: { id: shippingMethodId }
      });

      if (!shippingMethod) {
        throw new Error('Shipping method not found');
      }

      // Get address for RajaOngkir
      const address = await prisma.addresses.findUnique({
        where: { id: addressId }
      });

      if (!address) {
        throw new Error('Address not found');
      }

      // Try to use RajaOngkir API first
      const apiCost = await this.calculateRajaOngkirShipping(
        cartItems, 
        store, 
        address, 
        shippingMethod
      );
      
      if (apiCost !== null) return apiCost;

      // Fallback to distance-based calculation
      return this.calculateFallbackShipping(store, shippingMethod);
    } catch (error) {
      console.error('Shipping calculation error:', error);
      
      // Final fallback
      const shippingMethod = await prisma.shipping_methods.findUnique({
        where: { id: shippingMethodId }
      });

      if (!shippingMethod) throw new Error('Shipping method not found');

      return this.calculateFallbackShipping(store, shippingMethod);
    }
  }

  private static async calculateRajaOngkirShipping(
    cartItems: any[],
    store: any,
    address: any,
    shippingMethod: any
  ): Promise<number | null> {
    try {
      // Calculate total weight
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalWeight = ShippingService.calculateWeightFromItems(totalQuantity);

      // In a real scenario, you'd need to map store city to RajaOngkir city ID
      // and user address city to RajaOngkir city ID
      const storeCityId = await this.getCityIdFromName(store.city);
      const userCityId = await this.getCityIdFromName(address.city);

      if (!storeCityId || !userCityId) {
        return null;
      }

      const shippingCosts = await ShippingService.calculateShippingCost({
        origin: storeCityId,
        destination: userCityId,
        weight: totalWeight,
        courier: shippingMethod.provider.toLowerCase()
      });

      return shippingCosts.length > 0 ? shippingCosts[0].cost : null;
    } catch (error) {
      console.error('RajaOngkir calculation failed:', error);
      return null;
    }
  }

  private static async getCityIdFromName(cityName: string): Promise<string | null> {
    // This is a simplified mapping - in production you'd want a proper city database
    const cityMap: { [key: string]: string } = {
      'jakarta': '152',
      'surabaya': '444',
      'bandung': '23',
      'yogyakarta': '419',
      // Add more city mappings as needed
    };

    return cityMap[cityName.toLowerCase()] || null;
  }

  private static calculateFallbackShipping(store: any, shippingMethod: any): number {
    const baseCost = Number(shippingMethod.base_cost);
    const costPerKm = Number(shippingMethod.cost_per_km);
    const distance = store.distance || 5; // Default 5km if distance not available
    
    return baseCost + (costPerKm * Math.min(distance, 10)); // Max 10km
  }
}