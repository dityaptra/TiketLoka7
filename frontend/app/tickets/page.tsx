"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Ticket,
  Loader2,
  AlertCircle,
  MapPin,
  Hash,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import { Booking } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function MyTicketsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter & Search
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- PERBAIKAN 1: Format Rupiah yang Aman ---
  const formatIDR = (value: any) => {
    const price = Number(value); // Paksa ubah ke number
    if (isNaN(price)) return "Rp 0"; // Jika gagal, kembalikan 0
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper URL Gambar
  const getImageUrl = (url: string | null) => {
    if (!url)
      return "https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800";
    if (url.startsWith("http")) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchBookings = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/my-bookings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (res.ok) {
          setBookings(json.data);
        } else {
          console.error("Gagal ambil tiket:", json.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token, authLoading, BASE_URL]);

  // Flattening Data Tiket
  const allTickets = useMemo(() => {
    return bookings.flatMap((booking) =>
      booking.details.map((detail, index) => ({
        ...detail,
        parent_status: booking.status,
        parent_code: booking.booking_code,
        parent_id: booking.id,
        parent_total: booking.grand_total,
        relative_index: index,
      }))
    );
  }, [bookings]);

  // Logika Filter
  const filteredTickets = allTickets.filter((ticket) => {
    const status = ticket.parent_status.toLowerCase();
    
    // Filter by Tab
    let matchesStatus = false;
    if (activeTab === "all") matchesStatus = true;
    else if (activeTab === "paid") matchesStatus = status === "paid" || status === "success";
    else if (activeTab === "pending") matchesStatus = status === "pending";
    else if (activeTab === "cancelled") matchesStatus = status === "cancelled" || status === "failed";

    // Filter by Search
    const matchesSearch =
      ticket.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.parent_code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const TabButton = ({
    id,
    label,
    count,
  }: {
    id: string;
    label: string;
    count?: number;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
        activeTab === id
          ? "bg-[#0B2F5E] text-white border-[#0B2F5E] shadow-md transform scale-105"
          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}{" "}
      {count !== undefined && (
        <span className="ml-1 opacity-70 text-xs">({count})</span>
      )}
    </button>
  );

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-[#0B2F5E] pt-28 pb-16 px-4 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#F57C00] opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Ticket className="w-8 h-8 text-[#F57C00]" />
                Tiket Saya
              </h1>
              <p className="text-blue-100 mt-2 text-sm md:text-base">
                Kelola semua petualangan dan perjalanan wisata Anda di sini.
              </p>
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-blue-200" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-[#F57C00] transition-all sm:text-sm shadow-inner"
                placeholder="Cari lokasi atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          {!loading && token && (
            <div className="flex flex-wrap gap-2">
              <TabButton id="all" label="Semua" count={allTickets.length} />
              <TabButton id="paid" label="Berhasil" /> 
              <TabButton id="pending" label="Menunggu" />
              <TabButton id="cancelled" label="Dibatalkan" />
            </div>
          )}
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-20 relative z-20">
        {loading || authLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[300px]">
            <Loader2 className="animate-spin text-[#F57C00] w-10 h-10 mb-4" />
            <p className="text-gray-500 font-medium">Memuat tiket Anda...</p>
          </div>
        ) : !token ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-3xl shadow-sm p-8 border border-gray-100 max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#F57C00]" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Akses Dibatasi
            </h3>
            <p className="font-medium text-gray-500 mb-6">
              Silakan login terlebih dahulu untuk melihat riwayat tiket Anda.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#0B2F5E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#09254A] transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Login Sekarang <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              {searchQuery ? (
                <Search className="w-8 h-8 text-gray-400" />
              ) : (
                <Ticket className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {searchQuery ? "Tiket tidak ditemukan" : "Belum ada tiket"}
            </h3>
            <p className="text-gray-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `Tidak ada hasil untuk pencarian "${searchQuery}"`
                : "Anda belum memesan tiket wisata apapun. Yuk mulai petualanganmu!"}
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="mt-6 inline-block bg-[#F57C00] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition hover:-translate-y-0.5"
              >
                Cari Wisata
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket, idx) => {
              // --- LOGIKA STATUS WARNA ---
              const status = ticket.parent_status.toLowerCase();
              let statusColor = "bg-gray-100 text-gray-600 border-gray-200";
              let StatusIcon = Clock;

              if (status === "success" || status === "paid") {
                statusColor = "bg-green-50 text-green-700 border-green-200";
                StatusIcon = CheckCircle2;
              } else if (status === "pending") {
                statusColor = "bg-orange-50 text-orange-700 border-orange-200";
                StatusIcon = Clock;
              } else if (status === "cancelled" || status === "failed") {
                statusColor = "bg-red-50 text-red-700 border-red-200";
                StatusIcon = XCircle;
              }

              const isPending = status === "pending";
              const isCancelled = status === "cancelled" || status === "failed";

              const targetUrl = isPending
                ? `/payment/${ticket.parent_code}`
                : isCancelled
                ? "#"
                : `/tickets/${ticket.parent_code}?index=${ticket.relative_index}`;

              // --- PERBAIKAN 2: Kalkulasi Aman (Mencegah NaN) ---
              // Mengonversi ke Number() sebelum dikalikan. Jika null/undefined, jadi 0.
              // Coba ambil dari ticket.price dulu, kalau 0 ambil dari ticket.destination.price
              const priceSafe = Number(ticket.price) || Number(ticket.destination?.price) || 0;
              const qtySafe = Number(ticket.quantity) || 0;
              const totalPrice = priceSafe * qtySafe;

              return (
                <Link
                  href={targetUrl}
                  key={`${ticket.parent_id}-${ticket.id}-${idx}`}
                  className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${
                    isPending ? "hover:border-orange-300" : "hover:border-blue-100"
                  } ${isCancelled ? "opacity-75 grayscale-[0.5]" : ""}`}
                  onClick={(e) => {
                      if(isCancelled) e.preventDefault();
                  }}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={getImageUrl(ticket.destination.image_url)}
                      alt={ticket.destination.name}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border flex items-center gap-1.5 backdrop-blur-md shadow-sm ${statusColor}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {ticket.parent_status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Hash className="w-3 h-3" /> {ticket.parent_code}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#0B2F5E] text-lg leading-tight mb-3 line-clamp-2 group-hover:text-[#F57C00] transition-colors">
                      {ticket.destination.name}
                    </h3>

                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center text-sm text-gray-600 gap-2.5">
                        <Calendar className="w-4 h-4 text-[#F57C00]" />
                        <span className="font-medium">{ticket.visit_date}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 gap-2.5">
                        <MapPin className="w-4 h-4 text-[#F57C00]" />
                        <span>{ticket.quantity} Orang</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">
                          {isPending ? "Total Tagihan" : "Total Harga"}
                        </span>
                        <span className="font-bold text-[#0B2F5E] text-sm">
                          {/* --- GUNAKAN VARIABLE totalPrice YANG AMAN --- */}
                          {formatIDR(totalPrice)}
                        </span>
                      </div>
                      
                      {/* Tombol Action */}
                      {isPending ? (
                        <span className="px-4 py-2 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                           <CreditCard className="w-3.5 h-3.5" /> Bayar
                        </span>
                      ) : isCancelled ? (
                          <span className="text-xs text-gray-400 font-medium italic">Pesanan Dibatalkan</span>
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0B2F5E] group-hover:bg-[#F57C00] group-hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}