// src/routes/cart.routes.ts
import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
  addToCartSchema, 
  updateCartSchema, 
  cartIdSchema 
} from '../validations/cart.validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate as any);

// Define routes with proper middleware
router.get('/', (req, res) => CartController.getCart(req as any, res));
router.get('/count', (req, res) => CartController.getCartCount(req as any, res));
router.post('/', validate(addToCartSchema), (req, res) => CartController.addToCart(req as any, res));
router.put('/:id', validate(updateCartSchema), (req, res) => CartController.updateCart(req as any, res));
router.delete('/:id', validate(cartIdSchema), (req, res) => CartController.removeFromCart(req as any, res));
router.delete('/', (req, res) => CartController.clearCart(req as any, res));

export default router;