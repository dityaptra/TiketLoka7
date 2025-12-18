"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, ShoppingBag, Tag, LogOut } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2"; // 1. Import SweetAlert

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth(); // Ambil data user & fungsi logout asli

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kelola Wisata", href: "/admin/destinations", icon: Map },
    { name: "Kategori", href: "/admin/categories", icon: Tag },
    { name: "Transaksi", href: "/admin/bookings", icon: ShoppingBag },
  ];

  // 2. Buat fungsi handleLogout dengan SweetAlert
  const handleLogout = () => {
    Swal.fire({
      title: "Keluar Aplikasi?",
      text: "Anda harus login kembali untuk mengakses halaman admin.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Warna merah untuk aksi keluar
      cancelButtonColor: "#3085d6", // Warna biru untuk batal
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true, // Posisi tombol dibalik (Batal di kiri, Ya di kanan)
    }).then((result) => {
      if (result.isConfirmed) {
        // Panggil fungsi logout dari context jika user menekan "Ya"
        logout();
      }
    });
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 flex flex-col z-30 shadow-sm">
      {/* 1. LOGO AREA */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <div className="relative h-8 w-32">
          <Image
            src="/images/logonama2.png"
            alt="Logo TiketLoka"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* 2. MENU ITEMS */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-[#0B2F5E] text-white shadow-md shadow-blue-900/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0B2F5E]"
              }`}
            >
              <item.icon
                size={20}
                className={
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-[#0B2F5E]"
                }
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 3. PROFIL ADMIN & LOGOUT */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {/* Profil Card Kecil */}
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-[#F57C00] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Admin
            </p>
          </div>
        </div>

        {/* Tombol Logout (Gunakan handleLogout) */}
        <button
          onClick={handleLogout} // 3. Ganti logout dengan handleLogout
          className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg text-xs font-bold text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
        >
          <LogOut size={16} />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
