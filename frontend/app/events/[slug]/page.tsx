import { Metadata, ResolvingMetadata } from "next";
import EventDetailView from "@/components/views/EventDetailView";
import { getDestinationBySlug } from "@/services/publicService";

// Helper Image URL
const getSeoImageUrl = (url: string | null) => {
  if (!url) return 'https://placehold.co/800x600?text=No+Image';
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const path = url.startsWith('/') ? url.substring(1) : url;
  // Handle storage path dari Laravel
  if (path.startsWith('storage/')) return `${baseUrl}/${path}`;
  return `${baseUrl}/storage/${path}`;
};

type Props = {
  params: Promise<{ slug: string }>;
};

// --- FUNGSI UTAMA SEO ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // 1. Fetch Data
  // Pastikan function ini memanggil API yang datanya fresh (tidak di-cache selamanya)
  const destination = await getDestinationBySlug(slug);

  // 2. Fallback jika data null
  if (!destination) {
    return { title: "Wisata Tidak Ditemukan - TiketLoka" };
  }

  // 3. Logika Prioritas (Admin Input > Default System)
  const pageTitle = destination.meta_title 
    ? destination.meta_title 
    : `${destination.name} - Tiket & Info Lengkap`;

  const pageDescription = destination.meta_description 
    ? destination.meta_description 
    : (destination.description 
        ? destination.description.replace(/<[^>]*>?/gm, '').substring(0, 160) 
        : `Booking tiket ${destination.name} termurah di TiketLoka.`);

  const pageKeywords = destination.meta_keywords 
    ? destination.meta_keywords.split(',').map((k: string) => k.trim())
    : ["tiket wisata", "booking online", "tiketloka", destination.name];

  const imageUrl = getSeoImageUrl(destination.image_url);

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://tiketloka.com/events/${slug}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: destination.name,
        },
      ],
      type: "website",
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    }
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <EventDetailView slug={slug} />;
}