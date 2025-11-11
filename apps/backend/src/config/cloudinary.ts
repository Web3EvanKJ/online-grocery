// src/config/cloudinary.ts - For production file storage
import { v2 as cloudinary } from 'cloudinary';

// This would be used in production instead of local file storage
export const configureCloudinary = () => {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
};

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string = 'grocify') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' },
            { format: 'jpg' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(fileBuffer);
  });
};