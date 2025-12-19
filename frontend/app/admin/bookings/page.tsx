"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, RefreshCcw, Clock, X, Search, Filter } from "lucide-react";

// Tipe Data
interface Booking {
  id: number;
  booking_code: string;
  grand_total: number;
  status: string;
  created_at: string;
  user: { name: string; email: string };
  details: {
    destination: { name: string };
    quantity: number;
  }[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // STATE FILTER
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // State baru untuk filter status
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const url = new URL(`${baseURL}/api/admin/bookings`);

      // Query Params
      url.searchParams.append("page", page.toString());
      url.searchParams.append("per_page", "10");
      if (startDate) url.searchParams.append("start_date", startDate);
      if (endDate) url.searchParams.append("end_date", endDate);
      if (search) url.searchParams.append("search", search);
      if (status) url.searchParams.append("status", status); // Tambahkan status ke API

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();

      if (json && json.data) {
        setBookings(json.data);
        setMeta({
          current_page: json.current_page,
          last_page: json.last_page,
          total: json.total,
          from: json.from,
          to: json.to,
          per_page: json.per_page
        });
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, search, status, token]); // Tambahkan status ke deps

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2F5E]">Riwayat Transaksi</h2>
          <p className="text-sm text-gray-500">Pantau dan kelola data pemesanan tiket masuk.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status Dropdown */}
          <div className="relative flex items-center bg-white border rounded-xl px-3 shadow-sm focus-within:ring-2 focus-within:ring-[#0B2F5E]">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select 
              className="py-2 bg-transparent text-sm text-gray-600 outline-none cursor-pointer min-w-[120px]"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">Semua Status</option>
              <option value="paid">Lunas (Paid)</option>
              <option value="pending">Menunggu</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" /> {/* Icon juga saya gelapkan sedikit */}
    <input 
      type="text" 
      placeholder="Cari user/kode..." 
      // 👇 PERUBAHAN ADA DI SINI (text-gray-800 & placeholder:text-gray-500)
      className="pl-9 pr-4 py-2 border rounded-xl text-sm text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0B2F5E] outline-none w-full md:w-48 shadow-sm"
      value={search}
      onChange={(e) => {setSearch(e.target.value); setPage(1);}}
    />
</div>

          {/* Date Picker Range */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            <Clock size={16} className="text-gray-400 ml-1" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="text-xs border-none outline-none text-gray-600 bg-transparent"
            />
            <span className="text-gray-300">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="text-xs border-none outline-none text-gray-600 bg-transparent"
            />
            {(startDate || endDate || search || status) && (
              <button onClick={handleReset} className="p-1 text-red-500 hover:bg-red-50 rounded-full transition">
                <X size={16} />
              </button>
            )}
            <button onClick={fetchBookings} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full border-l pl-2 ml-1" title="Muat Ulang">
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#F57C00] w-10 h-10" />
            <p className="text-gray-400 text-sm font-medium">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-100 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center">No</th>
                  <th className="px-6 py-4">Kode</th>
                  <th className="px-6 py-4">Destinasi</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.length > 0 ? (
                  bookings.map((item, index) => {
                    const rowNumber = meta ? (meta.current_page - 1) * meta.per_page + (index + 1) : index + 1;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-center text-gray-400 font-medium">{rowNumber}</td>
                        <td className="px-6 py-4 font-mono font-bold text-[#0B2F5E]">{item.booking_code}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{item.details?.[0]?.destination?.name || "-"}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{item.user.name}</div>
                          <div className="text-[10px] text-gray-400">{item.user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold text-xs">
                            {item.details?.reduce((acc, curr) => acc + curr.quantity, 0)} Orang
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-600">Rp {Number(item.grand_total).toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-20">
                      <div className="flex flex-col items-center opacity-40">
                         <X size={40} />
                         <p className="mt-2 font-bold">Tidak ada data ditemukan</p>
                         <button onClick={handleReset} className="text-[#0B2F5E] text-xs underline mt-1">Reset Semua Filter</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
          <span className="text-xs text-gray-400 font-medium">Data {meta.from} - {meta.to} dari {meta.total}</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold disabled:opacity-30 border hover:bg-gray-100 transition-colors">Prev</button>
            <span className="px-4 py-1.5 bg-[#0B2F5E] text-white rounded-lg text-xs font-bold flex items-center justify-center">
              Halaman {page} dari {meta.last_page}
            </span>
            <button disabled={page === meta.last_page} onClick={() => setPage(page + 1)} className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold disabled:opacity-30 border hover:bg-gray-100 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    success: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const labels: Record<string, string> = {
    paid: "Lunas",
    success: "Lunas",
    pending: "Menunggu",
    failed: "Gagal",
    cancelled: "Batal",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${colors[s] || "bg-gray-100 text-gray-500"}`}>
      {labels[s] || status}
    </span>
  );
}