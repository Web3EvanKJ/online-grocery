import { Router } from 'express';
import { StoreLocationController } from '../controllers/storeLocation.controller';

class StoreRouter {
  public router: Router;
  private controller: StoreLocationController;

  constructor() {
    this.router = Router();
    this.controller = new StoreLocationController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET /stores/nearest
    this.router.get('/nearest', this.controller.getNearestStore);
  }
}

export default new StoreRouter().router;
