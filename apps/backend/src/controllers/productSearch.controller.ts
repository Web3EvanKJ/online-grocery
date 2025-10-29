import { ProductSearchService } from '../services/productSearch.service';
import type { NextFunction, Request, Response } from 'express';

/**
 * @class ProductController
 * @description
 * Bertindak sebagai penghubung antara HTTP layer (route) dan business logic layer (service).
 */
export class ProductSearchController {
  private service: ProductSearchService;

  constructor() {
    this.service = new ProductSearchService();
  }

  /**
   * @method getProducts
   * @description Menangani request untuk membaca daftar produk.
   *
   * Query params:
   * - page (number)
   * - limit (number)
   * - name (string)
   * - category (string)
   * - discounted ("true" / "false")
   * - sort ("asc" / "desc")
   */
  public getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, limit, name, category, discounted, sort, store_id } =
        req.query;

      const response = await this.service.getProducts({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        name: name ? String(name) : undefined,
        category: category ? String(category) : undefined,
        discounted: discounted ? String(discounted) : undefined,
        sort: sort === 'desc' ? 'desc' : 'asc',
        store_id: Number(store_id),
      });

      res.status(200).json({
        success: true,
        message: 'Produk berhasil diambil',
        ...response,
      });
    } catch (error) {
      console.error('ERROR_GET_PRODUCTS:', error);
      next(error);
    }
  };

  // productSearch.controller.ts
  public getProductBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { slug } = req.params;
      const { store_id } = req.query;

      const product = await this.service.getProductBySlug(
        slug,
        store_id ? Number(store_id) : 1
      );

      res.status(200).json({
        data: product,
      });
    } catch (error) {
      console.error('ERROR_GET_PRODUCT_BY_SLUG:', error);
      next(error);
    }
  };
}
