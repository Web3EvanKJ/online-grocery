import { Router } from 'express';
import { StockAdminController } from '../controllers/stockAdmin.controller';

class StockRouter {
  public router: Router;
  private controller: StockAdminController;

  constructor() {
    this.router = Router();
    this.controller = new StockAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Ambil history stok
    this.router.get('/', this.controller.getStockHistory);
    // Ambil daftar toko (untuk filter di frontend)
    this.router.get('/stores', this.controller.getStores);
  }
}

export default new StockRouter().router;
