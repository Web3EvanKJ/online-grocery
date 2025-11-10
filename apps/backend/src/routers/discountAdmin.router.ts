import { Router } from 'express';
import { DiscountAdminController } from '../controllers/discountAdmin.controller';

class DiscountAdminRouter {
  public router: Router;
  private controller: DiscountAdminController;

  constructor() {
    this.router = Router();
    this.controller = new DiscountAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.createDiscount);
    this.router.get('/', this.controller.getAllDiscounts);
    this.router.get('/history', this.controller.getDiscountsHistory);
    this.router.get('/products', this.controller.getProducts);
    this.router.put('/:id', this.controller.updateDiscount);
  }
}

export default new DiscountAdminRouter().router;
