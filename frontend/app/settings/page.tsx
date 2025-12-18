"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { 
  User, Mail, Phone, Camera, Save, Lock, 
  Loader2, LogOut, Ticket, Bell, ChevronRight,
  Eye, EyeOff 
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// KONFIGURASI URL API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Helper URL Gambar
const getAvatarUrl = (url: string | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  // Hapus slash di awal jika ada untuk menghindari double slash
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `${BASE_URL}/storage/${cleanPath}`;
};

export default function SettingsPage() {
  const { user, logout, token, updateUser } = useAuth();
  const router = useRouter();
  
  // State Tab
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  
  // State Form Profil
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone_number: "", avatar: null as File | null });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // State Form Password
  const [passForm, setPassForm] = useState({ 
    current_password: "", 
    new_password: "", 
    new_password_confirmation: "" 
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load Data User
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        avatar: null,
      });
      if (user.avatar_url) setAvatarPreview(getAvatarUrl(user.avatar_url));
    }
  }, [user]);

  // Redirect protection
  useEffect(() => {
    if (!user && !isLoggingOut) {
      router.replace("/");
    }
  }, [user, isLoggingOut, router]);

  // --- FUNGSI HANDLE LOGOUT ---
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Yakin ingin keluar?',
      text: "Anda harus login kembali untuk mengakses akun Anda.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setIsLoggingOut(true);
      try {
        await logout();
      } catch (error) {
        console.error("Logout error:", error);
        setIsLoggingOut(false);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Logout',
          text: 'Terjadi kesalahan saat mencoba keluar. Silakan coba lagi.',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("name", profileForm.name);
    if(profileForm.phone_number) formData.append("phone_number", profileForm.phone_number);
    if (profileForm.avatar) formData.append("avatar", profileForm.avatar);
    
    try {
      // Menggunakan BASE_URL
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "POST",
        headers: { 
            "Accept": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Profil berhasil diperbarui!");
        const userData = json.data || json;
        if (userData) {
            updateUser(userData);
            if (userData.avatar_url) setAvatarPreview(getAvatarUrl(userData.avatar_url));
        }
      } else {
        toast.error(json.message || "Gagal update profil");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.new_password_confirmation) {
        return toast.error("Konfirmasi password tidak cocok");
    }
    setLoading(true);
    try {
      // Menggunakan BASE_URL
      const res = await fetch(`${BASE_URL}/api/password`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            "Accept": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(passForm),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Password berhasil diubah");
        setPassForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      } else {
        if (json.errors) {
            const firstError = Object.values(json.errors)[0];
            // @ts-ignore
            toast.error(Array.isArray(firstError) ? firstError[0] : "Validasi gagal");
        } else {
            toast.error(json.message || "Gagal mengubah password");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error server");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : "U";

  // Loading state saat checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-[#0B2F5E] w-10 h-10"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-800 antialiased pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-28">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B2F5E] tracking-tight">Pengaturan Akun</h1>
          <p className="text-gray-500 mt-2 text-lg">Kelola informasi profil dan keamanan akun Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR */}
          <div className="lg:col-span-3 lg:sticky lg:top-28 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-50 text-[#0B2F5E] flex items-center justify-center font-bold text-3xl overflow-hidden mx-auto mb-4 border-4 border-white shadow-sm relative">
                  {avatarPreview ? <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized/> : getInitials(user?.name || "U")}
                </div>
                <h3 className="font-bold text-gray-900 text-lg truncate">{user?.name}</h3>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <nav className="flex flex-col p-2">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-1 ${activeTab === 'profile' ? 'bg-blue-50 text-[#0B2F5E]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <div className="flex items-center gap-3"><User size={18}/> Profil Saya</div>
                  {activeTab === 'profile' && <ChevronRight size={16} />}
                </button>

                <button 
                  onClick={() => setActiveTab("password")}
                  className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-1 ${activeTab === 'password' ? 'bg-blue-50 text-[#0B2F5E]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <div className="flex items-center gap-3"><Lock size={18}/> Kata Sandi</div>
                  {activeTab === 'password' && <ChevronRight size={16} />}
                </button>

                <div className="my-2 border-t border-gray-100"></div>

                <button onClick={() => router.push('/tickets')} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
                  <Ticket size={18} /> Tiket Saya
                </button>
                <button onClick={() => router.push('/notifications')} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
                  <Bell size={18} /> Notifikasi
                </button>
                <button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? <Loader2 size={18} className="animate-spin"/> : <LogOut size={18} />}
                  Keluar Akun
                </button>
              </nav>
            </div>
          </div>

          {/* CONTENT */}
          <div className="lg:col-span-9">
            
            {activeTab === "profile" && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Edit Profil</h2>
                        <p className="text-gray-500 text-sm mt-1">Perbarui informasi pribadi Anda</p>
                    </div>
                </div>
                
                <form onSubmit={handleUpdateProfile}>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-24 h-24 rounded-full border-4 border-gray-50 bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden shadow-inner group shrink-0">
                      {avatarPreview ? <Image src={avatarPreview} alt="Preview" fill className="object-cover" unoptimized/> : getInitials(user?.name || "U")}
                      <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white w-8 h-8" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { setProfileForm({ ...profileForm, avatar: e.target.files[0] }); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }}}/>
                      </label>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Foto Profil</h3>
                        <p className="text-sm text-gray-500 mb-2">Format: JPG, PNG. Maks 2MB.</p>
                        <label className="text-sm font-bold text-[#F57C00] cursor-pointer hover:underline">
                            Ganti Foto
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { setProfileForm({ ...profileForm, avatar: e.target.files[0] }); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }}}/>
                        </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#0B2F5E] focus:ring-2 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Nomor Telepon</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input type="text" value={profileForm.phone_number} onChange={(e) => setProfileForm({...profileForm, phone_number: e.target.value})} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#0B2F5E] focus:ring-2 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"/>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Email (Permanen)</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input type="email" value={profileForm.email} disabled className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-medium cursor-not-allowed"/>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-[#0B2F5E] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#09254A] shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Keamanan</h2>
                        <p className="text-gray-500 text-sm mt-1">Perbarui kata sandi Anda secara berkala</p>
                    </div>
                </div>
                <form onSubmit={handleChangePassword} className="max-w-lg">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Password Saat Ini</label>
                      <div className="relative">
                        <input type={showCurrentPassword ? "text" : "password"} required value={passForm.current_password} onChange={(e) => setPassForm({...passForm, current_password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0B2F5E] focus:ring-2 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900" placeholder="Masukkan password lama"/>
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">{showCurrentPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Password Baru</label>
                      <div className="relative">
                        <input type={showNewPassword ? "text" : "password"} required value={passForm.new_password} onChange={(e) => setPassForm({...passForm, new_password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0B2F5E] focus:ring-2 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900" placeholder="Minimal 8 karakter"/>
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">{showNewPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} required value={passForm.new_password_confirmation} onChange={(e) => setPassForm({...passForm, new_password_confirmation: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0B2F5E] focus:ring-2 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900" placeholder="Ulangi password baru"/>
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">{showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10">
                    <button type="submit" disabled={loading} className="bg-[#F57C00] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#E65100] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Lock className="w-5 h-5"/>}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}