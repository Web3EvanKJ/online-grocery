'use client';

import { CartItem } from '@/lib/types/cart/cart';

interface OrderSummaryProps {
  cartItems: CartItem[];
  cartTotal: number;
}

export default function OrderSummary({ cartItems, cartTotal }: OrderSummaryProps) {
  const shippingCost = 15000; // Example fixed shipping cost
  const tax = cartTotal * 0.1; // 10% tax
  const grandTotal = cartTotal + shippingCost + tax;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      {/* Cart Items */}
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-sm">{item.product.name}</p>
              <p className="text-gray-600 text-sm">
                {item.quantity} × Rp {item.product.price.toLocaleString()}
              </p>
            </div>
            <p className="font-semibold text-sm">
              Rp {(item.product.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>Rp {cartTotal.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>Rp {shippingCost.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Tax (10%)</span>
          <span>Rp {tax.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Total</span>
          <span>Rp {grandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}