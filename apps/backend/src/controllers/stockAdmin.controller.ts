import { StockAdminService } from '../services/stockAdmin.service';
import type { Request, Response, NextFunction } from 'express';

export class StockAdminController {
  private service: StockAdminService;

  constructor() {
    this.service = new StockAdminService();
  }

  /**
   * GET /stocks
   * @description Ambil data history stok per bulan
   */
  public getStockHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, storeId, month, productName, page, limit } = req.query;

      const response = await this.service.getStockHistory({
        role: String(role),
        storeId:
          storeId === 'all' ? 'all' : storeId ? Number(storeId) : undefined,
        month: String(month),
        productName: productName ? String(productName) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /stores
   * @description Ambil daftar toko untuk filter
   */
  public getStores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, storeId } = req.query;

      const response = await this.service.getStores(
        String(role),
        storeId === 'all' ? 'all' : storeId ? Number(storeId) : undefined
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
