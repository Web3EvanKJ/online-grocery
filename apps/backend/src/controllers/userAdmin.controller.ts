import { UserAdminService } from '../services/userAdmin.service';
import type { Request, Response, NextFunction } from 'express';
import { UserAdminGetService } from '../services/userAdminGet.service';

export class UserAdminController {
  private service: UserAdminService;
  private getService: UserAdminGetService;

  constructor() {
    this.service = new UserAdminService();
    this.getService = new UserAdminGetService();
  }

  public createStoreAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.createStoreAdmin(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, role, search, sortOrder } = req.query;

      const result = await this.getService.getUsers({
        page: Number(page),
        limit: Number(limit),
        role: role as 'super_admin' | 'user' | 'store_admin',
        search: String(search),
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateStoreAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.updateStoreAdmin(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public deleteStoreAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteStoreAdmin(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
