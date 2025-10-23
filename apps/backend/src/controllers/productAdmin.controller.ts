import { ProductAdminService } from '../services/productAdmin.services';
import type { NextFunction, Request, Response } from 'express';

export class ProductAdminController {
  private service: ProductAdminService;

  constructor() {
    this.service = new ProductAdminService();
  }

  /** 🔹 Upload only — optional route if frontend uploads separately */
  public uploadImages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const files = req.files as Express.Multer.File[];
      const response = await this.service.uploadImages(files);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /** 🔹 Create product (auto-upload to Cloudinary if files provided) */
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const response = await this.service.create({ ...data });
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

  /** 🔹 Update product (replaces images if new ones uploaded) */
  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const response = await this.service.update(id, { ...data });
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
