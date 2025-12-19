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
  Plus,
  Trash2,
  Check,
  Tag,
  Upload,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

// --- INTERFACES ---
interface Category {
  id: number;
  name: string;
}

interface LocalAddon {
  name: string;
  price: string;
}

export default function CreateDestinationPage() {
  const router = useRouter();
  const { token } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // --- STATE DATA UTAMA ---
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

  // --- STATE FITUR TAMBAHAN (LOKAL) ---
  // 1. Inclusions (Hijau)
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [newInclusion, setNewInclusion] = useState("");

  // 2. Add-ons (Oranye)
  const [addons, setAddons] = useState<LocalAddon[]>([]);
  const [newAddon, setNewAddon] = useState<LocalAddon>({ name: "", price: "" });

  // 3. Galeri Foto (Multiple)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // --- FETCH KATEGORI ---
  useEffect(() => {
    fetch(`${BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((json) => setCategories(json.data || json))
      .catch((err) => console.error("Gagal ambil kategori:", err));
  }, []);

  // --- HANDLERS UTAMA ---
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

  // --- HANDLERS INCLUSIONS ---
  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    setInclusions([...inclusions, newInclusion]);
    setNewInclusion("");
  };
  const handleDeleteInclusion = (index: number) => {
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  // --- HANDLERS ADD-ONS ---
  const handleAddAddon = () => {
    if (!newAddon.name || !newAddon.price) {
      Swal.fire("Gagal", "Nama dan Harga wajib diisi", "warning");
      return;
    }
    setAddons([...addons, newAddon]);
    setNewAddon({ name: "", price: "" });
  };
  const handleDeleteAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  // --- HANDLERS GALERI ---
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));

      setGalleryFiles([...galleryFiles, ...filesArray]);
      setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    }
  };
  const handleRemoveGallery = (index: number) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!image) {
      Swal.fire("Warning", "Foto utama wajib diupload!", "warning");
      setIsLoading(false);
      return;
    }

    try {
      // 1. CREATE MAIN DESTINATION
      const mainData = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        mainData.append(key, value)
      );
      mainData.append("image", image);

      const resMain = await fetch(`${BASE_URL}/api/admin/destinations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // No Content-Type for FormData
        body: mainData,
      });

      const jsonMain = await resMain.json();
      if (!resMain.ok) throw new Error(jsonMain.message || "Gagal buat wisata");

      const newId = jsonMain.data.id;

      // 2. UPLOAD INCLUSIONS (Parallel)
      if (inclusions.length > 0) {
        await Promise.all(
          inclusions.map((name) =>
            fetch(`${BASE_URL}/api/admin/destinations/${newId}/inclusions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ name }),
            })
          )
        );
      }

      // 3. UPLOAD ADDONS (Parallel)
      if (addons.length > 0) {
        await Promise.all(
          addons.map((ad) =>
            fetch(`${BASE_URL}/api/admin/destinations/${newId}/addons`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ name: ad.name, price: ad.price }),
            })
          )
        );
      }

      // 4. UPLOAD GALLERY (Batch Upload)
      if (galleryFiles.length > 0) {
        const galleryData = new FormData();
        galleryFiles.forEach((file) => galleryData.append("images[]", file));

        await fetch(`${BASE_URL}/api/admin/destinations/${newId}/gallery`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: galleryData,
        });
      }

      // FINISH
      await Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: "Wisata lengkap berhasil dibuat.",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/admin/destinations");
    } catch (error: any) {
      console.error(error);
      Swal.fire("Error", error.message || "Terjadi kesalahan server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // STYLE HELPERS
  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:border-[#0B2F5E] focus:ring-1 focus:ring-[#0B2F5E] outline-none transition-all text-sm shadow-sm";
  const labelClass =
    "block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide";

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 shadow-sm flex items-center gap-4 rounded-lg">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-[#0B2F5E] text-lg">
            Tambah Wisata Baru
          </h1>
          <p className="text-xs text-gray-500">Buat destinasi beserta fasilitas & galeri.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* 1. INFORMASI UTAMA */}
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
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Lokasi</label>
                <input
                  type="text"
                  name="location"
                  required
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
                  className={inputClass}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className={labelClass}>Deskripsi Lengkap</label>
              <textarea
                name="description"
                required
                rows={4}
                className={inputClass}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* 2. FOTO UTAMA */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-400 rounded-full"></span> Foto Utama
            </h3>
            <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 relative h-64 overflow-hidden">
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
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                  <span className="text-sm font-bold text-gray-600">Upload Foto Sampul</span>
                </>
              )}
            </div>
          </div>

          {/* 3. SEO CONFIG */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded-full"></span> SEO (Opsional)
            </h3>
            <div className="bg-purple-50/30 p-6 rounded-xl border border-purple-100 grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}><Globe size={12} className="inline mr-1"/> Meta Title</label>
                <input type="text" name="meta_title" className={inputClass} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}><Search size={12} className="inline mr-1"/> Keywords</label>
                <input type="text" name="meta_keywords" className={inputClass} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Meta Description</label>
                <textarea name="meta_description" rows={2} className={inputClass} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>

          {/* --- FITUR TAMBAHAN (Sesuai Screenshot) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
            
            {/* 4. INCLUSIONS (HIJAU) */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" /> Termasuk Paket (Inclusions)
              </h3>
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Misal: Minuman Gratis"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddInclusion}
                    className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {inclusions.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada item.</p>}
                  {inclusions.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                      <span className="text-sm font-medium text-gray-700">{item}</span>
                      <button type="button" onClick={() => handleDeleteInclusion(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. ADD-ONS (ORANYE) */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" /> Add-on Berbayar
              </h3>
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Nama Add-on"
                    value={newAddon.name}
                    onChange={(e) => setNewAddon({...newAddon, name: e.target.value})}
                    className={`${inputClass} flex-[2]`}
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    value={newAddon.price}
                    onChange={(e) => setNewAddon({...newAddon, price: e.target.value})}
                    className={`${inputClass} flex-[1]`}
                  />
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {addons.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada add-on.</p>}
                  {addons.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                        <p className="text-xs text-orange-600 font-medium">+ Rp {Number(item.price).toLocaleString('id-ID')}</p>
                      </div>
                      <button type="button" onClick={() => handleDeleteAddon(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 6. GALERI FOTO (BIRU) */}
          <div className="pt-4 border-t border-gray-100">
             <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" /> Galeri Foto Tambahan
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Tombol Upload Multiple */}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500 transition cursor-pointer relative">
                    <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleGalleryChange} />
                    <Upload size={24} />
                    <span className="text-xs font-bold mt-2">Tambah Foto</span>
                </div>

                {/* Preview List */}
                {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={src} alt="Gallery" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => handleRemoveGallery(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
              </div>
          </div>

          <hr className="border-gray-100" />

          {/* TOMBOL AKSI */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2 text-sm"
            >
              <XCircle size={18} /> Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0B2F5E] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#061A35] transition flex items-center gap-2 disabled:opacity-70 shadow-md text-sm"
            >
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />} Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}