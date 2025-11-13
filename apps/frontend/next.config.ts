import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'els.id',
      'www.keychron.id',
      'row.hyperx.com',
      'i.pinimg.com',
      'via.placeholder.com',
      'res.cloudinary.com',
      'example.com',
    ], // ✅ allow this image host
  },
};

export default nextConfig;
