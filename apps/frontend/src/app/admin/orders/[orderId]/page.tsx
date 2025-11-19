'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrdersStore } from '@/store/ordersStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { formatPrice } from '@/lib/format';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';

// Type untuk order items
interface ProductImage {
  image_url: string;
}

interface Product {
  id: number;
  name: string;
  images?: ProductImage[];
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  discount: number;
  product?: Product;
}

interface Payment {
  method: 'manual_transfer' | 'payment_gateway';
  is_verified: boolean;
  proof_image?: string;
}

interface User {
  name?: string;
  email?: string;
  phone?: string;
}

interface Address {
  label?: string;
  address_detail?: string;
  subdistrict?: string;
  district?: string;
  city?: string;
  province?: string;
}

interface Store {
  name: string;
  city: string;
}

interface OrderDetails {
  id: number;
  status: string;
  total_amount: number;
  shipping_cost: number;
  discount_amount?: number;
  user?: User;
  address?: Address;
  store?: Store;
  order_items?: OrderItem[];
  payments?: Payment[];
}

export default function AdminOrderDetailPage() {
  useAdminAuth();

  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { 
    orderDetails, 
    loading, 
    error, 
    getAdminOrderDetails,
    updateOrderStatus,
    verifyPayment,
    adminCancelOrder 
  } = useOrdersStore();

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    await getAdminOrderDetails(orderId);
  }, [getAdminOrderDetails, orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  useEffect(() => {
    if (orderDetails) {
      setSelectedStatus(orderDetails.status);
    }
  }, [orderDetails]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === orderDetails?.status) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, selectedStatus);
      alert('Order status updated successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      alert(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleVerifyPayment = async (isVerified: boolean) => {
    if (!orderDetails) return;
    if (window.confirm(`Are you sure you want to ${isVerified ? 'verify' : 'reject'} this payment?`)) {
      try {
        await verifyPayment(orderDetails.id, isVerified);
        alert(`Payment ${isVerified ? 'verified' : 'rejected'} successfully`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to verify payment';
        alert(msg);
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }
    try {
      await adminCancelOrder(orderId, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      alert('Order cancelled successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order';
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const order: OrderDetails = orderDetails;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Management */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="flex gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Menunggu_Pembayaran">Waiting Payment</option>
                  <option value="Menunggu_Konfirmasi_Pembayaran">Pending Verification</option>
                  <option value="Diproses">Processing</option>
                  <option value="Dikirim">Shipped</option>
                  <option value="Pesanan_Dikonfirmasi">Completed</option>
                  <option value="Dibatalkan">Cancelled</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || selectedStatus === order.status}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            {/* Payment Verification */}
            {order.payments && order.payments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium">
                        {order.payments[0].method === 'manual_transfer' ? 'Manual Transfer' : 'Payment Gateway'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Status</p>
                      <p className="font-medium">
                        {order.payments[0].is_verified ? (
                          <span className="text-green-600">✓ Verified</span>
                        ) : (
                          <span className="text-orange-600">⏳ Pending</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {order.payments[0].proof_image && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Payment Proof</p>
                      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={order.payments[0].proof_image}
                          alt="Payment Proof"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {!order.payments[0].is_verified && order.payments[0].method === 'manual_transfer' && (
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleVerifyPayment(true)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Verify Payment
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(false)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject Payment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.image_url ? (
                        <Image
                          src={item.product.images[0].image_url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Discount: -{formatPrice(item.discount)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity - (item.discount || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Order */}
            {order.status !== 'Dibatalkan' && order.status !== 'Pesanan_Dikonfirmasi' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h2>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel This Order
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{order.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{order.user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">{order.user?.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.address?.label}</p>
                <p className="text-gray-600">{order.address?.address_detail}</p>
                <p className="text-gray-600">
                  {order.address?.subdistrict}, {order.address?.district}
                </p>
                <p className="text-gray-600">
                  {order.address?.city}, {order.address?.province}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(order.total_amount - order.shipping_cost + (order.discount_amount || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatPrice(order.shipping_cost)}</span>
                </div>
                {order.discount_amount && order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t font-bold text-base">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Store Info */}
            {order.store && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Store</h2>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.store.name}</p>
                  <p className="text-gray-600">{order.store.city}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for cancelling this order:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                placeholder="Enter cancellation reason..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
