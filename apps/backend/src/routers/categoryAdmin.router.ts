import { Router } from 'express';
import { CategoryAdminController } from '../controllers/categoryAdmin.controller';

class CategoryRouter {
  public router: Router;
  private controller: CategoryAdminController;

  constructor() {
    this.router = Router();
    this.controller = new CategoryAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.controller.getAll);
    this.router.get('/:id', this.controller.getById);
    this.router.post('/', this.controller.create);
    this.router.put('/:id', this.controller.update);
    this.router.delete('/:id', this.controller.delete);
  }
}

export default new CategoryRouter().router;
