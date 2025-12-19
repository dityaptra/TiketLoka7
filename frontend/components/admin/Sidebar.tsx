"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, ShoppingBag, Tag, LogOut } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

export default function Sidebar() {
  const pathname = usePathname();
  
  // Mengambil user dan logout dari Context
  // Pastikan AuthContext Anda sudah memiliki tipe data untuk 'user'
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kelola Wisata", href: "/admin/destinations", icon: Map },
    { name: "Kategori", href: "/admin/categories", icon: Tag },
    { name: "Transaksi", href: "/admin/bookings", icon: ShoppingBag },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Keluar Aplikasi?",
      text: "Anda harus login kembali untuk mengakses halaman admin.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  // Helper untuk inisial nama dengan Type Annotation
  // Menerima string, null, atau undefined
  const getInitial = (name?: string | null): string => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
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
            priority
          />
        </div>
      </div>

      {/* 2. MENU ITEMS */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon; // Assign ke variabel kapital agar bisa dirender sebagai komponen

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
              <Icon
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
          {/* Avatar */}
          <div className="w-10 h-10 bg-[#F57C00] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white shrink-0">
            {getInitial(user?.name)}
          </div>
          
          {/* Info User */}
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate" title={user?.name || "Admin"}>
              {/* Optional Chaining (?.) sangat penting di TS jika user bisa null */}
              {user?.name || "Admin"}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Administrator
            </p>
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg text-xs font-bold text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
        >
          <LogOut size={16} />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}