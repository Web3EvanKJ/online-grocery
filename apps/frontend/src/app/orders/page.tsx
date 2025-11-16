'use client';

import { useEffect, useState } from "react";
import { useOrdersStore } from "@/store/ordersStore";

export default function OrdersPage() {
  const { orders, getOrders, cancelOrder } = useOrdersStore();
  const [cancelInputOrderId, setCancelInputOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const handleCancel = async (orderId: number) => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason");
      return;
    }
    try {
      await cancelOrder(orderId, cancelReason);
      setCancelInputOrderId(null);
      setCancelReason("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600 text-center py-10">You have no orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded p-4 flex flex-col gap-2">
              <p>Order #{order.id} - {order.status}</p>
              <p>Total: {order.total_amount}</p>

              {/* Cancel button */}
              {order.status !== "Dibatalkan" && (
                <>
                  {!cancelInputOrderId || cancelInputOrderId !== order.id ? (
                    <button
                      onClick={() => setCancelInputOrderId(order.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Cancel Order
                    </button>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Enter reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="border p-2 rounded flex-1"
                      />
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setCancelInputOrderId(null); setCancelReason(""); }}
                        className="bg-gray-300 px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
