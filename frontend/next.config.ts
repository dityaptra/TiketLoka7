/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Konfigurasi untuk mengizinkan gambar dari Unsplash
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },

  // 2. Konfigurasi Proxy ke Laravel (Tetap dipertahankan)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*', // Proxy ke Laravel
      },
    ];
  },
};

module.exports = nextConfig;