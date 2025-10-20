import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['els.id', 'www.keychron.id', 'row.hyperx.com', 'i.pinimg.com'], // ✅ allow this image host
  },
};

export default nextConfig;
