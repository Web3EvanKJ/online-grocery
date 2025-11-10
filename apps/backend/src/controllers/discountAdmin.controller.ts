import { DiscountAdminService } from '../services/discountAdmin.service';
import type { NextFunction, Request, Response } from 'express';
import { DiscountType } from '@prisma/client';
import { DiscountAdminGetService } from '../services/discountAdminGet.service';

export class DiscountAdminController {
  private service: DiscountAdminService;
  private getService: DiscountAdminGetService;

  constructor() {
    this.service = new DiscountAdminService();
    this.getService = new DiscountAdminGetService();
  }

  public createDiscount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, store_id, ...data } = req.body;
      const discount = await this.service.create({
        role,
        store_id,
        data,
      });
      res.status(201).json(discount);
    } catch (error) {
      next(error);
    }
  };

  public getAllDiscounts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        page = '1',
        limit = '10',
        type,
        product_name,
        sortBy,
        sortOrder,
        date,
        store_id,
      } = req.query;

      const result = await this.getService.getAll({
        page: Number(page),
        limit: Number(limit),
        type: type as DiscountType,
        product_name: product_name as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        date: date ? new Date(date as string) : undefined,
        store_id: store_id ? Number(store_id) : undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getDiscountsHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        page = '1',
        limit = '10',
        type,
        product_name,
        sortBy = 'start_date',
        sortOrder = 'desc',
        store_id,
      } = req.query;

      const result = await this.getService.getHistory({
        page: Number(page),
        limit: Number(limit),
        type: type as DiscountType,
        product_name: product_name as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        store_id: store_id ? Number(store_id) : undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateDiscount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await this.service.update(Number(id), data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  public getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { search } = req.query;
      const result = await this.service.getProducts(search as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
