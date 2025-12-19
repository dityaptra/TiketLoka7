import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Ganti dengan domain asli Anda nanti saat deploy (misal: https://tiketloka.com)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'httpS://tiketloka.web.id';

  return {
    rules: {
      userAgent: '*',     // Aturan ini berlaku untuk SEMUA bot (Google, Bing, Yahoo, dll)
      allow: '/',         // Boleh masuk ke semua halaman...
      disallow: [         // ...KECUALI halaman-halaman rahasia ini:
        '/admin/',        // Dashboard Admin
        '/payment/',      // Halaman Transaksi/Pembayaran
        '/tickets/',      // Halaman E-Ticket User
        '/profile/',      // Profil User
        '/auth/',         // Login/Register
        '/api/',          // Internal API Routes Next.js
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // Kita kasih peta situsnya di sini
  };
}