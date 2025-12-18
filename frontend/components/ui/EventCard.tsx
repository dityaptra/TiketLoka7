import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Destination } from '@/types'; // Gunakan type dari file types

export default function EventCard({ data }: { data: Destination }) {
  // Fallback jika gambar kosong
  const fallbackImage = 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800';
  
  // Logic: Gunakan image_url dari database, jika null pakai fallback
  const imageSrc = data.image_url ? data.image_url : fallbackImage;

  return (
    <Link href={`/events/${data.slug}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden">
        <Image 
          src={imageSrc} 
          alt={data.name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={false}
          // unoptimized={true} membantu menghindari masalah domain local saat development
          unoptimized={true} 
        />
        {/* Badge Kategori (Opsional, pastikan data category ada di API) */}
        {/* Jika API index belum join kategori, bagian ini bisa error jika tidak dicek */}
        {(data as any).category && (
          <div className="absolute top-3 left-3 bg-[#F57C00]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
            {(data as any).category.name}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0B2F5E] transition-colors line-clamp-1 mb-2">
          {data.name}
        </h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {data.location}
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
          <div className="text-xs text-gray-500 font-medium">Mulai dari</div>
          <div className="text-xl font-extrabold text-[#F57C00]">
            Rp {Number(data.price).toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </Link>
  );
}