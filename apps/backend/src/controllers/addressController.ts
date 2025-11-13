import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const getUserAddresses = async (req: AuthRequest, res: Response)  =>{
  try {
    const userId = req.user.userId;

    const addresses = await prisma.addresses.findMany({
      where: { user_id: userId },
      orderBy: { is_main: 'desc' }
    });

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const getAddressById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const addressId = parseInt(req.params.id);

    const address = await prisma.addresses.findFirst({
      where: { 
        id: addressId,
        user_id: userId 
      },
    });

    if (!address) {
      return res.status(404).json({ 
        success: false,
        error: 'Address not found' 
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { 
      label, 
      address_detail, 
      province, 
      city, 
      district, 
      latitude, 
      longitude, 
      is_main 
    } = req.body;

    // Validate required fields
    if (!label || !address_detail || !province || !city || !district) {
      return res.status(400).json({
        success: false,
        error: 'Label, address detail, province, city, and district are required'
      });
    }

    // If setting as main address, unset other main addresses
    if (is_main) {
      await prisma.addresses.updateMany({
        where: { user_id: userId },
        data: { is_main: false }
      });
    }

    const address = await prisma.addresses.create({
      data: {
        user_id: userId,
        label,
        address_detail,
        province,
        city,
        district,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        is_main: is_main || false,
      },
    });

    res.status(201).json({
      success: true,
      data: address,
      message: 'Address created successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const addressId = parseInt(req.params.id);
    const { 
      label, 
      address_detail, 
      province, 
      city, 
      district, 
      latitude, 
      longitude, 
      is_main 
    } = req.body;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.addresses.findFirst({
      where: { 
        id: addressId,
        user_id: userId 
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ 
        success: false,
        error: 'Address not found' 
      });
    }

    // If setting as main address, unset other main addresses
    if (is_main) {
      await prisma.addresses.updateMany({
        where: { user_id: userId },
        data: { is_main: false }
      });
    }

    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        label: label || existingAddress.label,
        address_detail: address_detail || existingAddress.address_detail,
        province: province || existingAddress.province,
        city: city || existingAddress.city,
        district: district || existingAddress.district,
        latitude: latitude ? parseFloat(latitude) : existingAddress.latitude,
        longitude: longitude ? parseFloat(longitude) : existingAddress.longitude,
        is_main: is_main !== undefined ? is_main : existingAddress.is_main,
      },
    });

    res.json({
      success: true,
      data: updatedAddress,
      message: 'Address updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const addressId = parseInt(req.params.id);

    // Check if address exists and belongs to user
    const existingAddress = await prisma.addresses.findFirst({
      where: { 
        id: addressId,
        user_id: userId 
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ 
        success: false,
        error: 'Address not found' 
      });
    }

    await prisma.addresses.delete({
      where: { id: addressId },
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const setMainAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const addressId = parseInt(req.params.id);

    // Check if address exists and belongs to user
    const existingAddress = await prisma.addresses.findFirst({
      where: { 
        id: addressId,
        user_id: userId 
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ 
        success: false,
        error: 'Address not found' 
      });
    }

    // Unset all main addresses
    await prisma.addresses.updateMany({
      where: { user_id: userId },
      data: { is_main: false }
    });

    // Set this address as main
    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: { is_main: true },
    });

    res.json({
      success: true,
      data: updatedAddress,
      message: 'Address set as main successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};