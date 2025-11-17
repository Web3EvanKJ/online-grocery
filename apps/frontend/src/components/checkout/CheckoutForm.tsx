'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Props {
  onAddressChange: (id: number) => void;
  onShippingChange: (id: number) => void;
  onPaymentMethodChange: (method: 'manual_transfer' | 'payment_gateway') => void;
  selectedAddressId?: number;
  selectedShippingMethodId?: number;
  paymentMethod: 'manual_transfer' | 'payment_gateway';
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

interface Address {
  id: number;
  label: string;
  address_detail: string;
}

interface ShippingMethod {
  id: number;
  name: string;
  provider: string;
}

export default function CheckoutForm({
  onAddressChange,
  onShippingChange,
  onPaymentMethodChange,
  selectedAddressId,
  selectedShippingMethodId,
  paymentMethod,
  voucherCode,
  onVoucherCodeChange,
  notes,
  onNotesChange
}: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [addr, ship] = await Promise.all([
        apiClient.getAddresses(),
        apiClient.getShippingMethods()
      ]);

      setAddresses(addr || []);
      setShippingMethods(ship || []);

      if (addr.length && !selectedAddressId) onAddressChange(addr[0].id);
      if (ship.length && !selectedShippingMethodId) onShippingChange(ship[0].id);
    };

    fetchData();
  }, [onAddressChange, onShippingChange, selectedAddressId, selectedShippingMethodId]);

  return (
    <div className="space-y-4">
      {/* Address */}
      <select
        value={selectedAddressId || ''}
        onChange={e => onAddressChange(Number(e.target.value))}
        className="w-full px-4 py-2 border border-blue-300 rounded-lg"
      >
        {addresses.map(a => (
          <option key={a.id} value={a.id}>
            {a.label} - {a.address_detail}
          </option>
        ))}
      </select>

      {/* Shipping */}
      <select
        value={selectedShippingMethodId || ''}
        onChange={e => onShippingChange(Number(e.target.value))}
        className="w-full px-4 py-2 border border-blue-300 rounded-lg"
      >
        {shippingMethods.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.provider})
          </option>
        ))}
      </select>

      {/* Payment Method */}
      <div className="flex gap-4">
        <label
          className={`flex-1 p-3 border rounded-lg cursor-pointer ${
            paymentMethod === 'payment_gateway' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="payment_gateway"
            checked={paymentMethod === 'payment_gateway'}
            onChange={() => onPaymentMethodChange('payment_gateway')}
            className="mr-2"
          />
          Midtrans
        </label>
        <label
          className={`flex-1 p-3 border rounded-lg cursor-pointer ${
            paymentMethod === 'manual_transfer' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="manual_transfer"
            checked={paymentMethod === 'manual_transfer'}
            onChange={() => onPaymentMethodChange('manual_transfer')}
            className="mr-2"
          />
          Manual Transfer
        </label>
      </div>

      {/* Voucher */}
      <div className="flex gap-2">
        <input
          type="text"
          value={voucherCode}
          onChange={e => onVoucherCodeChange(e.target.value)}
          placeholder="Voucher code"
          className="flex-1 px-4 py-2 border border-blue-300 rounded-lg"
        />
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={e => onNotesChange(e.target.value)}
        rows={2}
        placeholder="Order notes"
        className="w-full px-4 py-2 border border-blue-300 rounded-lg"
      />
    </div>
  );
}
