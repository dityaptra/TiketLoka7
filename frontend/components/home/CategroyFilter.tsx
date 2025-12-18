'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  selectedSlug: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryFilter({ selectedSlug, onSelectCategory }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        setCategories(json.data || []);
      } catch (err) {
        console.error("Gagal load kategori", err);
      }
    }
    fetchCategories();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 200;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="sticky top-[80px] z-30 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Container Utama */}
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full shadow-lg p-2 pointer-events-auto mx-auto max-w-5xl relative group flex items-center">
          
          {/* Tombol Panah KIRI */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-2 z-20 bg-[#0B2F5E] shadow-md rounded-full p-2 text-white hover:scale-110 transition-all hidden md:flex border border-white/20"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Area Scrollable */}
          {/* PERUBAHAN PENTING: 
             Saya menambahkan 'md:px-12'. 
             Ini memberi ruang kosong (padding) di kiri & kanan hanya saat di desktop (saat tombol panah muncul),
             sehingga item pertama dan terakhir tidak tertutup tombol.
          */}
          <div 
            ref={scrollRef}
            className="overflow-x-auto flex flex-nowrap items-center gap-3 py-1 no-scrollbar scroll-smooth px-2 md:px-12 w-full"
          >
            
            {/* Tombol "Semua" */}
            <button
              onClick={() => onSelectCategory('')}
              className={`
                flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap border
                ${selectedSlug === '' 
                  ? 'bg-[#F57C00] border-[#F57C00] text-white shadow-md shadow-orange-200' 
                  : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300 hover:text-[#0B2F5E]'
                }
              `}
            >
              <span>Semua</span>
            </button>

            {/* Mapping Kategori */}
            {categories.map((cat) => {
              const isActive = selectedSlug === cat.slug;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`
                    flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border whitespace-nowrap
                    ${isActive
                      ? 'bg-[#F57C00] border-[#F57C00] text-white shadow-md shadow-orange-200' 
                      : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300 hover:text-[#0B2F5E]'
                    }
                  `}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tombol Panah KANAN */}
          <button 
            onClick={() => scroll('right')}
            className="absolute right-2 z-20 bg-[#0B2F5E] shadow-md rounded-full p-2 text-white hover:scale-110 transition-all hidden md:flex border border-white/20"
          >
            <ChevronRight size={20} />
          </button>

        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}