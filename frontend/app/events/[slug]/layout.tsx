import { ReactNode } from 'react';
import { Metadata } from 'next';

// KONFIGURASI URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const FRONTEND_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Helper URL Gambar
const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    
    // Hapus slash di depan jika ada, agar tidak double slash
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/storage/${cleanPath}`;
};

// 1. Definisikan tipe Props untuk Params sebagai Promise (Wajib di Next.js 15)
type Props = {
    params: Promise<{ slug: string }>
}

// --- FUNGSI GENERATE METADATA (SERVER SIDE) ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // 2. Lakukan AWAIT di sini agar slug bisa dibaca
    const { slug } = await params;
    
    const fallbackTitle = 'TiketLoka - Pesan Tiket Wisata';

    try {
        // Menggunakan BASE_URL environment variable
        const res = await fetch(`${BASE_URL}/api/destinations/${slug}`, {
            cache: 'force-cache',
            // Timeout opsional untuk mencegah hanging terlalu lama saat build
            signal: AbortSignal.timeout(5000) 
        });

        if (!res.ok) {
             console.warn(`[METADATA] API status ${res.status} for slug: ${slug}`);
             return { title: fallbackTitle };
        }
        
        const json = await res.json();
        
        // Safety check: pastikan data ada sebelum akses properti
        if (!json.data) return { title: fallbackTitle };

        const data = json.data;
        // Gunakan data SEO jika ada, jika tidak fallback ke data utama
        const seoTitle = data.meta_title || data.name || fallbackTitle;
        const seoDesc = data.meta_description || data.description || 'Deskripsi tidak tersedia.';
        
        // Handle OG Image
        const ogImage = getImageUrl(data.image_url);

        return {
            title: seoTitle,
            description: seoDesc,
            openGraph: {
                title: seoTitle,
                description: seoDesc,
                images: ogImage ? [ogImage] : [],
                // Menggunakan FRONTEND_URL agar link share benar saat production
                url: `${FRONTEND_URL}/wisata/${slug}`,
                type: 'website',
            },
            keywords: data.meta_keywords ? data.meta_keywords.split(',') : ['wisata', 'tiket', 'liburan'],
        };

    } catch (error) {
        console.error(`[METADATA ERROR]: Could not fetch SEO for ${slug}.`, error);
        return {
            title: fallbackTitle,
            description: 'Platform pemesanan tiket wisata termudah.'
        };
    }
}

// Layout ini hanya membungkus child components
export default function EventDetailLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}