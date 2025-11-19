'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { CartItem } from '@/store/cartStore';

interface Props {
  cartItems: CartItem[];
  selectedAddressId?: number;
  selectedShippingMethodId?: number;
  voucherCode?: string;
}

interface ShippingCostResponse {
  cost: number;
}

interface VoucherResponse {
  discountAmount: number;
}

export default function OrderSummary({ cartItems, selectedAddressId, selectedShippingMethodId, voucherCode }: Props) {
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);

  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  useEffect(() => {
    const calcShipping = async () => {
      if (selectedAddressId && selectedShippingMethodId) {
        try {
          const res: ShippingCostResponse = await apiClient.calculateShippingCost({
            addressId: selectedAddressId,
            shippingMethodId: selectedShippingMethodId,
            items: cartItems.map(i => ({ product_id: i.product.id, quantity: i.quantity, weight: 100 }))
          });
          setShippingCost(res.cost || 0);
        } catch (error) {
          setShippingCost(0);
          console.error('Failed to calculate shipping cost', error);
        }
      }
    };
    calcShipping();
  }, [selectedAddressId, selectedShippingMethodId, cartItems]);

  useEffect(() => {
    const calcDiscount = async () => {
      if (voucherCode) {
        try {
          const res: VoucherResponse = await apiClient.applyVoucher(voucherCode, cartItems, subtotal);
          setDiscount(res.discountAmount || 0);
        } catch (error) {
          setDiscount(0);
          console.error('Failed to apply voucher', error);
        }
      } else {
        setDiscount(0);
      }
    };
    calcDiscount();
  }, [voucherCode, cartItems, subtotal]);

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2 sticky top-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Order Summary</h3>
      <div className="space-y-1">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.product.name} x{item.quantity}</span>
            <span>Rp {(item.product.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>Rp {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>Rp {shippingCost.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>- Rp {discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-blue-900">
          <span>Total</span>
          <span>Rp {(subtotal + shippingCost - discount).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
