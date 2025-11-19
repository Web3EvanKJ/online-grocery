// src/controllers/shipping.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { ShippingService } from '../services/shipping.service';

export class ShippingController {

  static async getShippingMethods(req: Request, res: Response) {
    try {
      const methods = await prisma.shipping_methods.findMany({
        orderBy: { id: 'asc' }
      });

      return res.json({
        success: true,
        data: methods
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get shipping methods'
      });
    }
  }

  static async calculateCost(req: Request, res: Response) {
    try {
      const { addressId, shippingMethodId, items } = req.body;

      if (!addressId || !shippingMethodId || !items) {
        return res.status(400).json({
          success: false,
          message: 'addressId, shippingMethodId and items are required'
        });
      }

      const result = await ShippingService.calculateShippingCost({
        addressId,
        shippingMethodId,
        items
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to calculate shipping cost'
      });
    }
  }
}
