// src/controllers/addressController.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { cacheService } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { AuthRequest } from '../types/index.js';

const ADDRESS_CACHE_KEY = (userId: number) => `addresses:user:${userId}`;

/* Zod schemas */
const paramsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'id must be a positive integer string')
    .transform((s) => parseInt(s, 10)),
});

const coordPreprocess = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() !== '') return Number(val);
  return val;
}, z.number());

const createAddressSchema = z.object({
  label: z.string().min(1),
  address_detail: z.string().min(1),
  province: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  latitude: coordPreprocess,
  longitude: coordPreprocess,
  is_main: z.boolean().optional(),
});

const updateAddressSchema = createAddressSchema.partial();

/* Helpers */
function getUserIdFromReq(req: AuthRequest): number | null {
  const user = req.user;
  if (!user || user.id === undefined || user.id === null) return null;
  const id = Number(user.id);
  return Number.isInteger(id) ? id : null;
}

/* Controllers */

export const getUserAddresses = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = getUserIdFromReq(req);
    if (userId === null) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cacheKey = ADDRESS_CACHE_KEY(userId);

    const addresses = await cacheService.wrap(
      cacheKey,
      async () =>
        prisma.addresses.findMany({
          where: { user_id: userId },
          orderBy: [{ is_main: 'desc' }, { created_at: 'desc' }],
          select: {
            id: true,
            label: true,
            address_detail: true,
            province: true,
            city: true,
            district: true,
            latitude: true,
            longitude: true,
            is_main: true,
            created_at: true,
            updated_at: true,
          },
        }),
      1800
    );

    return res.json({ success: true, message: 'Addresses retrieved successfully', data: addresses });
  } catch (error) {
    logger.error('Get user addresses error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAddressById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = getUserIdFromReq(req);
    if (userId === null) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const parsed = paramsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors.map(e => e.message).join(', ') });
    }
    const addressId = parsed.data.id;

    const address = await prisma.addresses.findFirst({
      where: { id: addressId, user_id: userId },
      select: {
        id: true,
        label: true,
        address_detail: true,
        province: true,
        city: true,
        district: true,
        latitude: true,
        longitude: true,
        is_main: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    return res.json({ success: true, message: 'Address retrieved successfully', data: address });
  } catch (error) {
    logger.error('Get address by ID error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = getUserIdFromReq(req);
    if (userId === null) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const parsed = createAddressSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors.map(e => e.message).join(', ') });
    }
    const payload = parsed.data;

    // Determine final is_main: if user has no addresses, make this main
    const existingCount = await prisma.addresses.count({ where: { user_id: userId } });
    const finalIsMain = payload.is_main ?? existingCount === 0;

    if (finalIsMain) {
      await prisma.addresses.updateMany({
        where: { user_id: userId, is_main: true },
        data: { is_main: false },
      });
    }

    const address = await prisma.addresses.create({
      data: {
        user_id: userId,
        label: payload.label,
        address_detail: payload.address_detail,
        province: payload.province,
        city: payload.city,
        district: payload.district,
        latitude: payload.latitude,
        longitude: payload.longitude,
        is_main: finalIsMain,
      },
      select: {
        id: true,
        label: true,
        address_detail: true,
        province: true,
        city: true,
        district: true,
        latitude: true,
        longitude: true,
        is_main: true,
        created_at: true,
        updated_at: true,
      },
    });

    await cacheService.delete(ADDRESS_CACHE_KEY(userId));

    return res.status(201).json({ success: true, message: 'Address created successfully', data: address });
  } catch (error) {
    logger.error('Create address error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = getUserIdFromReq(req);
    if (userId === null) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const paramsParsed = paramsSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ success: false, message: paramsParsed.error.errors.map(e => e.message).join(', ') });
    }
    const addressId = paramsParsed.data.id;

    const bodyParsed = updateAddressSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ success: false, message: bodyParsed.error.errors.map(e => e.message).join(', ') });
    }
    const payload = bodyParsed.data;

    const existingAddress = await prisma.addresses.findFirst({
      where: { id: addressId, user_id: userId },
    });

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (payload.is_main) {
      await prisma.addresses.updateMany({
        where: { user_id: userId, is_main: true },
        data: { is_main: false },
      });
    }

    const address = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        label: payload.label ?? existingAddress.label,
        address_detail: payload.address_detail ?? existingAddress.address_detail,
        province: payload.province ?? existingAddress.province,
        city: payload.city ?? existingAddress.city,
        district: payload.district ?? existingAddress.district,
        latitude: payload.latitude ?? existingAddress.latitude,
        longitude: payload.longitude ?? existingAddress.longitude,
        is_main: payload.is_main ?? existingAddress.is_main,
      },
      select: {
        id: true,
        label: true,
        address_detail: true,
        province: true,
        city: true,
        district: true,
        latitude: true,
        longitude: true,
        is_main: true,
        created_at: true,
        updated_at: true,
      },
    });

    await cacheService.delete(ADDRESS_CACHE_KEY(userId));

    return res.json({ success: true, message: 'Address updated successfully', data: address });
  } catch (error) {
    logger.error('Update address error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = getUserIdFromReq(req);
    if (userId === null) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const parsed = paramsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors.map(e => e.message).join(', ') });
    }
    const addressId = parsed.data.id;

    const existingAddress = await prisma.addresses.findFirst({
      where: { id: addressId, user_id: userId },
    });

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const orderCount = await prisma.orders.count({ where: { address_id: addressId } });
    if (orderCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete address that is used in existing orders' });
    }

    await prisma.addresses.delete({ where: { id: addressId } });

    if (existingAddress.is_main) {
      const nextAddress = await prisma.addresses.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });
      if (nextAddress) {
        await prisma.addresses.update({ where: { id: nextAddress.id }, data: { is_main: true } });
      }
    }

    await cacheService.delete(ADDRESS_CACHE_KEY(userId));

    return res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    logger.error('Delete address error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const setMainAddress = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = getUserIdFromReq(req);
    if (userId === null) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const parsed = paramsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors.map(e => e.message).join(', ') });
    }
    const addressId = parsed.data.id;

    const existingAddress = await prisma.addresses.findFirst({
      where: { id: addressId, user_id: userId },
    });

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.addresses.updateMany({
        where: { user_id: userId, is_main: true },
        data: { is_main: false },
      });
      await tx.addresses.update({
        where: { id: addressId },
        data: { is_main: true },
      });
    });

    await cacheService.delete(ADDRESS_CACHE_KEY(userId));

    return res.json({ success: true, message: 'Main address set successfully' });
  } catch (error) {
    logger.error('Set main address error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};