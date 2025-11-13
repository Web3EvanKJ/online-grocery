'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define proper types for form data
interface Address {
  id: number;
  label: string;
  address_detail: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  is_main: boolean;
}

interface ShippingMethod {
  id: number;
  name: string;
  provider: string;
  base_cost: number;
  cost_per_km: number;
}

interface FormData {
  address_id: number;
  shipping_method_id: number;
  voucher_code?: string;
  notes?: string;
}

interface CheckoutFormProps {
  onSubmit: (orderData: FormData) => void;
  isLoading: boolean;
}

export default function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const [formData, setFormData] = useState<FormData>({
    address_id: 0,
    shipping_method_id: 0,
    voucher_code: '',
    notes: ''
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch addresses and shipping methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        const mockAddresses: Address[] = [
          {
            id: 1,
            label: 'Rumah',
            address_detail: 'Jl. Contoh No. 123',
            province: 'Jawa Barat',
            city: 'Bekasi',
            district: 'Bekasi Timur',
            subdistrict: 'Margahayu',
            is_main: true
          }
        ];

        const mockShippingMethods: ShippingMethod[] = [
          {
            id: 1,
            name: 'Standard Delivery',
            provider: 'JNE',
            base_cost: 10000,
            cost_per_km: 2000
          },
          {
            id: 2,
            name: 'Express Delivery',
            provider: 'JNE',
            base_cost: 15000,
            cost_per_km: 3000
          }
        ];

        setAddresses(mockAddresses);
        setShippingMethods(mockShippingMethods);
        
        // Set default values
        if (mockAddresses.length > 0) {
          const mainAddress = mockAddresses.find(addr => addr.is_main) || mockAddresses[0];
          setFormData(prev => ({ ...prev, address_id: mainAddress.id }));
        }
        if (mockShippingMethods.length > 0) {
          setFormData(prev => ({ ...prev, shipping_method_id: mockShippingMethods[0].id }));
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.address_id === 0 || formData.shipping_method_id === 0) {
      alert('Please select address and shipping method');
      return;
    }
    
    onSubmit(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'address_id' || name === 'shipping_method_id' ? parseInt(value) : value 
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address Selection */}
      <div>
        <label htmlFor="address_id" className="block text-sm font-medium text-gray-700 mb-2">
          Shipping Address *
        </label>
        <select
          id="address_id"
          name="address_id"
          value={formData.address_id}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value={0}>Select Address</option>
          {addresses.map((address) => (
            <option key={address.id} value={address.id}>
              {address.label} - {address.address_detail}, {address.subdistrict}, {address.district}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="text-sm text-green-600 hover:text-green-700 mt-2"
          onClick={() => {/* TODO: Add address modal */}}
        >
          + Add New Address
        </button>
      </div>

      {/* Shipping Method Selection */}
      <div>
        <label htmlFor="shipping_method_id" className="block text-sm font-medium text-gray-700 mb-2">
          Shipping Method *
        </label>
        <select
          id="shipping_method_id"
          name="shipping_method_id"
          value={formData.shipping_method_id}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value={0}>Select Shipping Method</option>
          {shippingMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name} ({method.provider}) - Rp {method.base_cost.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {/* Voucher Code */}
      <div>
        <label htmlFor="voucher_code" className="block text-sm font-medium text-gray-700 mb-2">
          Voucher Code (Optional)
        </label>
        <input
          type="text"
          id="voucher_code"
          name="voucher_code"
          value={formData.voucher_code}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter voucher code"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Order Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Any special instructions for your order..."
        />
      </div>

      {/* Submit Button */}
      <div className="border-t pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating Order...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
}