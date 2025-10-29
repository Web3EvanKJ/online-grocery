import { InventoryAdminService } from '../services/inventoryAdmin.service';
import type { Request, Response, NextFunction } from 'express';

export class InventoryAdminController {
  private service: InventoryAdminService;

  constructor() {
    this.service = new InventoryAdminService();
  }

  /** GET /inventories */
  public getInventories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        store_id,
        role,
        user_id,
        sort = 'alphabet',
      } = req.query;

      const result = await this.service.getInventories({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        store_id: store_id ? Number(store_id) : undefined,
        role: String(role),
        user_id: user_id ? Number(user_id) : undefined,
        sort: String(sort),
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /** POST /inventories */
  public createOrUpdateInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { product_id, store_id, type, quantity, note } = req.body;

      const result = await this.service.createOrUpdateInventory({
        product_id,
        store_id,
        type,
        quantity,
        note,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /** GET /inventories/:id/journals */
  public getStockJournals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.service.getStockJournals(Number(id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /** GET /inventories/stores */
  public getStores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, user_id } = req.query;
      const result = await this.service.getStores(
        String(role),
        user_id ? Number(user_id) : undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
