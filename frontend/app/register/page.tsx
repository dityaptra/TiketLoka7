"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import Image from "next/image";
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

// --- COMPONENTS: ICONS (Tetap sama) ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </svg>
);

export default function RegisterPage() {
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIKA VALIDASI ---
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone_number.trim() !== "" &&
    formData.password.length >= 8 &&
    formData.password === formData.password_confirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      // Menggunakan BASE_URL
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Gagal melakukan pendaftaran");

      login(data.access_token, data.user);
      addNotification(
        "system",
        "Pendaftaran Berhasil",
        "Akun Anda telah aktif. Selamat bergabung!"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Menggunakan BASE_URL
    window.location.href = `${BASE_URL}/auth/google`;
  };
  const handleFacebookLogin = () => {
    // Menggunakan BASE_URL
    window.location.href = `${BASE_URL}/auth/facebook`;
  };

  // Styling Variables
  const inputWrapperClass = "relative flex items-center";
  const iconClass = "absolute left-3 text-gray-400 w-5 h-5";
  const inputClass =
    "w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-[#005eff] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-white">
      {/* --- BACKGROUND BLUR EFFECT --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[90vh] bg-blue-400 rounded-full mix-blend-multiply filter blur-[140px] opacity-25 animate-pulse"></div>
        <div className="absolute top-[0%] right-[-15%] w-[70vw] h-[80vh] bg-orange-300 rounded-full mix-blend-multiply filter blur-[140px] opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-20 w-[60vw] h-[60vh] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-30"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6 pt-10 relative z-10">
        <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[550px]">
          
          {/* Kolom Kiri: Ilustrasi & Branding */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-[#005eff] relative overflow-hidden p-10 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-[#005eff] to-[#0046b0] opacity-100 z-0"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#002a6b] opacity-20 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-64 h-64 mb-6 animate-fade-in-up">
                <Image
                  src="/images/tiketlokaputih.png"
                  alt="Ilustrasi Register"
                  fill
                  className="object-contain drop-shadow-xl"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Bergabunglah Bersama Kami
              </h2>
              <p className="text-blue-100 text-sm max-w-xs leading-relaxed">
                Dapatkan akses ke ribuan event dan destinasi menarik hanya dalam
                satu aplikasi.
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Form */}
          <div className="w-full p-6 md:p-10 flex flex-col justify-center">
            <div className="mb-3">
              <h3 className="text-2xl font-bold text-gray-800">
                Daftar Sekarang
              </h3>
              <div className="mt-2 text-left text-sm mb-3">
                <span className="text-gray-500">Sudah punya akun? </span>
                <Link
                  href="/login"
                  className="text-[#F57C00] font-semibold hover:text-[#d46a00] hover:underline transition-colors"
                >
                  Masuk
                </Link>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r flex items-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-gray-600">
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className={inputWrapperClass}>
                <Phone className={iconClass} />
                <input
                  name="phone_number"
                  type="tel"
                  placeholder="Nomor Telepon"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className={inputWrapperClass}>
                <Mail className={iconClass} />
                <input
                  name="email"
                  type="email"
                  placeholder="Alamat Email"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className={inputWrapperClass}>
                <Lock className={iconClass} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (Min. 8 Karakter)"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className={inputWrapperClass}>
                <Lock className={iconClass} />
                <input
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi Password"
                  required
                  onChange={handleChange}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* --- TOMBOL DAFTAR --- */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full font-semibold py-3 rounded-lg transition-all transform flex items-center justify-center gap-2 mt-8 
                  ${
                    isFormValid && !isLoading
                      ? "bg-[#F57C00] hover:bg-[#E65100] text-white shadow-md cursor-pointer"
                      : "bg-gray-300 border border-gray-300 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-[#F57C00]" />
                ) : (
                  "DAFTAR"
                )}
              </button>
            </form>

            <div className="flex items-center justify-center my-6 w-full">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-xs font-medium text-gray-500 tracking-wider">
                atau daftar dengan
              </span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Social Login Buttons */}
              <div className="mt-1 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center cursor-pointer gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition-all text-sm shadow-sm hover:shadow"
                >
                  <GoogleIcon /> <span className="hidden sm:inline">Google</span>
                </button>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="flex items-center justify-center cursor-pointer gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition-all text-sm shadow-sm hover:shadow"
                >
                  <FacebookIcon /> <span className="hidden sm:inline">Facebook</span>
                </button>
              </div>

            <div className="text-center text-[10px] md:text-xs text-gray-500 leading-relaxed px-2 border-t mt-1 pt-4 border-gray-100">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link href="/privacy" className="underline text-[#F57C00]">
                Kebijakan Privasi
              </Link>{" "}
              dan{" "}
              <Link href="/terms" className="underline text-[#F57C00]">
                Syarat & Ketentuan
              </Link>{" "}
              TiketLoka.
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full py-4 text-center text-xs text-gray-500 relative z-10">
        &copy; {new Date().getFullYear()} TiketLoka. All Rights Reserved.
      </footer>
    </div>
  );
}