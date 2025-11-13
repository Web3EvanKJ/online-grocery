export class OrderCalculationService {
  static calculateItemsTotal(cartItems: any[]) {
    let totalAmount = 0;
    const orderItems = cartItems.map(item => {
      const price = Number(item.product.price);
      const quantity = item.quantity;
      const itemTotal = price * quantity;
      
      totalAmount += itemTotal;

      return {
        product_id: item.product_id,
        quantity: quantity,
        price: price
      };
    });

    return { totalAmount, orderItems };
  }
}