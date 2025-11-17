'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrdersStore } from '@/store/ordersStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { formatPrice } from '@/lib/format';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminOrdersPage() {
  useAdminAuth();

  const { orders, loading, error, getAdminOrders } = useOrdersStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAdminOrders(1, 100);
  }, []);

  // FIX: Add safety check for orders
  const safeOrders = orders || [];

  // Filter orders
  const filteredOrders = safeOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Order status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'Menunggu_Pembayaran': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Waiting Payment' },
      'Menunggu_Konfirmasi_Pembayaran': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Verification' },
      'Diproses': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      'Dikirim': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Shipped' },
      'Pesanan_Dikonfirmasi': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'Dibatalkan': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage all customer orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Search by Order ID or Customer Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="Menunggu_Pembayaran">Waiting Payment</option>
                <option value="Menunggu_Konfirmasi_Pembayaran">Pending Verification</option>
                <option value="Diproses">Processing</option>
                <option value="Dikirim">Shipped</option>
                <option value="Pesanan_Dikonfirmasi">Completed</option>
                <option value="Dibatalkan">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{safeOrders.length}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {safeOrders.filter(o => o.status === 'Menunggu_Pembayaran').length}
              </p>
              <p className="text-sm text-gray-600">Pending Payment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {safeOrders.filter(o => o.status === 'Menunggu_Konfirmasi_Pembayaran').length}
              </p>
              <p className="text-sm text-gray-600">Need Verification</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {safeOrders.filter(o => o.status === 'Diproses').length}
              </p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">ID: {order.user_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(order.total_amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {order.payments?.[0]?.is_verified ? (
                            <span className="inline-flex items-center text-xs font-medium text-green-600">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-medium text-orange-600">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}