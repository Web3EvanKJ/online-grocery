// middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif)'));
  }
};

export const uploadPaymentProof = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB max
  fileFilter,
}).single('proof_image');
