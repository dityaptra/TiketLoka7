import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import { MapPin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* --- BAGIAN ATAS (Main Content) --- */}
        {/* Menggunakan grid-cols-3: Logo (2 bagian) + Kontak (1 bagian) agar lebih seimbang */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16 mb-12">
          
          {/* KOLOM KIRI: Brand & Sosmed (Mengambil 2 kolom di layar besar) */}
          <div className="space-y-6 lg:col-span-2">
            <div className="relative h-14 w-52">
              <Image
                src="/images/logonama3.png"
                alt="TiketLoka Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            
            {/* Max-width ditambahkan agar teks tidak terlalu panjang ke kanan */}
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Platform pemesanan tiket wisata termudah dan terpercaya. Temukan
              destinasi impianmu bersama TiketLoka.
            </p>

            <div className="flex gap-4">
              <SocialLink href="#" icon={<FaInstagram size={20} />} />
              <SocialLink href="#" icon={<FaFacebookF size={18} />} />
              <SocialLink href="#" icon={<FaYoutube size={20} />} />
            </div>
          </div>

          {/* KOLOM KANAN: Kontak */}
          <div className="lg:pl-8"> 
            <h3 className="text-[#0B2F5E] font-bold text-lg mb-6">
              Hubungi Kami
            </h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3 group">
                <div className="p-2 bg-[#F57C00] rounded-full shrink-0 transition-colors duration-300">
                    <MapPin className="w-4 h-4 text-white transition-colors duration-300"/>
                </div>
                <span className="leading-relaxed mt-1">
                  Jl. Udayana No.11,
                  <br />
                  Kabupaten Buleleng, Bali, 81116
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 bg-[#F57C00] rounded-full shrink-0 transition-colors duration-300">
                    <Mail className="w-4 h-4 text-white transition-colors duration-300"/>
                </div>
                <span className="mt-0.5">tiketloka25@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- BAGIAN BAWAH (Copyright) --- */}
        <div className="border-t border-gray-300 pt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
            &copy; {currentYear} TiketLoka. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-xs md:text-sm text-gray-400 font-medium">
            <Link href="/privacy" className="hover:text-[#F57C00] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#F57C00] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Komponen Kecil untuk Social Link
function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-[#0B2F5E] hover:bg-[#F57C00] hover:text-white transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
    >
      {icon}
    </Link>
  );
}