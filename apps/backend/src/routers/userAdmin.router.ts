import { Router } from 'express';
import { UserAdminController } from '../controllers/userAdmin.controller';

class UserAdminRouter {
  public router: Router;
  private controller: UserAdminController;

  constructor() {
    this.router = Router();
    this.controller = new UserAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.controller.getUsers);
    this.router.post('/', this.controller.createStoreAdmin);
    this.router.put('/:id', this.controller.updateStoreAdmin);
    this.router.delete('/:id', this.controller.deleteStoreAdmin);
  }
}

export default new UserAdminRouter().router;
