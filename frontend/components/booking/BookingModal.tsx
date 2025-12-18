'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { Destination } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination;
  selectedDate: string;
  quantity: number;
}

export default function BookingModal({ isOpen, onClose, destination, selectedDate, quantity }: BookingModalProps) {
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Helper URL Gambar
  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  if (!isOpen) return null;

  const totalAmount = destination.price * quantity;

  const handleCheckout = async () => {
    // Cek Token sebelum request
    if (!token) {
        toast.error("Sesi Anda habis, silakan login ulang.");
        router.push('/login');
        return;
    }

    setLoading(true);
    try {
      // Menggunakan BASE_URL
      const res = await fetch(`${BASE_URL}/api/buy-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination_id: destination.id,
          quantity: quantity,
          visit_date: selectedDate,
          payment_method: paymentMethod,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Sesi habis. Silakan login kembali.");
        }
        throw new Error(json.message || 'Gagal memproses transaksi');
      }

      // Sukses -> Redirect ke Payment Page (bukan langsung tiket)
      // Karena statusnya masih 'pending'
      toast.success("Pesanan dibuat!");
      router.push(`/payment/${json.booking_code}`);
      
    } catch (error: any) {
      toast.error(error.message);
      if (error.message.includes("Sesi habis")) {
         router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg text-[#0B2F5E]">Konfirmasi Pembayaran</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Ringkasan */}
        <div className="p-4 bg-gray-50 flex gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
               <img 
                 src={getImageUrl(destination.image_url)} 
                 alt={destination.name} 
                 className="w-full h-full object-cover" 
                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800'; }}
               />
            </div>
            <div>
              <p className="font-bold text-gray-800 line-clamp-1">{destination.name}</p>
              <p className="text-sm text-gray-500">{selectedDate} • {quantity} Tiket</p>
            </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Pilih Metode Bayar</p>
          <div className="space-y-2">
            {[
              { id: 'qris', label: 'QRIS (Instant)', icon: <Wallet className="w-4 h-4"/> },
              { id: 'transfer', label: 'Transfer Bank BCA', icon: <CreditCard className="w-4 h-4"/> },
              
            ].map((method) => (
              <label key={method.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.id ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]' : 'border-gray-200 hover:border-blue-200'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value={method.id} 
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden" 
                />
                <div className={`p-2 rounded-full ${paymentMethod === method.id ? 'bg-[#F57C00] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {method.icon}
                </div>
                <span className="font-medium text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">Total Tagihan</span>
            <span className="text-xl font-extrabold text-[#F57C00]">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#0B2F5E] hover:bg-[#061A35] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Bayar Sekarang'}
          </button>
        </div>

      </div>
    </div>
  );
}