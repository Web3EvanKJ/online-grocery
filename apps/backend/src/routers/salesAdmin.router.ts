// src/routes/sales.route.ts
import { Router } from 'express';
import { SalesAdminController } from '../controllers/salesAdmin.controller';

class SalesRouter {
  public router: Router;
  private controller: SalesAdminController;

  constructor() {
    this.router = Router();
    this.controller = new SalesAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET /api/sales/report
    this.router.get('/report', this.controller.getSalesReport);

    // GET /api/sales/stores (untuk dropdown filter)
    this.router.get('/stores', this.controller.getStores);

    // GET /api/sales/categories (untuk dropdown filter)
    this.router.get('/categories', this.controller.getCategories);
  }
}

export default new SalesRouter().router;
