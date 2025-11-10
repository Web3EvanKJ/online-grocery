import { StockAdminService } from '../services/stockAdmin.service';
import type { Request, Response, NextFunction } from 'express';

export class StockAdminController {
  private service: StockAdminService;

  constructor() {
    this.service = new StockAdminService();
  }

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

  public getStores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, user_id } = req.query;

      const response = await this.service.getStores(
        String(role),
        Number(user_id)
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
