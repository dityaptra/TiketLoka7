"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Loader2,
  Save,
  XCircle,
  Search,
  Globe,
  ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";

// 1. Define Category Interface
interface Category {
  id: number;
  name: string;
}

export default function CreateDestinationPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    location: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // Menggunakan BASE_URL untuk fetch kategori
    fetch(`${BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((json) => setCategories(json.data || json))
      .catch((err) => console.error("Gagal ambil kategori:", err));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    const isFormDirty =
      formData.name !== "" ||
      formData.description !== "" ||
      formData.price !== "" ||
      formData.location !== "" ||
      image !== null;

    if (isFormDirty) {
      Swal.fire({
        title: "Batalkan Pembuatan?",
        text: "Data yang sudah Anda isi akan hilang dan tidak tersimpan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Buang Data",
        cancelButtonText: "Lanjut Mengisi",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/admin/destinations");
        }
      });
    } else {
      router.push("/admin/destinations");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!image) {
      Swal.fire({
        icon: "warning",
        title: "Gambar Belum Diupload",
        text: "Wajib mengupload gambar wisata!",
        confirmButtonColor: "#F57C00",
      });
      setIsLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category_id", formData.category_id);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("location", formData.location);
      data.append("image", image);
      data.append("meta_title", formData.meta_title);
      data.append("meta_description", formData.meta_description);
      data.append("meta_keywords", formData.meta_keywords);

      // Menggunakan BASE_URL untuk submit data
      const res = await fetch(`${BASE_URL}/api/admin/destinations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          // Jangan set Content-Type secara manual saat upload file (FormData)
        },
        body: data,
      });

      const json = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Wisata baru berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1500,
        });
        router.push("/admin/destinations");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: json.message || "Cek kembali data yang Anda masukkan.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error Sistem",
        text: "Terjadi kesalahan koneksi ke server.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // STYLE INPUT
  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#0B2F5E] focus:ring-1 focus:ring-[#0B2F5E] outline-none transition-all text-sm shadow-sm";
  const labelClass =
    "block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide";

  return (
    <div className="space-y-6">
      {/* HEADER NAV */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm flex items-center gap-4 rounded-lg">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-[#0B2F5E]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-[#0B2F5E] text-lg leading-tight">
            Tambah Wisata Baru
          </h1>
          <p className="text-xs text-gray-500">
            Isi formulir lengkap untuk menambahkan destinasi.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Informasi Dasar */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#0B2F5E] rounded-full"></span>{" "}
              Informasi Utama
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nama Destinasi</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Pantai Kuta"
                  className={inputClass}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Kategori</label>
                <select
                  name="category_id"
                  required
                  className={inputClass}
                  onChange={handleChange}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Pilih Kategori
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Detail & Harga */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#F57C00] rounded-full"></span> Detail
              & Lokasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>Lokasi</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="Contoh: Badung, Bali"
                  className={inputClass}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Harga Tiket (Rp)</label>
                <input
                  type="number"
                  name="price"
                  required
                  placeholder="50000"
                  className={inputClass}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Deskripsi Lengkap</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Jelaskan keindahan wisata ini..."
                className={inputClass}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* SECTION 3: Upload Foto */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-400 rounded-full"></span> Foto
              Galeri
            </h3>
            <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition relative overflow-hidden group min-h-[200px]">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-contain absolute inset-0 p-2 max-h-[300px]"
                />
              ) : (
                <>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-200 transition group-hover:scale-110">
                    <ImageIcon className="w-6 h-6 text-[#0B2F5E]" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">
                    Klik untuk upload gambar
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Format: JPG, PNG, WEBP (Max 2MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* SECTION 4: Konfigurasi SEO */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded-full"></span>{" "}
              Konfigurasi SEO
            </h3>
            <div className="space-y-6 bg-purple-50/30 p-6 rounded-xl border border-purple-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    <Globe size={12} className="inline mr-1" /> Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    placeholder="Judul untuk Google Search"
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Search size={12} className="inline mr-1" /> Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    placeholder="wisata bali, pantai kuta, liburan"
                    className={inputClass}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea
                  name="meta_description"
                  rows={3}
                  placeholder="Deskripsi singkat yang muncul di hasil pencarian Google..."
                  className={inputClass}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* TOMBOL AKSI */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2 text-sm"
            >
              <XCircle size={18} /> Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0B2F5E] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#061A35] transition flex items-center gap-2 disabled:opacity-70 shadow-md text-sm"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <Save size={18} /> Simpan Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}