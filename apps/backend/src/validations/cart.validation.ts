// src/validations/cart.validation.ts
import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('Product ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be at least 1').min(1).max(100)
  })
});

export const updateCartSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be at least 1').min(1).max(100)
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Cart ID must be a number')
  })
});

export const cartIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Cart ID must be a number')
  })
});