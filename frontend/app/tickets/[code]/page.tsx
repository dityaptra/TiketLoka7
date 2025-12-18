"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Booking } from "@/types";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Download,
  Printer,
  Ticket,
  User,
  Copy,
  Check,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil index tiket dari URL (misal: ?index=1 untuk tiket kedua)
  const ticketIndex = parseInt(searchParams.get("index") || "0");
  
  const { token, isLoading: authLoading } = useAuth();
  const bookingCode = params.code as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const getImageUrl = (url: string | null) => {
    if (!url) return "https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800";
    if (url.startsWith("http")) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };

  const handleCopyCode = (code: string) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => { setIsCopied(false); }, 2000);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.push("/login"); return; }
    if (!bookingCode) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/bookings/${bookingCode}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (res.ok) { setBooking(json.data); } 
        else { 
            console.error(json.message);
            if (res.status === 401) router.push("/login");
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };

    fetchDetail();
  }, [bookingCode, token, authLoading, router, BASE_URL]);

  if (loading || authLoading)
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0B2F5E] rounded-full animate-spin"></div>
      </div>
    );

  if (!booking) return null;

  // --- AMBIL DETAIL SPESIFIK BERDASARKAN INDEX ---
  // Jika tiket ke-2 dibeli, maka detail diambil dari array index ke-1
  const detail = booking.details[ticketIndex] || booking.details[0];
  
  // Gunakan Ticket Code jika ada (unik), jika tidak fallback ke Booking Code
  const displayCode = detail.ticket_code || booking.booking_code;
  const bgPageColor = "bg-[#F5F6F8]";

  return (
    <main className={`min-h-screen ${bgPageColor} pb-20 font-sans text-gray-800`}>
      {/* --- NAVBAR --- */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tickets" className="hover:bg-gray-100 p-2 rounded-full transition text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-lg text-[#0B2F5E]">E-Ticket</h1>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium transition">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 md:mt-12">
        <div className="relative w-full max-w-4xl mx-auto drop-shadow-2xl">
          <div className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden">
            
            {/* === KIRI: DETAIL === */}
            <div className="flex-1 relative">
              <div className="bg-[#0B2F5E] p-6 text-white flex justify-between items-start relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                <div>
                  <div className="flex items-center gap-2 opacity-90 mb-1">
                    <Ticket className="w-4 h-4" />
                    <span className="text-xs font-medium tracking-widest uppercase">General Admission</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold leading-tight max-w-md">{detail.destination.name}</h2>
                </div>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl p-1 shadow-lg shrink-0 ml-4">
                  <img src={getImageUrl(detail.destination.image_url)} alt="Destinasi" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tanggal Kunjungan</p>
                    <div className="flex items-center gap-2 text-[#0B2F5E] font-bold">
                      <Calendar className="w-4 h-4 text-[#F57C00]" /><span>{formatDate(detail.visit_date)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Jumlah Pax</p>
                    <div className="flex items-center gap-2 text-[#0B2F5E] font-bold">
                      <User className="w-4 h-4 text-[#F57C00]" />
                      {/* Tampilkan 1 Orang karena ini tiket per individu (hasil pecahan) */}
                      <span>{detail.quantity} Orang</span> 
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Lokasi</p>
                    <div className="flex items-start gap-2 text-gray-700 font-medium">
                      <MapPin className="w-4 h-4 text-[#F57C00] mt-0.5 shrink-0" /><span>{detail.destination.location}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <div><p className="text-xs text-gray-400">Dipesan Oleh</p><p className="font-bold text-gray-800">{booking.user.name}</p></div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">LUNAS</div>
                </div>
              </div>
              <div className="px-6 pb-6 md:px-8 md:pb-8"><p className="text-[10px] text-gray-400 text-center md:text-left">* Tunjukkan tiket ini di loket masuk.<br />* Tiket yang sudah dipindai tidak dapat digunakan kembali.</p></div>
            </div>

            {/* === TENGAH: GARIS POTONG === */}
            <div className="relative md:w-0 w-full md:h-auto h-0 md:border-l-2 border-t-2 border-dashed border-gray-300 flex-shrink-0">
              <div className={`absolute w-8 h-8 rounded-full ${bgPageColor} top-1/2 -left-4 -translate-y-1/2 md:left-1/2 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2 shadow-inner box-border z-10`}></div>
              <div className={`absolute w-8 h-8 rounded-full ${bgPageColor} top-1/2 -right-4 -translate-y-1/2 md:left-1/2 md:bottom-0 md:-translate-x-1/2 md:translate-y-1/2 shadow-inner box-border z-10`}></div>
            </div>

            {/* === KANAN: QR CODE === */}
            <div className="md:w-80 w-full bg-gray-50 flex flex-col items-center justify-center p-8 relative">
              <h3 className="text-[#0B2F5E] font-bold mb-4 tracking-widest text-sm uppercase">Scan Here</h3>

              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-4">
                {/* Gunakan displayCode (kode unik tiket) untuk QR */}
                <QRCodeSVG value={displayCode} size={140} level={"H"} />
              </div>

              <div className="text-center w-full">
                <p className="text-xs text-gray-400 mb-1 uppercase">Ticket Code</p>
                <div 
                    className={`flex items-center justify-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-pointer transition group select-none ${isCopied ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-blue-300"}`}
                    onClick={() => handleCopyCode(displayCode)}
                >
                  <span className={`font-mono text-lg font-bold tracking-wider ${isCopied ? "text-green-600" : "text-[#0B2F5E]"}`}>
                    {displayCode}
                  </span>
                  {isCopied ? <Check className="w-4 h-4 text-green-600 scale-110" /> : <Copy className="w-3 h-3 text-gray-400 group-hover:text-[#F57C00]" />}
                </div>
                <p className={`text-[10px] mt-1 transition-all h-4 ${isCopied ? "text-green-600 opacity-100" : "opacity-0"}`}>Berhasil disalin!</p>
              </div>

              <div className="mt-4">
                <Image src="/images/logonama3.png" alt="Logo" width={150} height={45} className="opacity-50 transition opacity-100" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button className="flex items-center gap-2 bg-[#F57C00] hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition transform hover:-translate-y-1">
              <Download className="w-5 h-5" /> Download E-Tiket (PDF)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}