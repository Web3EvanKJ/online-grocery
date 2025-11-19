// routes/cart.routes.ts
import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticateToken, requireVerifiedUser } from '../middleware/auth'; // ✅ Import dari middleware/auth

const router = Router();

// Apply auth to all cart routes - user harus verified untuk fitur cart
router.use(authenticateToken, requireVerifiedUser);

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.patch('/:id', CartController.updateCartItem);
router.delete('/:id', CartController.removeFromCart);
router.delete("/clear", CartController.clearCart);

export default router;