import { Router } from 'express';
import { InventoryAdminController } from '../controllers/inventoryAdmin.controller';

class InventoryAdminRouter {
  public router: Router;
  private controller: InventoryAdminController;

  constructor() {
    this.router = Router();
    this.controller = new InventoryAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.controller.getInventories);
    this.router.post('/', this.controller.createOrUpdateInventory);
    this.router.get('/:id/journals', this.controller.getStockJournals);
    this.router.get('/stores/list', this.controller.getStores);
  }
}

export default new InventoryAdminRouter().router;
