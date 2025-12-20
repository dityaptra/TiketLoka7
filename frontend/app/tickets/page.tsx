"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Ticket,
  Loader2,
  MapPin,
  Search,
  PlusCircle,
  CreditCard,
} from "lucide-react";
import { Booking } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function MyTicketsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const formatIDR = (value: any) => {
    const price = Number(value);
    if (isNaN(price)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (url: string | null) => {
    if (!url)
      return "https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800";
    if (url.startsWith("http")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
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

  // --- LOGIKA DATA TIKET & PENGECEKAN KADALUARSA ---
  const allTickets = useMemo(() => {
    // Ambil tanggal hari ini untuk perbandingan
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.flatMap((booking) =>
      booking.details.map((detail, index) => {
        let selectedAddonIds: any[] = [];
        try {
            selectedAddonIds = Array.isArray(detail.addons) 
                ? detail.addons 
                : JSON.parse(detail.addons as string || "[]");
        } catch (e) { selectedAddonIds = []; }
        
        const selectedIdsString = selectedAddonIds.map(String);
        const availableAddons = detail.destination.addons || [];
        const selectedAddonObjects = availableAddons.filter((addon: any) => 
            selectedIdsString.includes(String(addon.id))
        );

        const dbSubtotal = Number(detail.subtotal);
        const basePrice = Number(detail.price) || Number(detail.destination.price) || 0;
        const quantity = Number(detail.quantity) || 1;
        
        const totalAddonPricePerPax = selectedAddonObjects.reduce((sum: number, addon: any) => 
            sum + Number(addon.price), 0
        );
        const manualCalculatedTotal = (basePrice + totalAddonPricePerPax) * quantity;
        const finalPriceToDisplay = dbSubtotal > 0 ? dbSubtotal : manualCalculatedTotal;

        // Cek apakah tanggal kunjungan sudah lewat hari ini
        const visitDate = new Date(detail.visit_date);
        const isExpired = visitDate < today;

        return {
          ...detail,
          parent_status: booking.status,
          parent_code: booking.booking_code,
          parent_id: booking.id,
          parent_total: booking.grand_total,
          relative_index: index,
          is_expired: isExpired, // Tambahkan properti kadaluarsa
          
          calculated_total: finalPriceToDisplay,
          total_addons_only: (totalAddonPricePerPax * quantity),
          addon_details: selectedAddonObjects.map((a: any) => ({
              name: a.name,
              price: a.price
          }))
        };
      })
    );
  }, [bookings]);

  const filteredTickets = allTickets.filter((ticket) => {
    const status = ticket.parent_status.toLowerCase();
    const isPaid = status === "paid" || status === "success";
    
    let matchesStatus = false;
    if (activeTab === "all") {
      matchesStatus = true;
    } else if (activeTab === "paid") {
      // Hanya tampilkan yang lunas DAN belum lewat tanggalnya
      matchesStatus = isPaid && !ticket.is_expired;
    } else if (activeTab === "expired") {
      // Hanya tampilkan yang lunas TAPI sudah lewat tanggalnya
      matchesStatus = isPaid && ticket.is_expired;
    } else if (activeTab === "pending") {
      matchesStatus = status === "pending";
    } else if (activeTab === "cancelled") {
      matchesStatus = status === "cancelled" || status === "failed";
    }

    const matchesSearch =
      ticket.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.parent_code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const TabButton = ({ id, label, count }: { id: string; label: string; count?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
        activeTab === id
          ? "bg-[#0B2F5E] text-white border-[#0B2F5E] shadow-md"
          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label} {count !== undefined && <span className="ml-1 opacity-70 text-xs">({count})</span>}
    </button>
  );

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />

      <div className="bg-[#0B2F5E] pt-28 pb-16 px-4 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Ticket className="w-8 h-8 text-[#F57C00]" /> Tiket Saya
              </h1>
              <p className="text-blue-100 mt-2 text-sm">Kelola pesanan dan rincian perjalanan wisata Anda.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-blue-200" />
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white/10 text-white placeholder-blue-200 focus:ring-2 focus:ring-[#F57C00] outline-none"
                placeholder="Cari lokasi atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <TabButton id="all" label="Semua" count={allTickets.length} />
            <TabButton id="paid" label="Berhasil" />
            <TabButton id="expired" label="Kadaluarsa" /> {/* Filter Baru */}
            <TabButton id="pending" label="Menunggu" />
            <TabButton id="cancelled" label="Dibatalkan" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-20 relative z-20">
        {loading || authLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[300px]">
            <Loader2 className="animate-spin text-[#F57C00] w-10 h-10 mb-4" />
            <p className="text-gray-500 font-medium">Memuat tiket Anda...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800">Tiket tidak ditemukan</h3>
            <p className="text-gray-400 text-sm mt-1">Coba sesuaikan filter atau cari destinasi lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket, idx) => {
              const status = ticket.parent_status.toLowerCase();
              const isPending = status === "pending";
              const isCancelled = status === "cancelled" || status === "failed";
              const isExpired = ticket.is_expired && (status === "paid" || status === "success");
              
              const priceToDisplay = isPending ? ticket.parent_total : ticket.calculated_total;

              return (
                <Link
                  href={isPending ? `/payment/${ticket.parent_code}` : (isCancelled || isExpired) ? "#" : `/tickets/${ticket.parent_code}?index=${ticket.relative_index}`}
                  key={idx}
                  className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col ${isCancelled || isExpired ? "opacity-75 grayscale-[0.5]" : ""}`}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img src={getImageUrl(ticket.destination.image_url)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border backdrop-blur-md ${
                        isExpired ? 'bg-gray-100 text-gray-600 border-gray-300' :
                        status === 'paid' || status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
                        isPending ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {isExpired ? 'Kadaluarsa' : ticket.parent_status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] text-gray-400 font-mono mb-1">#{ticket.parent_code}</span>
                    <h3 className="font-bold text-[#0B2F5E] text-lg leading-tight mb-3 line-clamp-1 group-hover:text-[#F57C00] transition-colors">
                      {ticket.destination.name}
                    </h3>

                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center text-sm text-gray-600 gap-2.5">
                        <Calendar className="w-4 h-4 text-[#F57C00]" />
                        <span className="font-medium">{ticket.visit_date}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 gap-2.5">
                        <MapPin className="w-4 h-4 text-[#F57C00]" />
                        <span>{ticket.quantity} Tiket</span>
                      </div>

                      {ticket.addon_details.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-dashed border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Add-ons:</p>
                            <div className="flex flex-col gap-1">
                                {ticket.addon_details.map((addon: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <PlusCircle className="w-3 h-3 text-green-600" />
                                            <span className="font-medium">{addon.name}</span>
                                        </div>
                                        <span className="font-bold">+{formatIDR(addon.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400">{isPending ? "Total Tagihan" : "Total Dibayar"}</span>
                        <span className="font-bold text-[#0B2F5E] text-sm">{formatIDR(priceToDisplay)}</span>
                      </div>
                      {isPending ? (
                        <span className="px-4 py-2 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                           <CreditCard className="w-3.5 h-3.5" /> Bayar
                        </span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-300" />
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