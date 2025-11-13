// app/admin/orders/page.tsx
'use client';
import { useState } from 'react';
import { useOrders } from '../../../hooks/useOrders';
import { OrderCard } from '../../../components/orders/OrderCard';

export default function AdminOrdersPage() {
  const { orders, loading, error, pagination, fetchOrders } = useOrders(true);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

  if (loading) return <div className="container mx-auto p-4">Loading orders...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} isAdmin={true} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}