'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, XCircle } from 'lucide-react';

export default function FacebookCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('Memproses login Facebook...');
  const [isError, setIsError] = useState(false);

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    
    // 1. CEK DULU: Apakah ada error dari backend (URL Params)?
    if (error) {
      setIsError(true);
      
      const errorMessages: Record<string, string> = {
        'access_denied': 'Login dibatalkan. Silakan coba lagi.',
        'invalid_provider': 'Provider OAuth tidak valid.',
        'server_error': errorMessage || 'Terjadi kesalahan server.',
        'email_exists': 'Email sudah terdaftar dengan metode login lain.'
      };
      
      setStatus(errorMessages[error] || 'Login gagal. Silakan coba lagi.');
      
      // Redirect ke login setelah 3 detik
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    // 2. Jika tidak ada error, proses token
    if (token) {
      // Menggunakan BASE_URL
      fetch(`${BASE_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Token tidak valid');
        }
        return res.json();
      })
      .then(json => {
        // Handle format response (apakah json langsung atau json.data)
        const userData = json.data || json;

        // Simpan ke Context & LocalStorage
        login(token, userData);
        
        setStatus('Login berhasil! Mengalihkan...');
        
        // Redirect berdasarkan role
        setTimeout(() => {
          if (userData.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        setIsError(true);
        setStatus('Gagal mengambil data user. Token tidak valid.');
        setTimeout(() => router.push('/login'), 3000);
      });

    } else {
      // Tidak ada token dan tidak ada error = URL tidak valid
      setIsError(true);
      setStatus('URL tidak valid. Mengalihkan ke halaman login...');
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [searchParams, login, router, BASE_URL]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      {isError ? (
        <XCircle className="w-16 h-16 text-red-500" />
      ) : (
        <Loader2 className="w-10 h-10 animate-spin text-[#1877F2]" />
      )}
      <p className={`text-lg font-medium ${isError ? 'text-red-600' : 'text-gray-600'}`}>
        {status}
      </p>
    </div>
  );
}