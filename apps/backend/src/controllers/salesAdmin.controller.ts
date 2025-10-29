import { SalesAdminService } from '../services/salesAdmin.service';
import type { NextFunction, Request, Response } from 'express';

export class SalesAdminController {
  private service: SalesAdminService;

  constructor() {
    this.service = new SalesAdminService();
  }

  /**
   * GET /api/sales/report
   * Example:
   * /api/sales/report?role=super_admin&userId=1&storeId=2&categoryId=all&productName=water&month=2025-10&page=1&limit=10
   */
  public getSalesReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        role,
        storeId,
        categoryId,
        productName,
        month,
        page,
        limit,
        sort,
      } = req.query;

      const data = await this.service.getSalesReport({
        role: role as string,
        storeId: storeId === 'all' ? 'all' : Number(storeId),
        categoryId: categoryId === 'all' ? 'all' : Number(categoryId),
        productName: productName as string,
        month: month as string,
        page: Number(page),
        limit: Number(limit),
        sort: (sort as 'asc' | 'desc') || 'desc',
      });

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/sales/stores
   * Example: /api/sales/stores?role=store_admin&userId=2
   */
  public getStores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, userId } = req.query;

      const data = await this.service.getStores(role as any, Number(userId));
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/sales/categories
   */
  public getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.service.getCategories();
      res.json(data);
    } catch (error) {
      next(error);
    }
  };
}
