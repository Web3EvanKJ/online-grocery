import { create } from 'zustand';

export type PaymentMethod = 'manual_transfer' | 'gopay' | 'bank_transfer' | 'credit_card' | 'payment_gateway';
export type PaymentStatus = 'pending' | 'verified' | null;

interface PaymentState {
  orderId: number | null;
  method: PaymentMethod | null;
  transactionId: string | null;
  status: PaymentStatus | null;
  setPayment: (
    orderId: number,
    method: PaymentMethod,
    transactionId?: string,
    status?: PaymentStatus
  ) => void;
  setStatus: (status: PaymentStatus) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  orderId: null,
  method: null,
  transactionId: null,
  status: null,
  setPayment: (orderId, method, transactionId, status) =>
    set({ orderId, method, transactionId: transactionId || null, status: status || 'pending' }),
  setStatus: (status) => set({ status }),
  reset: () => set({ orderId: null, method: null, transactionId: null, status: null }),
}));
