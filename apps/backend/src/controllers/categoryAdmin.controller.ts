import { CategoryAdminService } from '../services/categoryAdmin.service';
import type { NextFunction, Request, Response } from 'express';

export class CategoryAdminController {
  private service: CategoryAdminService;
  constructor() {
    this.service = new CategoryAdminService();
  }

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const response = await this.service.create(name);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.service.getAll(req.query);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.service.getById(Number(req.params.id));
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.service.update(
        Number(req.params.id),
        req.body.name
      );
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.service.delete(Number(req.params.id));
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
