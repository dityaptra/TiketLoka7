"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import HeroBackgroundSlider from "./HeroBackgroundSlider"; // Pastikan file ini ada

const HeroSection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman
    if (searchQuery.trim()) {
      // Redirect ke halaman events dengan parameter search
      router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <HeroBackgroundSlider />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-[#0B2F5E]/30"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto -mt-25">

        {/* Heading */}
        <h1
          className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000"
          style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
        >
          Telusuri
          <br />
          <span className="text-[#F57C00]">Wisata Dunia</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-white text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
        >
          Nikmati kemudahan pesan tiket wisata tanpa antre. Ribuan destinasi
          indah menunggu petualanganmu selanjutnya.
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="bg-white p-2.5 rounded-2xl shadow-2xl max-w-3xl mx-auto flex items-center border-2 border-white/50 animate-in fade-in zoom-in duration-700 delay-200"
        >
          <div className="pl-6 text-[#F57C00]">
            <Search size={28} />
          </div>
          <input
            type="text"
            placeholder="Mau liburan ke mana?"
            className="flex-1 p-4 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-lg font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-[#F57C00] hover:bg-[#E65100] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95"
          >
            <span className="hidden md:inline">Cari</span>
            {/* Tampilkan icon search di mobile jika text hidden */}
            <Search className="md:hidden w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeroSection;