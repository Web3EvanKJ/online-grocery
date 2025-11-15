'use client';

import { useEffect, useState } from 'react';
import { CartItem } from '@/lib/types/cart/cart';
import { apiClient } from '@/lib/api';

interface Props {
  cartItems: CartItem[];
  cartTotal: number;
  selectedAddressId: number | null;
  selectedShippingMethodId: number | null;
  itemsForShipping: { product_id: number; quantity: number; weight?: number }[];
}

export default function OrderSummary({
  cartItems,
  cartTotal,
  selectedAddressId,
  selectedShippingMethodId,
  itemsForShipping
}: Props) {
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null);

  const tax = Math.round(cartTotal * 0.1);

  useEffect(() => {
    const calc = async () => {
      if (!selectedAddressId || !selectedShippingMethodId) {
        setShippingCost(null);
        setEstimatedDays(null);
        return;
      }

      setShippingLoading(true);
      try {
        const res = (await apiClient.calculateShippingCost({
          addressId: selectedAddressId,
          shippingMethodId: selectedShippingMethodId,
          items: itemsForShipping
        })) as any;

        const cost = res?.data?.cost ?? 0;
        setShippingCost(cost);
        setEstimatedDays(res?.data?.estimated_days ?? null);
      } catch (err) {
        console.error('Failed calculate shipping', err);
        setShippingCost(null);
        setEstimatedDays(null);
      } finally {
        setShippingLoading(false);
      }
    };

    calc();
  }, [selectedAddressId, selectedShippingMethodId, itemsForShipping]);

  const shipping = shippingCost ?? 0;
  const grandTotal = cartTotal + shipping + tax;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4">
        {cartItems.map(item => (
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

      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>Rp {cartTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Shipping {shippingLoading && '(calculating...)'}</span>
          <span>{shippingLoading ? '...' : `Rp ${shipping.toLocaleString()}`}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Tax (10%)</span>
          <span>Rp {tax.toLocaleString()}</span>
        </div>

        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Total</span>
          <span>Rp {grandTotal.toLocaleString()}</span>
        </div>

        {estimatedDays != null && (
          <div className="text-sm text-gray-600">
            Estimated delivery: {estimatedDays} day(s)
          </div>
        )}
      </div>
    </div>
  );
}
