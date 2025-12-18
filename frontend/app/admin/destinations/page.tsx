"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  ImageIcon,
  Loader2,
  MapPin,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

// 1. Definisi Tipe Data
interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface Destination {
  id: number;
  name: string;
  category_id: number;
  description: string;
  price: number;
  location: string;
  image_url: string;
  category?: Category;
}

export default function AdminDestinations() {
  const { token } = useAuth();

  // 2. State Management
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // KONFIGURASI URL (Menggunakan Environment Variable)
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Fetch Data Wisata & Kategori
  async function fetchData() {
    setLoading(true);
    try {
      // Ambil Wisata (Gunakan BASE_URL)
      const resDest = await fetch(`${BASE_URL}/api/destinations?all=true`);
      const jsonDest = await resDest.json();
      setDestinations(jsonDest.data || []);

      // Ambil Kategori (Gunakan BASE_URL)
      const resCat = await fetch(`${BASE_URL}/api/categories`);
      const jsonCat = await resCat.json();
      setCategories(jsonCat.data || jsonCat);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Delete
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data wisata ini akan dihapus permanen! Data yang sudah dipesan user mungkin tidak bisa dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);

    try {
      // Endpoint Delete dengan BASE_URL
      const res = await fetch(`${BASE_URL}/api/admin/destinations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setDestinations((current) => current.filter((item) => item.id !== id));

        Swal.fire({
          title: "Terhapus!",
          text: "Data wisata berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const json = await res.json();
        Swal.fire({
          title: "Gagal!",
          text: json.message || "Terjadi kesalahan pada server.",
          icon: "error",
        });
        // Refresh data jika gagal (untuk memastikan sinkronisasi)
        fetchData();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan koneksi.",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = () => {
    setSearchQuery(keyword);
  };

  // Logika Filter
  const filteredData = destinations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || String(item.category_id) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Helper untuk format URL gambar agar dinamis
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    // Pastikan tidak double slash jika imageUrl diawali slash
    const cleanPath = imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl;
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B2F5E] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* 1. HEADER HALAMAN */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm flex justify-between items-center rounded-lg">
        <div>
          <h1 className="font-bold text-[#0B2F5E] text-xl">Kelola Wisata</h1>
          <p className="text-xs text-gray-500">
            Manajemen data destinasi wisata.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/destinations/create"
            className="bg-[#0B2F5E] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#061A35] transition shadow-md"
          >
            <Plus size={16} /> Tambah Wisata
          </Link>
        </div>
      </div>

      {/* 2. AREA FILTER DAN PENCARIAN */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-2">
        <div className="flex-1 flex items-center gap-2 w-full px-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama wisata atau lokasi..."
            className="flex-1 py-2 outline-none text-sm text-gray-700 placeholder:text-gray-400 font-medium"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#0B2F5E] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#09254A] transition w-full md:w-auto shadow-sm"
        >
          Cari
        </button>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-4 pr-2 w-full md:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 outline-none text-sm text-gray-600 font-medium bg-transparent cursor-pointer min-w-[150px]"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. TABEL DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-200 tracking-wider">
            <tr>
              <th className="px-6 py-4 w-16 text-center">No</th>
              <th className="px-6 py-4 w-24">Gambar</th>
              <th className="px-6 py-4">Nama Destinasi</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Lokasi</th>
              <th className="px-6 py-4">Harga Tiket</th>
              <th className="px-6 py-4 text-center w-40">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <td className="px-6 py-4 align-middle text-center font-bold text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative shrink-0">
                      {item.image_url ? (
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-gray-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <h3 className="font-bold text-[#0B2F5E] text-base">
                      {item.name}
                    </h3>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {item.category?.name || "Umum"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <MapPin size={14} className="text-gray-400" />
                      {item.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="font-bold text-gray-700 text-sm px-3 py-1 rounded-md">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/admin/destinations/edit/${item.id}`}
                        className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition shadow-sm"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className={`p-2 border rounded-lg transition shadow-sm ${
                          deletingId === item.id
                            ? "bg-red-50 border-red-200 cursor-not-allowed"
                            : "bg-white border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                        }`}
                        title="Hapus"
                      >
                        {deletingId === item.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin text-red-600"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="opacity-20" />
                    <p>Tidak ditemukan wisata sesuai filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}