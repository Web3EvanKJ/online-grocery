import { Router } from 'express';
import { InventoryAdminController } from '../controllers/inventoryAdmin.controller';

/**
 * @class InventoryRouter
 * @description
 * Mengatur semua route untuk manajemen stok dan jurnal stok.
 */
class InventoryRouter {
  public router: Router;
  private controller: InventoryAdminController;

  constructor() {
    this.router = Router();
    this.controller = new InventoryAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.controller.getAll);
    this.router.post('/', this.controller.create);
    this.router.put('/:id', this.controller.update);
    this.router.post('/journal', this.controller.createJournal);
  }
}

export default new InventoryRouter().router;
