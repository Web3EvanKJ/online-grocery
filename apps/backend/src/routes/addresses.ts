import { Router, RequestHandler } from 'express';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setMainAddress,
} from '../controllers/addressController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getUserAddresses);
router.get('/:id', authenticateToken, getAddressById);
router.post('/', authenticateToken, createAddress);
router.put('/:id', authenticateToken, updateAddress);
router.delete('/:id', authenticateToken, deleteAddress);
router.patch('/:id/set-main', authenticateToken, setMainAddress);

export default router;