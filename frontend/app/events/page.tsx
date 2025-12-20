'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// 👇 1. Import icon 'X'
import { Search, MapPin, Star, ChevronDown, Check, X } from 'lucide-react';
import { Destination } from '@/types';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function AllDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [searchInput, setSearchInput] = useState(''); 
  const [activeSearch, setActiveSearch] = useState(''); 
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- Helper Functions ---
  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    // Hapus 'storage/' jika sudah ada di path untuk menghindari double prefix
    const finalPath = cleanPath.startsWith('storage/') ? cleanPath.substring(8) : cleanPath;
    
    return `${BASE_URL}/storage/${finalPath}`;
  };

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        // Menggunakan BASE_URL
        const resDest = await fetch(`${BASE_URL}/api/destinations`);
        const jsonDest = await resDest.json();
        setDestinations(jsonDest.data || []);

        try {
            // Menggunakan BASE_URL
            const resCat = await fetch(`${BASE_URL}/api/categories`);
            const jsonCat = await resCat.json();
            setCategories(jsonCat.data || []); 
        } catch (e) {
            console.log("Belum ada API kategori");
        }
      } catch (err) {
        console.error('Gagal load data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [BASE_URL]);

  // --- HANDLERS ---
  const handleSearch = () => {
    setActiveSearch(searchInput); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  };

  // 👇 2. Fungsi Reset Khusus (Clear Input)
  const handleClearSearch = () => {
    setSearchInput('');     // Hapus teks di input visual
    setActiveSearch('');    // Hapus filter pencarian (kembali tampilkan semua)
    // setActiveCategory('Semua'); // Opsional: Jika ingin reset kategori juga, uncomment baris ini
  };

  // Fungsi Reset Total (Untuk tombol di Empty State)
  const handleResetTotal = () => {
      setSearchInput('');
      setActiveSearch('');
      setActiveCategory('Semua');
  };

  // --- FILTER LOGIC ---
  const filteredDestinations = destinations.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
                        item.location.toLowerCase().includes(activeSearch.toLowerCase());
    const matchCategory = activeCategory === 'Semua' 
      ? true 
      : item.category?.name === activeCategory; 

    return matchSearch && matchCategory;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      
      <Navbar />

      {/* SEARCH AREA */}
      <div className="bg-linear-to-b from-blue-50 to-gray-50 py-10 px-4">
        
        {/* SEARCH BAR CONTAINER */}
        <div className="max-w-5xl mx-auto bg-white p-1.5 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-1">
            
            {/* KATEGORI DROPDOWN */}
            <div className="relative w-full md:w-48 z-30">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-full flex items-center justify-between px-4 py-3 bg-gray-50 md:bg-white rounded-xl hover:bg-gray-50 transition group"
                >
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kategori</span>
                        <span className="text-sm font-semibold text-[#0B2F5E] truncate">{activeCategory}</span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                            {['Semua', ...categories.map(c => c.name)].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors text-gray-600"
                                >
                                    <span className={`${activeCategory === cat ? 'font-bold text-[#0B2F5E]' : ''}`}>
                                        {cat}
                                    </span>
                                    {activeCategory === cat && <Check size={16} className="text-[#0B2F5E]" />}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* DIVIDER */}
            <div className="hidden md:block w-px bg-gray-200 my-2"></div>

            {/* INPUT & ACTION BUTTONS */}
            <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 text-gray-400" size={20} />
                
                <input 
                    type="text" 
                    placeholder="Mau liburan ke mana?"
                    // 👇 3. Tambahkan padding-right (pr) lebih besar agar teks tidak nabrak tombol X dan Cari
                    className="w-full pl-12 pr-40 py-3.5 rounded-xl bg-transparent focus:bg-gray-50 outline-none text-gray-800 placeholder:text-gray-400 transition-all font-medium"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown} 
                />

                {/* AREA TOMBOL KANAN (RESET & CARI) */}
                <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-2">
                    
                    {/* 👇 4. TOMBOL RESET (X) - Hanya muncul jika ada text */}
                    {searchInput && (
                        <button 
                            onClick={handleClearSearch}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Hapus pencarian"
                        >
                            <X size={18} />
                        </button>
                    )}

                    {/* TOMBOL CARI */}
                    <button 
                        onClick={handleSearch}
                        className="h-full px-6 bg-[#0B2F5E] hover:bg-blue-900 text-white font-bold rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-2 text-sm"
                    >
                        <span>Cari</span>
                    </button>
                </div>
            </div>

        </div>
      </div>

      {/* RESULT GRID */}
      <div className="max-w-7xl mx-auto px-4 pb-20 mt-6">
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-80 bg-gray-200 rounded-3xl"></div>)}
            </div>
        ) : filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredDestinations.map((item) => (
                    <div key={item.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col">
                        <div className="relative h-56 overflow-hidden bg-gray-100">
                            <img
                                src={getImageUrl(item.image_url)}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/95 backdrop-blur-sm text-[#0B2F5E] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide border border-gray-100">
                                    {item.category?.name || 'Umum'}
                                </span>
                            </div>
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                                <Star size={12} className="text-orange-500 fill-orange-500"/>
                                {item.rating ? Number(item.rating).toFixed(1) : 'New'}
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-[#0B2F5E] transition-colors">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                    <MapPin size={14} className="text-gray-400" /> 
                                    {item.location}
                                </div>
                            </div>
                            
                            <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-4">
                                <div>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase">Mulai dari</span>
                                    <div className="text-lg font-bold text-[#F57C00]">
                                        {formatRupiah(item.price)}
                                    </div>
                                </div>
                                <Link href={`/events/${item.slug}`}>
                                    <button className="h-10 px-5 bg-[#0B2F5E] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition shadow-md hover:shadow-lg">
                                        Lihat
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-[#0B2F5E]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Yah, destinasi tidak ditemukan</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    Kami tidak menemukan wisata dengan kata kunci <strong>"{activeSearch}"</strong> di kategori "{activeCategory}".
                </p>
                <button 
                    onClick={handleResetTotal}
                    className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition"
                >
                    Reset Filter
                </button>
            </div>
        )}
      </div>
      <Footer />
    </main>
  );
}