'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Destination } from '@/types'; 
import { MapPin, Star, ArrowUpRight } from 'lucide-react';

export default function DestinationGridSection({ endpoint, title, limit }: { endpoint: string, title: string, limit?: number }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Helper: URL Gambar ---
  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    if (cleanPath.startsWith('storage/')) {
       return `http://127.0.0.1:8000/${cleanPath}`;
    }
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  // --- Helper: Format Rupiah ---
  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  // --- Fetching Data ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        let data = json.data || [];
        
        if (limit && data.length > limit) {
          data = data.slice(0, limit);
        }
        
        setDestinations(data);
      } catch (err) {
        console.error(`Gagal fetching data`, err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [endpoint, limit]);

  // --- RENDER SKELETON LOADING ---
  if (loading) return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[400px]">
              <div className="h-56 bg-gray-200 animate-pulse"></div>
              <div className="p-5 space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (destinations.length === 0) return (
    <div className="py-20 text-center">
      <p className="text-gray-400 font-medium">Belum ada destinasi untuk kategori ini.</p>
    </div>
  );

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600">Tempat wisata terfavorit pilihan traveler</p>
          </div>
          {limit && (
            <Link href="/events" className="text-[#0B2F5E] font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowUpRight size={18}/>
            </Link>
          )}
        </div>
        
        {/* Grid Kartu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((item) => (
            <div 
              key={item.id} 
              className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 relative"
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
                  }}
                />
                
                {/* BAGIAN RATING (DIPERBAIKI) */}
                <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                  <Star size={14} fill="#F57C00" className="text-[#F57C00]" />
                  <span className="text-sm font-bold text-gray-800">
                    {/* Mengambil rating dari database, jika null default ke 0 */}
                    {item.rating ? Number(item.rating).toFixed(1) : 'New'}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#0B2F5E] transition-colors">
                  {item.name}
                </h3>
                
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <MapPin size={14} className="text-[#F57C00]"/>
                  {item.location}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-xs text-gray-500">Mulai dari</span>
                    <p className="text-xl font-bold text-[#F57C00]">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  
                  {/* Tombol Lihat */}
                  <Link href={`/events/${item.slug}`}>
                    <button className="px-5 py-2.5 bg-[#0B2F5E] text-white rounded-xl font-semibold hover:bg-[#1a457e] transition-colors shadow-md text-sm cursor-pointer">
                      Lihat
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}