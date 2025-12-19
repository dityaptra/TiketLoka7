'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  Ticket, 
  CreditCard, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

// Data FAQ Statis
const faqList = [
  {
    category: 'Pemesanan Tiket',
    icon: <Ticket className="text-white" size={20} />, // Icon styling diubah di render
    color: 'bg-orange-500',
    items: [
      {
        q: 'Bagaimana cara memesan tiket di TiketLoka?',
        a: 'Cari destinasi yang Anda inginkan, pilih tanggal kunjungan, tentukan jumlah tiket, lalu klik tombol "Pesan". Isi data diri dan lanjutkan ke pembayaran.'
      },
      {
        q: 'Apakah saya perlu mencetak tiket?',
        a: 'Tidak perlu. Setelah pembayaran berhasil, E-Ticket akan dikirim ke email Anda. Cukup tunjukkan QR Code pada E-Ticket tersebut kepada petugas di lokasi wisata.'
      }
    ]
  },
  {
    category: 'Pembayaran',
    icon: <CreditCard className="text-white" size={20} />,
    color: 'bg-blue-600',
    items: [
      {
        q: 'Metode pembayaran apa saja yang tersedia?',
        a: 'Kami menerima pembayaran melalui Transfer Bank (BCA, Mandiri, BRI), E-Wallet (GoPay, OVO, Dana), dan QRIS.'
      },
      {
        q: 'Berapa batas waktu pembayaran?',
        a: 'Batas waktu pembayaran bervariasi tergantung metode yang dipilih, biasanya antara 1 hingga 24 jam.'
      }
    ]
  },
  {
    category: 'Kendala & Refund',
    icon: <AlertCircle className="text-white" size={20} />,
    color: 'bg-red-500',
    items: [
      {
        q: 'Apakah tiket bisa di-refund (dibatalkan)?',
        a: 'Kebijakan refund bergantung pada masing-masing tempat wisata. Umumnya, refund dapat diajukan maksimal H-1 kunjungan melalui menu "Pesanan Saya".'
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar />
      {/* 1. HERO SECTION */}
      <div className="bg-[#0B2F5E] pt-28 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-medium mb-6 border border-white/10 backdrop-blur-sm">
            <HelpCircle size={14} /> Pusat Bantuan TiketLoka
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Ada yang bisa<span className="text-[#FFA726]"> kami bantu?</span>
          </h1>
          
          {/* SEARCH BAR IMPROVED */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-orange-500 transition-colors" size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Cari kendala Anda (contoh: e-ticket, refund)..." 
              className="w-full py-5 pl-14 pr-6 rounded-2xl text-gray-800 bg-white shadow-2xl shadow-blue-900/20 border border-transparent focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base md:text-lg"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
               <button className="bg-[#0B2F5E] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-900 transition">Cari</button>
            </div>
          </div>
        </div>
      </div>

      {/* WRAPPER KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto px-6 mt-8 relative z-20 pb-24">

        {/* 3. FAQ SECTION */}
        <div className="max-w-3xl mx-auto">
            
            <div className="space-y-8">
            {faqList.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-4 pl-1">
                    <div className={`p-2 rounded-lg shadow-sm ${section.color}`}>
                      {section.icon}
                    </div>
                    <h3 className="font-bold text-xl text-gray-800">{section.category}</h3>
                  </div>
                  
                  {/* Accordion Items */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {section.items.map((item, idx) => {
                    const uniqueId = `${sectionIdx}-${idx}`;
                    const isOpen = openIndex === uniqueId;

                    return (
                        <div key={idx} className="group">
                        <button 
                            onClick={() => toggleAccordion(uniqueId)}
                            className={`w-full px-6 py-5 flex justify-between items-start text-left hover:bg-gray-50/80 transition-colors focus:outline-none cursor-pointer`}
                        >
                            <span className={`text-[15px] font-medium leading-relaxed pr-4 transition-colors ${isOpen ? 'text-[#0B2F5E] font-bold' : 'text-gray-700'}`}>
                            {item.q}
                            </span>
                            <span className={`flex-shrink-0 mt-1 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                                <ChevronDown size={18} className={`${isOpen ? 'text-orange-500' : 'text-gray-400'}`} />
                            </span>
                        </button>
                        
                        {/* Konten Jawaban */}
                        <div 
                            className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}
                        >
                            <div className="text-gray-600 leading-7 text-[15px] pl-0 md:pl-0 border-t border-dashed border-gray-100 pt-4">
                                {item.a}
                            </div>
                        </div>
                        </div>
                    );
                    })}
                  </div>
                </div>
            ))}
            </div>
        </div>

        {/* 4. FOOTER CTA */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-[#0B2F5E] to-[#14427D] rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Masih belum menemukan jawaban?</h3>
                  <p className="text-blue-100 mb-8 text-lg leading-relaxed">Jangan ragu untuk menghubungi tim support kami. Kami siap membantu liburan Anda menjadi pengalaman tak terlupakan.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        href="/" 
                        className="inline-flex items-center justify-center bg-[#F57C00] text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 transition-all duration-300"
                    >
                        Jelajahi Wisata
                    </Link>
                    <Link 
                        href="/contact" 
                        className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-3.5 rounded-full font-bold hover:bg-white hover:text-[#0B2F5E] transition-all duration-300"
                    >
                        Hubungi Kami
                    </Link>
                  </div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}