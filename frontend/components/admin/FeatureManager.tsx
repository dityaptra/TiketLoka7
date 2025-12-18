"use client";

import { useState } from "react";
import { Plus, Trash, CheckCircle, PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

// Definisi Tipe Data
interface FeatureItem {
  id: number;
  name: string;
  price?: number | string;
  destination_id?: number;
}

interface FeatureManagerProps {
  destinationId: number;
  inclusions: FeatureItem[];
  addons: FeatureItem[];
  onUpdate: () => void;
}

export default function FeatureManager({ destinationId, inclusions, addons, onUpdate }: FeatureManagerProps) {
  const { token } = useAuth();
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [newInclusion, setNewInclusion] = useState("");
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);

  // --- 1. PERBAIKAN FUNGSI ADD INCLUSION ---
  const addInclusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInclusion.trim()) return;
    setLoading(true);

    try {
      // PERUBAHAN DISINI: Sesuaikan URL dengan route api.php
      const res = await fetch(`${BASE_URL}/api/admin/destinations/${destinationId}/inclusions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        // Body tidak perlu destination_id lagi karena sudah ada di URL
        body: JSON.stringify({ name: newInclusion }),
      });

      if (res.ok) {
        setNewInclusion("");
        onUpdate();
      } else {
        // Tambahan: Debugging jika error
        const json = await res.json();
        console.error("Gagal simpan:", json);
        Swal.fire("Gagal", "Gagal menyimpan data", "error");
      }
    } catch (error) { 
      console.error(error); 
    } finally {
      setLoading(false);
    }
  };

  // --- 2. PERBAIKAN FUNGSI ADD ADDON ---
  const addAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddon.name.trim() || !newAddon.price) return;
    setLoading(true);

    try {
      // PERUBAHAN DISINI: Sesuaikan URL dengan route api.php
      const res = await fetch(`${BASE_URL}/api/admin/destinations/${destinationId}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            name: newAddon.name, 
            price: newAddon.price 
        }),
      });

      if (res.ok) {
        setNewAddon({ name: "", price: "" });
        onUpdate();
      } else {
         const json = await res.json();
         console.error("Gagal simpan:", json);
         Swal.fire("Gagal", "Gagal menyimpan data", "error");
      }
    } catch (error) { 
      console.error(error); 
    } finally {
      setLoading(false);
    }
  };

  // --- 3. PERBAIKAN FUNGSI DELETE ---
  const handleDelete = async (id: number, type: "inclusion" | "addon") => {
    const result = await Swal.fire({
      title: 'Hapus Item?',
      text: "Item ini akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    // PERUBAHAN DISINI: Nama endpoint disederhanakan sesuai api.php
    // Route::delete('/inclusions/{id}') dan Route::delete('/addons/{id}')
    const endpoint = type === "inclusion" ? "inclusions" : "addons";
    
    try {
      // URL menjadi: /api/admin/inclusions/1 atau /api/admin/addons/1
      const res = await fetch(`${BASE_URL}/api/admin/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        onUpdate();
        Swal.fire({
            title: "Terhapus!",
            text: "Item berhasil dihapus.",
            icon: "success",
            timer: 1000,
            showConfirmButton: false
        });
      }
    } catch (error) { 
      console.error(error); 
      Swal.fire("Error", "Gagal menghapus item.", "error");
    }
  };

  // --- RENDER (TIDAK ADA PERUBAHAN) ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* KOLOM KIRI: INCLUSIONS */}
      <div className="bg-green-50/50 border border-green-100 rounded-xl p-6">
        <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Termasuk Paket (Inclusions)
        </h3>
        
        <form onSubmit={addInclusion} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Misal: Makan Siang, Tiket Masuk..."
            className="flex-1 px-3 py-2 rounded-lg border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
            value={newInclusion}
            onChange={(e) => setNewInclusion(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !newInclusion}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18} />}
          </button>
        </form>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {inclusions.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada data</p>}
          {inclusions.map((item) => (
            <div key={item.id} className="group flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition">
              <span className="text-gray-700 text-sm font-medium">{item.name}</span>
              <button 
                type="button"
                onClick={() => handleDelete(item.id, "inclusion")} 
                className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* KOLOM KANAN: ADD-ONS */}
      <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6">
        <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Add-on Berbayar
        </h3>

        <form onSubmit={addAddon} className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nama Add-on"
              className="flex-1 px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              value={newAddon.name}
              onChange={(e) => setNewAddon({...newAddon, name: e.target.value})}
              disabled={loading}
            />
            <input
              type="number"
              placeholder="Harga (Rp)"
              className="w-28 px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              value={newAddon.price}
              onChange={(e) => setNewAddon({...newAddon, price: e.target.value})}
              disabled={loading}
            />
            <button 
                type="submit" 
                disabled={loading || !newAddon.name || !newAddon.price}
                className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18} />}
            </button>
          </div>
        </form>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {addons.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada add-on</p>}
          {addons.map((item) => (
            <div key={item.id} className="group flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col">
                <span className="text-gray-700 text-sm font-medium">{item.name}</span>
                <span className="text-xs text-orange-600 font-bold">
                    +Rp {Number(item.price).toLocaleString('id-ID')}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => handleDelete(item.id, "addon")} 
                className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}