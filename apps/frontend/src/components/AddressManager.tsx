'use client';

import { useState, useEffect } from 'react';
import { Address } from '../lib/types';

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address_detail: '',
    province: '',
    city: '',
    district: '',
    subdistrict: '', // Added subdistrict field
    latitude: '',
    longitude: '',
    is_main: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/addresses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingAddress
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${editingAddress.id}`
        : '${process.env.NEXT_PUBLIC_API_URL}/api/addresses';

      const method = editingAddress ? 'PUT' : 'POST';

      // Convert latitude and longitude to numbers
      const submissionData = {
        ...formData,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        await fetchAddresses();
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('Failed to save address:', errorData.error);
      }
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Failed to delete address');
    }
  };

  const handleSetMain = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${id}/set-main`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Failed to set main address');
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      address_detail: '',
      province: '',
      city: '',
      district: '',
      subdistrict: '', // Added subdistrict field
      latitude: '',
      longitude: '',
      is_main: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const startEdit = (address: Address) => {
    setFormData({
      label: address.label,
      address_detail: address.address_detail,
      province: address.province,
      city: address.city,
      district: address.district,
      subdistrict: address.subdistrict, // Added subdistrict field
      latitude: address.latitude.toString(),
      longitude: address.longitude.toString(),
      is_main: address.is_main,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (value: string, type: 'lat' | 'lng') => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;

    if (type === 'lat') {
      return num >= -90 && num <= 90;
    } else {
      return num >= -180 && num <= 180;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manage Addresses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add New Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="mb-6 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Label *
              </label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                placeholder="Home, Office, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Province *
              </label>
              <input
                type="text"
                required
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                District *
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Added Subdistrict Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subdistrict *
              </label>
              <input
                type="text"
                required
                value={formData.subdistrict}
                onChange={(e) =>
                  setFormData({ ...formData, subdistrict: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Latitude and Longitude Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Latitude *
                {formData.latitude &&
                  !isValidCoordinate(formData.latitude, 'lat') && (
                    <span className="ml-1 text-xs text-red-500">
                      (Must be between -90 and 90)
                    </span>
                  )}
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., -6.2088"
                min="-90"
                max="90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Longitude *
                {formData.longitude &&
                  !isValidCoordinate(formData.longitude, 'lng') && (
                    <span className="ml-1 text-xs text-red-500">
                      (Must be between -180 and 180)
                    </span>
                  )}
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., 106.8456"
                min="-180"
                max="180"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address Detail *
              </label>
              <textarea
                required
                value={formData.address_detail}
                onChange={(e) =>
                  setFormData({ ...formData, address_detail: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_main}
                onChange={(e) =>
                  setFormData({ ...formData, is_main: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Set as main address
              </label>
            </div>

            <div className="flex space-x-3 md:col-span-2">
              <button
                type="submit"
                disabled={
                  !isValidCoordinate(formData.latitude, 'lat') ||
                  !isValidCoordinate(formData.longitude, 'lng')
                }
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Coordinate Help Text */}
          <div className="mt-4 rounded-md bg-blue-50 p-3">
            <h4 className="mb-1 text-sm font-medium text-blue-800">
              Need help finding coordinates?
            </h4>
            <p className="text-xs text-blue-700">
              You can find latitude and longitude using Google Maps: Right-click
              on a location → "What's here?" → Coordinates will appear at the
              bottom. Format: Latitude (-90 to 90), Longitude (-180 to 180)
            </p>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No addresses found. Add your first address above.
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-lg border p-4 ${
                address.is_main
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {address.label}
                    </span>
                    {address.is_main && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        Main Address
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{address.address_detail}</p>
                  <p className="text-sm text-gray-500">
                    {address.subdistrict}, {address.district}, {address.city},{' '}
                    {address.province}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Coordinates: {address.latitude}, {address.longitude}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!address.is_main && (
                    <button
                      onClick={() => handleSetMain(address.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Set Main
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(address)}
                    className="text-sm font-medium text-green-600 hover:text-green-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
