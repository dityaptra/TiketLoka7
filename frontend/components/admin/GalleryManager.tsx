"use client";

import { useState } from "react";
import { Upload, X, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";

interface GalleryImage {
  id: number;
  image: string;
  destination_id?: number;
}

interface GalleryManagerProps {
  destinationId: number;
  existingImages: GalleryImage[];
  onUpdate: () => void;
}

export default function GalleryManager({
  destinationId,
  existingImages,
  onUpdate,
}: GalleryManagerProps) {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Helper URL Gambar
  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  // 1. Handle Hapus Foto Lama (Server Side)
  const handleDeleteExisting = async (imageId: number) => {
    const result = await Swal.fire({
      title: "Hapus Foto?",
      text: "Foto ini akan dihapus permanen dari server.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `${BASE_URL}/api/admin/destination-images/${imageId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          Swal.fire({
            title: "Terhapus!",
            text: "Foto berhasil dihapus.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
          onUpdate(); // Refresh data di parent
        } else {
          throw new Error("Gagal menghapus");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus foto.", "error");
      }
    }
  };

  // 2. Handle Tambah ke Antrian Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setUploadQueue((prev) => [...prev, ...filesArr]);
    }
  };

  // 3. Handle Hapus dari Antrian Upload (Client Side)
  const removeQueue = (index: number) => {
    setUploadQueue((prev) => prev.filter((_, i) => i !== index));
  };

  // 4. Eksekusi Upload ke Server
  const handleUpload = async () => {
    if (uploadQueue.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("destination_id", String(destinationId));
    uploadQueue.forEach((file) => {
      // Pastikan nama field sesuai backend (biasanya images[])
      formData.append("images[]", file); 
    });

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/destination-images`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        setUploadQueue([]);
        Swal.fire({
            title: "Sukses",
            text: "Foto berhasil diunggah",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });
        onUpdate();
      } else {
        const json = await res.json();
        Swal.fire("Gagal", json.message || "Terjadi kesalahan saat upload", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Koneksi error", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GRID FOTO EXISTING */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {existingImages.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50"
          >
            <img
              src={getImageUrl(img.image)}
              alt="Gallery"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Fallback jika gambar rusak
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                if(e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML += '<span class="text-gray-400 text-xs">Error Loading</span>';
                }
              }}
            />
            {/* Tombol Hapus Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button
                onClick={() => handleDeleteExisting(img.id)}
                className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition transform hover:scale-110 shadow-lg"
                title="Hapus Foto"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* Tombol Tambah (Visual Placeholder) */}
        <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition h-full min-h-[150px] group">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <div className="bg-gray-100 p-3 rounded-full mb-2 group-hover:bg-white group-hover:text-blue-500 transition-colors text-gray-400">
            <Upload size={24} />
          </div>
          <span className="text-sm text-gray-500 font-medium group-hover:text-blue-600">Tambah Foto</span>
        </label>
      </div>

      {/* QUEUE UPLOAD SECTION */}
      {uploadQueue.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-[#0B2F5E] text-sm">
                Siap Diupload ({uploadQueue.length})
            </h4>
            <button 
                onClick={() => setUploadQueue([])}
                className="text-xs text-red-500 hover:underline"
            >
                Batal Semua
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {uploadQueue.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm"
              >
                <ImageIcon size={14} className="text-blue-400"/>
                <span className="text-xs text-gray-600 truncate max-w-[120px]" title={file.name}>
                  {file.name}
                </span>
                <button
                  onClick={() => removeQueue(idx)}
                  className="text-gray-400 hover:text-red-500 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-[#0B2F5E] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#09254A] flex items-center justify-center gap-2 disabled:opacity-70 shadow-md transition-all active:scale-[0.99]"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Mengunggah...
              </>
            ) : (
              <>
                <Upload size={16} /> Upload Sekarang
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}