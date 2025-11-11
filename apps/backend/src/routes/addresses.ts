// src/routes/addresses.ts
import { Router } from 'express';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setMainAddress,
} from '../controllers/addressController.js';
import { validate } from '../middleware/validation.js';
import { auth, requireVerified } from '../middleware/auth.js';

const router = Router();

router.use(auth, requireVerified);

router.get('/', getUserAddresses);
router.get('/:id', getAddressById);
router.post('/', validate('address'), createAddress);
router.put('/:id', validate('updateAddress'), updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/set-main', setMainAddress);

export default router;