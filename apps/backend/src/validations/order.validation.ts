// src/validations/order.validation.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.number().int().positive('Address ID must be a positive integer'),
    shippingMethodId: z.number().int().positive('Shipping method ID must be a positive integer'),
    voucherCode: z.string().optional(),
    paymentMethod: z.enum(['manual_transfer', 'payment_gateway'], {
      errorMap: () => ({ message: 'Payment method must be either manual_transfer or payment_gateway' })
    })
  })
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Order ID must be a number')
  })
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Order ID must be a number')
  }),
  body: z.object({
    reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters')
  })
});

export const confirmOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Order ID must be a number')
  })
});

export const uploadPaymentSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive('Order ID must be a positive integer')
  })
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional().default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional().default('10'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
});