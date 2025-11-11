// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { constants } from '../config/constants.js';

// Common schemas
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);
const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').optional();

// Auth schemas
export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  phone: phoneSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// Address schemas
export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  address_detail: z.string().min(1, 'Address detail is required').max(500),
  province: z.string().min(1, 'Province is required'),
  city: z.string().min(1, 'City is required'),
  district: z.string().min(1, 'District is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateAddressSchema = addressSchema.extend({
  is_main: z.boolean().optional(),
});

// Product schemas
export const nearestProductsSchema = z.object({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  category_id: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

// Shipping schemas
export const calculateShippingSchema = z.object({
  address_id: z.number().int().positive('Address ID must be positive'),
  store_id: z.number().int().positive('Store ID must be positive'),
  items: z.array(z.object({
    product_id: z.number().int().positive('Product ID must be positive'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).min(1, 'At least one item is required'),
});

// Cart schemas
export const cartItemSchema = z.object({
  product_id: z.number().int().positive('Product ID must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Schema mapping
const schemas = {
  register: registerSchema,
  verifyEmail: verifyEmailSchema,
  login: loginSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  resendVerification: resendVerificationSchema,
  updateProfile: updateProfileSchema,
  changePassword: changePasswordSchema,
  address: addressSchema,
  updateAddress: updateAddressSchema,
  nearestProducts: nearestProductsSchema,
  calculateShipping: calculateShippingSchema,
  cartItem: cartItemSchema,
};

export type ValidationSchema = keyof typeof schemas;

export const validate = (schemaName: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = schemas[schemaName];
      const result = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params,
      });

      // Assign validated data back to request
      if (schemaName in schemas) {
        req.body = result;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      next(error);
    }
  };
};