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
      'picsum.photos',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
