'use client';

import { useState } from "react";
import { useOrdersStore } from "@/store/ordersStore";

export default function OrderDetailPage({ orderId }: { orderId: number }) {
  const { orderDetails, cancelOrder, getOrderById } = useOrdersStore();
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason");
      return;
    }
    try {
      await cancelOrder(orderId, cancelReason);
      setShowCancelInput(false);
      setCancelReason("");
      await getOrderById(orderId); // refresh details
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Order info */}
      <h1>Order #{orderId}</h1>
      {/* ...tampilkan orderDetails... */}

      {/* Cancel button */}
      {!showCancelInput ? (
        <button
          onClick={() => setShowCancelInput(true)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cancel Order
        </button>
      ) : (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Enter reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="border p-2 rounded mr-2"
          />
          <button
            onClick={handleCancel}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Confirm Cancel
          </button>
          <button
            onClick={() => { setShowCancelInput(false); setCancelReason(""); }}
            className="bg-gray-300 px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
