// src/routes/profile.ts
import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  updateProfileImage,
  deleteProfileImage,
} from '../controllers/profileController.js';
import { validate } from '../middleware/validation.js';
import { auth, requireVerified } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = Router();

router.use(auth);

router.get('/', getProfile);
router.put('/', validate('updateProfile'), updateProfile);
router.patch('/password', validate('changePassword'), changePassword);
router.patch('/image', upload.single('image'), handleUploadError, updateProfileImage);
router.delete('/image', deleteProfileImage);

export default router;