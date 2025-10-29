import { Router } from 'express';
import { ProductSearchController } from '../controllers/productSearch.controller';

/**
 * @class ProductRouter
 * @description
 * Mengelompokkan semua route terkait produk publik.
 */
class ProductRouter {
  public router: Router;
  private productController: ProductSearchController;

  constructor() {
    this.router = Router();
    this.productController = new ProductSearchController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // === GET /products ===
    // Mendukung query param:
    // ?page=1&limit=10&name=aqua&category=Minuman&discounted=true&sort=asc
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.router.get('/', this.productController.getProducts);

    this.router.get('/:slug', this.productController.getProductBySlug);
  }
}

export default new ProductRouter().router;
