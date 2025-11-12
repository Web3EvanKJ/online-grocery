import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  return new Promise<{ url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'products' }, (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url });
      })
      .end(file.buffer);
  });
};

export const uploadImage = (file: Express.Multer.File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};