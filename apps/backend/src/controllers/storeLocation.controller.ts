import { StoreLocationService } from '../services/storeLocation.service';
import type { Request, Response, NextFunction } from 'express';

export class StoreLocationController {
  private service: StoreLocationService;

  constructor() {
    this.service = new StoreLocationService();
  }

  // get nearest store
  public getNearestStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { latitude, longitude } = req.query as {
        latitude?: string;
        longitude?: string;
      };

      const lat = parseFloat(latitude || '');
      const lon = parseFloat(longitude || '');

      const response = await this.service.findNearestStore(lat, lon);
      res.json(response);
    } catch (error) {
      console.error('ERROR_GET_NEAREST_STORE:', error);
      next(error);
    }
  };
}
