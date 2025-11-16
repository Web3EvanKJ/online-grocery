'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/lib/api';

interface Address {
  id: number;
  label: string;
  address_detail: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  latitude?: string;
  longitude?: string;
  is_main?: boolean;
}

interface ShippingMethod {
  id: number;
  name: string;
  provider: string;
  base_cost: string | number;
  cost_per_km: string | number;
}

interface FormData {
  address_id: number;
  shipping_method_id: number;
  voucher_code?: string;
  notes?: string;
}

interface CheckoutFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number) => void;
  selectedShippingMethodId: number | null;
  setSelectedShippingMethodId: (id: number) => void;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
}

export default function CheckoutForm({
  onSubmit, isLoading,
  selectedAddressId, setSelectedAddressId,
  selectedShippingMethodId, setSelectedShippingMethodId,
  paymentMethod, setPaymentMethod
}: CheckoutFormProps) {

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormData>({
    address_id: selectedAddressId || 0,
    shipping_method_id: selectedShippingMethodId || 0,
    voucher_code: '',
    notes: ''
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const addrRes = await apiClient.getAddresses();
        const addressData = addrRes.data || [];
        setAddresses(addressData as Address[]);

        const shipRes = await apiClient.getShippingMethods();
        const shippingData = shipRes.data || [];
        setShippingMethods(shippingData as ShippingMethod[]);

        const defaultAddress = addressData.find(a => a.is_main) || addressData[0];
        if (defaultAddress && !selectedAddressId) {
          setSelectedAddressId(defaultAddress.id);
          setFormState(prev => ({ ...prev, address_id: defaultAddress.id }));
        }

        if (shippingData.length > 0 && !selectedShippingMethodId) {
          setSelectedShippingMethodId(shippingData[0].id);
          setFormState(prev => ({ ...prev, shipping_method_id: shippingData[0].id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (selectedAddressId) setFormState(prev => ({ ...prev, address_id: selectedAddressId }));
    if (selectedShippingMethodId) setFormState(prev => ({ ...prev, shipping_method_id: selectedShippingMethodId }));
  }, [selectedAddressId, selectedShippingMethodId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsed = (name === 'address_id' || name === 'shipping_method_id') ? parseInt(value) : value;
    setFormState(prev => ({ ...prev, [name]: parsed }));
    if (name === 'address_id') setSelectedAddressId(Number(value));
    if (name === 'shipping_method_id') setSelectedShippingMethodId(Number(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.address_id || !formState.shipping_method_id) return alert('Please select address and shipping method');
    onSubmit(formState);
  };

  if (loading) return <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address *</label>
        <select name="address_id" value={formState.address_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
          <option value={0}>Select address</option>
          {addresses.map(addr => (
            <option key={addr.id} value={addr.id}>
              {addr.label} - {addr.address_detail}, {addr.subdistrict}, {addr.district}
            </option>
          ))}
        </select>
      </div>

      {/* Shipping Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method *</label>
        <select name="shipping_method_id" value={formState.shipping_method_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
          <option value={0}>Select shipping method</option>
          {shippingMethods.map(m => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.provider}) - Rp {Number(m.base_cost).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <select name="payment_method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded">
          <option value="midtrans">Midtrans</option>
          <option value="manual">Manual Transfer</option>
        </select>
      </div>

      {/* Voucher */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Voucher Code (optional)</label>
        <input name="voucher_code" value={formState.voucher_code} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" placeholder="Enter voucher code" />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea name="notes" value={formState.notes} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded" placeholder="Any instructions..." />
      </div>

      <div className="border-t pt-6">
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50">
          {isLoading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
}