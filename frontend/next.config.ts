import type { NextConfig } from 'next';

// 1. Ambil URL dari Environment Variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// 2. Parsing URL untuk mengambil Hostname (untuk config gambar)
// Contoh: "https://api.tiketloka.com" -> hostname: "api.tiketloka.com"
const apiHost = new URL(API_URL).hostname;

const nextConfig: NextConfig = {
  // 3. Konfigurasi Gambar
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
      // ✅ TAMBAHAN PENTING: Izinkan gambar dari Backend Laravel Anda sendiri
      {
        protocol: API_URL.startsWith('https') ? 'https' : 'http',
        hostname: apiHost,
        pathname: '/storage/**', // Izinkan folder storage
      },
    ],
  },

  // 4. Konfigurasi Proxy (Rewrites)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // ✅ GANTI DENGAN VARIABEL: Agar dinamis (Local vs Production)
        destination: `${API_URL}/api/:path*`, 
      },
    ];
  },
};

export default nextConfig;