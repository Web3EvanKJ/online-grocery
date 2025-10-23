import { Router } from 'express';
import multer from 'multer';
import { ProductAdminController } from '../controllers/productAdmin.controller';

const upload = multer({ storage: multer.memoryStorage() }); // buffer to Cloudinary

class ProductAdminRouter {
  public router: Router;
  private controller: ProductAdminController;

  constructor() {
    this.router = Router();
    this.controller = new ProductAdminController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 🔹 Upload images separately (optional endpoint)
    this.router.post(
      '/upload',
      upload.array('images'),
      this.controller.uploadImages
    );

    // 🔹 CRUD
    this.router.get('/', this.controller.getAll);
    this.router.get('/:id', this.controller.getById);
    this.router.post('/', this.controller.create);
    this.router.put('/:id', this.controller.update);
    this.router.delete('/:id', this.controller.delete);
  }
}

export default new ProductAdminRouter().router;
