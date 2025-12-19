// 📂 File: src/app/events/[slug]/page.tsx
import { Metadata, ResolvingMetadata } from "next";
import EventDetailView from "@/components/views/EventDetailView";
import { getDestinationBySlug } from "@/services/publicService";

// Helper Image URL untuk Server Side
const getSeoImageUrl = (url: string | null) => {
  if (!url) return 'https://placehold.co/800x600?text=No+Image';
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const path = url.startsWith('/') ? url.substring(1) : url;
  if (path.startsWith('storage/')) return `${baseUrl}/${path}`;
  return `${baseUrl}/storage/${path}`;
};

// Tipe Props untuk Next.js 15 (Promise)
type Props = {
  params: Promise<{ slug: string }>;
};

// 1. GENERATE METADATA (SEO)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await params (Wajib di Next.js 15)
  const { slug } = await params;

  // Fetch data wisata
  const destination = await getDestinationBySlug(slug);

  // Jika data tidak ditemukan
  if (!destination) {
    return { title: "Wisata Tidak Ditemukan - TiketLoka" };
  }

  // --- LOGIKA PRIORITAS SEO (BARU) ---
  
  // 1. Judul: Jika Admin isi 'meta_title', pakai itu. Jika tidak, pakai format default.
  const pageTitle = destination.meta_title 
    ? destination.meta_title 
    : `${destination.name} - Tiket & Info Lengkap`;

  // 2. Deskripsi: Jika Admin isi 'meta_description', pakai itu. Jika tidak, ambil dari deskripsi konten (potong 160 huruf).
  const pageDescription = destination.meta_description 
    ? destination.meta_description 
    : (destination.description 
        ? destination.description.replace(/<[^>]*>?/gm, '').substring(0, 160) 
        : `Booking tiket ${destination.name} termurah di TiketLoka.`);

  // 3. Keywords: Ambil dari 'meta_keywords' database (jika ada)
  const pageKeywords = destination.meta_keywords 
    ? destination.meta_keywords.split(',').map((k: string) => k.trim()) 
    : ["tiket wisata", "booking online", "tiketloka", destination.name];

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords, // ✅ Tambahkan keywords ke metadata Next.js
    
    // Open Graph (Tampilan Link WA/FB)
    openGraph: {
      title: pageTitle,        // ✅ Pakai judul prioritas
      description: pageDescription, // ✅ Pakai deskripsi prioritas
      url: `https://tiketloka.com/events/${slug}`,
      images: [
        {
          url: getSeoImageUrl(destination.image_url),
          width: 800,
          height: 600,
          alt: destination.name,
        },
      ],
      type: "website",
    },
    
    // Opsional: Twitter Card
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [getSeoImageUrl(destination.image_url)],
    }
  };
}

// 2. HALAMAN UTAMA (Server Component)
export default async function Page({ params }: Props) {
  // Ambil slug
  const { slug } = await params;

  // Panggil View Component (Client) dan kirim slug-nya
  return <EventDetailView slug={slug} />;
}