"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Save,
  ImageIcon,
  XCircle,
  Globe,
  Search,
  MapPin,
} from "lucide-react";
import Swal from "sweetalert2";

// Import Komponen Manager Tambahan
import FeatureManager from "@/components/admin/FeatureManager";
import GalleryManager from "@/components/admin/GalleryManager";

// 1. Define Interfaces
interface Category {
  id: number;
  name: string;
}

// Update Interface agar mencakup relasi
interface Destination {
  id: number;
  name: string;
  category_id: number | string;
  description: string;
  price: number | string;
  location: string;
  image_url: string;
  is_active: boolean | number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  // Relasi (Opsional agar tidak error jika null)
  images?: any[];
  inclusions?: any[];
  addons?: any[];
}

interface DestinationForm {
  name: string;
  category_id: number | string;
  description: string;
  price: number | string;
  location: string;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export default function EditDestinationPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const destinationId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // State untuk Data Full (termasuk relasi untuk child components)
  const [fullDestinationData, setFullDestinationData] =
    useState<Destination | null>(null);

  const [initialData, setInitialData] = useState<DestinationForm | null>(null);
  const [formData, setFormData] = useState<DestinationForm>({
    name: "",
    category_id: "",
    description: "",
    price: "",
    location: "",
    is_active: true,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Helper untuk format URL gambar
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    // Bersihkan slash ganda jika ada
    const cleanPath = imageUrl.startsWith("/")
      ? imageUrl.substring(1)
      : imageUrl;
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  // Gunakan useCallback agar bisa dipanggil ulang oleh child component (onUpdate)
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch Categories
      const resCat = await fetch(`${BASE_URL}/api/categories`);
      const jsonCat = await resCat.json();
      setCategories(jsonCat.data || jsonCat);

      // 2. Fetch Destination Detail (ADMIN ENDPOINT)
      const resDest = await fetch(
        `${BASE_URL}/api/admin/destinations/${destinationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resDest.ok) {
        const jsonDest = await resDest.json();
        const data = jsonDest.data;

        // Simpan data lengkap untuk child component
        setFullDestinationData(data);

        // Set Form Data Utama
        const loadedData: DestinationForm = {
          name: data.name,
          category_id: data.category_id,
          description: data.description,
          price: data.price,
          location: data.location,
          is_active: Boolean(Number(data.is_active)), // Handle 1/0 or true/false
          meta_title: data.meta_title ?? "",
          meta_description: data.meta_description ?? "",
          meta_keywords: data.meta_keywords ?? "",
        };

        setFormData(loadedData);
        setInitialData(loadedData);
        setCurrentImage(data.image_url);
      } else {
        Swal.fire("Error", "Data tidak ditemukan!", "error");
        router.push("/admin/destinations");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memuat data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [destinationId, token, router, BASE_URL]);

  useEffect(() => {
    if (destinationId && token) fetchData();
  }, [fetchData, destinationId, token]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, is_active: e.target.checked });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    const isDirty =
      JSON.stringify(formData) !== JSON.stringify(initialData) ||
      newImage !== null;

    if (isDirty) {
      Swal.fire({
        title: "Batalkan Perubahan?",
        text: "Perubahan yang belum disimpan akan hilang!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Buang Perubahan",
        cancelButtonText: "Lanjut Edit",
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
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category_id", String(formData.category_id));
      data.append("description", formData.description);
      data.append("price", String(formData.price));
      data.append("location", formData.location);
      data.append("is_active", formData.is_active ? "1" : "0"); // Ubah ke 1/0 agar lebih universal
      data.append("meta_title", formData.meta_title);
      data.append("meta_description", formData.meta_description);
      data.append("meta_keywords", formData.meta_keywords);

      if (newImage) {
        data.append("image", newImage);
      }

      // Endpoint Update dengan POST (karena FormData dengan file butuh boundary khusus)
      // Di Laravel biasanya pakai _method: PUT jika lewat POST FormData
      //data.append("_method", "PUT");

      const res = await fetch(
        `${BASE_URL}/api/admin/destinations/${destinationId}`,
        {
          method: "POST", // Tetap POST tapi ada _method: PUT di body
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: data,
        }
      );

      const json = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data wisata berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1500,
        });
        // Refresh data agar tampilan sinkron
        //fetchData();
        //setNewImage(null);
        //setImagePreview(null);
        router.push("/admin/destinations");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Update",
          text: json.message || "Terjadi kesalahan validasi.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Network/System Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error Sistem",
        text: "Terjadi kesalahan koneksi ke server.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // STYLE CSS
  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0B2F5E] focus:ring-2 focus:ring-[#0B2F5E]/20 outline-none transition duration-200 text-sm shadow-sm";
  const labelClass =
    "block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wide";

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0B2F5E] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-8 pb-20">
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
            Edit Wisata
          </h1>
          <p className="text-xs text-gray-500">
            Perbarui informasi destinasi wisata.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 0: Status */}
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={handleToggle}
              className="w-5 h-5 accent-[#0B2F5E] cursor-pointer"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-bold text-[#0B2F5E] cursor-pointer select-none"
            >
              Status Wisata:{" "}
              {formData.is_active
                ? "AKTIF (Tampil di Web)"
                : "NON-AKTIF (Disembunyikan)"}
            </label>
          </div>

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
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Kategori</label>
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className={inputClass}
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
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className={`${inputClass} pl-10`}
                  />
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Harga Tiket (Rp)</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Deskripsi Lengkap</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={inputClass}
              ></textarea>
            </div>
          </div>

          {/* SECTION 3: Upload Foto Utama */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-400 rounded-full"></span> Foto
              Utama
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preview Gambar */}
              <div className="border rounded-xl p-2 bg-gray-50 flex items-center justify-center h-48 overflow-hidden relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="New Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : currentImage ? (
                  <img
                    src={getImageUrl(currentImage)}
                    alt="Current"
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon /> <span className="text-xs mt-1">No Image</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                  {imagePreview ? "Gambar Baru" : "Gambar Saat Ini"}
                </span>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition relative overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleImageChange}
                />
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-[#0B2F5E]" />
                </div>
                <p className="text-sm font-bold text-gray-700">Ganti Gambar</p>
                <p className="text-xs text-gray-400 mt-1">
                  Kosongkan jika tidak ingin mengubah
                </p>
              </div>
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
                    value={formData.meta_title}
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
                    value={formData.meta_keywords}
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
                  value={formData.meta_description}
                  className={inputClass}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* TOMBOL AKSI UTAMA */}
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
              disabled={isSubmitting}
              className="bg-[#0B2F5E] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#061A35] transition flex items-center gap-2 disabled:opacity-70 shadow-md text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <Save size={18} /> Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- INTEGRASI FEATURE MANAGER & GALLERY MANAGER --- */}
      {fullDestinationData && (
        <div className="space-y-12 mt-10">
          {/* FEATURE MANAGER (Fasilitas) */}
          <div className="border-t border-gray-200 pt-8 text-gray-800">
            <FeatureManager
              destinationId={fullDestinationData.id}
              inclusions={fullDestinationData.inclusions || []}
              addons={fullDestinationData.addons || []}
              onUpdate={fetchData}
            />
          </div>

          {/* GALLERY MANAGER */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold mb-1 text-[#0B2F5E]">
              Galeri Foto Tambahan
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Foto-foto ini akan muncul di halaman detail (Bento Grid).
            </p>
            <GalleryManager
              destinationId={fullDestinationData.id}
              existingImages={fullDestinationData.images || []}
              onUpdate={fetchData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
