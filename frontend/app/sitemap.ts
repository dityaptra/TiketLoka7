import { MetadataRoute } from 'next';

// Base URL Frontend & Backend
const WEB_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Fungsi Fetch Data semua wisata dari Laravel
async function getAllDestinations() {
  try {
    // Kita panggil API public list wisata
    // Pastikan API ini mereturn array data wisata
    const res = await fetch(`${API_BASE_URL}/api/destinations?limit=1000`, {
      cache: 'no-store', // Selalu ambil data terbaru
    });
    
    if (!res.ok) return [];
    
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Gagal generate sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Ambil data wisata dari Database
  const destinations = await getAllDestinations();

  // 2. Buat URL Dinamis untuk setiap wisata
  const destinationUrls = destinations.map((item: any) => ({
    url: `${WEB_BASE_URL}/events/${item.slug}`, // URL Halaman Detail
    lastModified: new Date(item.updated_at || new Date()), // Kapan terakhir diedit
    changeFrequency: 'weekly' as const, // Seberapa sering konten berubah
    priority: 0.8, // Skala 0.0 - 1.0 (0.8 artinya penting)
  }));

  // 3. Buat URL Statis (Halaman Tetap)
  const staticUrls = [
    {
      url: WEB_BASE_URL, // Homepage (Paling Penting)
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${WEB_BASE_URL}/about`, // Halaman Tentang Kami (Jika ada)
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${WEB_BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Gabungkan keduanya
  return [...staticUrls, ...destinationUrls];
}