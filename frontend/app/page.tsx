"use client";

import { useState } from "react";
import {
  ArrowRight,
  TrendingUp,
  Calendar,
  Shield,
} from "lucide-react";
// Pastikan path import ini sesuai dengan lokasi file komponen Anda
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DestinationGridSection from "@/components/home/DestinationGridSection";
import CategoryFilter from "@/components/home/CategroyFilter";
import HeroSection from "@/components/home/HeroSection"; 

// Komponen Fitur (Helper)
const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="w-14 h-14 bg-[#F57C00] rounded-xl flex items-center justify-center mb-5">
      <Icon size={28} className="text-white" strokeWidth={2.5} />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("");

  // --- LOGIKA FILTER DINAMIS ---
  // Jika ada kategori dipilih, tambahkan query param. Jika tidak, ambil semua.
  const destinationEndpoint = selectedCategory
    ? `/api/destinations?category=${selectedCategory}`
    : "/api/destinations";

  // Judul section yang berubah dinamis
  const sectionTitle = selectedCategory 
    ? `Wisata di ${selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` // Format slug jadi Title Case
    : "Destinasi Populer";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* --- KATEGORI FILTER SECTION (UPDATED) --- */}
      <div className="relative z-20 -mt-8 px-4 mb-8">
         <div className="max-w-7xl mx-auto"> 
            <CategoryFilter 
              selectedSlug={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
         </div>
      </div>

      {/* --- DESTINASI GRID SECTION (UPDATED) --- */}
      <DestinationGridSection
        endpoint={destinationEndpoint} // Menggunakan endpoint dinamis
        title={sectionTitle}           // Judul dinamis
        limit={4}
      />

      {/* Fitur Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Kenapa Pilih TiketLoka?
            </h2>
            <p className="text-gray-600 text-lg">
              Kemudahan dan kepercayaan dalam satu platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={TrendingUp}
              title="Harga Terbaik"
              description="Dapatkan harga tiket terbaik dengan berbagai promo menarik setiap harinya."
            />
            <FeatureCard
              icon={Calendar}
              title="Booking Mudah"
              description="Proses pemesanan cepat dan mudah, tiket langsung dikirim ke email Anda."
            />
            <FeatureCard
              icon={Shield}
              title="Aman & Terpercaya"
              description="Transaksi dijamin aman dengan sistem pembayaran terenkripsi."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto bg-[#0B2F5E] rounded-3xl overflow-hidden relative shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between p-12 md:p-16 gap-12">
            <div className="md:w-1/2 text-left">
              <span className="text-[#F57C00] font-bold tracking-wider text-sm mb-3 block uppercase">
                Promo Spesial
              </span>
              <h2 className="text-5xl font-black text-white mb-6 leading-tight">
                Liburan Impian
                <br />
                Mulai dari Sini
              </h2>
              <p className="text-gray-200 text-lg mb-8 leading-relaxed max-w-lg">
                Dapatkan penawaran eksklusif dan diskon menarik. Jangan lewatkan
                momen berharga bersama orang tercinta.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#F57C00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#E65100] hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                  Pesan Tiket Sekarang <ArrowRight size={20} />
                </button>
                <button className="bg-white text-[#0B2F5E] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg">
                  Lihat Semua Promo
                </button>
              </div>
            </div>

            <div className="md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-12">
                  <div className="h-40 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <img
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400"
                      className="w-full h-full object-cover"
                      alt="Beach"
                    />
                  </div>
                  <div className="h-56 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <img
                      src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400"
                      className="w-full h-full object-cover"
                      alt="Mountains"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-56 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400"
                      className="w-full h-full object-cover"
                      alt="Lake"
                    />
                  </div>
                  <div className="h-40 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <img
                      src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400"
                      className="w-full h-full object-cover"
                      alt="Travel"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}