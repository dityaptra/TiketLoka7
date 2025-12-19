// 📂 File: src/services/publicService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function getDestinationBySlug(slug: string) {
  try {
    // cache: 'no-store' agar data selalu update jika ada perubahan harga/deskripsi
    const res = await fetch(`${API_BASE_URL}/api/destinations/${slug}`, {
      cache: 'no-store', 
    });
    
    if (!res.ok) return null;
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return null;
  }
}