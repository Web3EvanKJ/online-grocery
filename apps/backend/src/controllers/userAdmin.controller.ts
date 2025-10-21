import { UserAdminService } from '../services/userAdmin.service';
import type { Request, Response, NextFunction } from 'express';

export class UserAdminController {
  private service: UserAdminService;

  constructor() {
    this.service = new UserAdminService();
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
      const result = await this.service.getUsers(req.query);
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
