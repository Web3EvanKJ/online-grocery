import { InventoryAdminService } from '../services/inventoryAdmin.services';
import type { NextFunction, Request, Response } from 'express';

/**
 * @class InventoryController
 * @description
 * Menangani request HTTP terkait manajemen stok (inventories dan stock journals).
 */
export class InventoryAdminController {
  private service: InventoryAdminService;

  constructor() {
    this.service = new InventoryAdminService();
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.service.create(req.body);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, storeId, role, search } = req.query;
      const response = await this.service.getAll({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        storeId: storeId ? Number(storeId) : undefined,
        role: role as string,
        search: search as string,
      });
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const response = await this.service.update(id, req.body);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public createJournal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await this.service.createJournal(req.body);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
