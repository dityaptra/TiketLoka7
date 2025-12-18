'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { 
    Trash2, Calendar, MapPin, Loader2, ShoppingCart, ArrowLeft, 
    Ticket, CheckSquare, Square, Wallet, ShieldCheck, 
    ScanLine, Building2 // Icon tambahan untuk pembayaran
} from 'lucide-react'; 
import { CartItem } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext'; 
import { useNotification } from '@/context/NotificationContext'; 
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  
  // CONTEXT HOOKS
  const { refreshCart } = useCartContext(); 
  const { addNotification } = useNotification(); 

  const [carts, setCarts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // --- FITUR BARU: PAYMENT METHOD STATE ---
  const [paymentMethod, setPaymentMethod] = useState('qris'); 
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // KONFIGURASI URL API
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- FUNGSI HELPER UNTUK GAMBAR ---
  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    // Cek path storage
    if (cleanPath.startsWith('storage/')) {
        return `${BASE_URL}/${cleanPath}`;
    }
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  // 1. Fetch Data
  useEffect(() => {
    if (authLoading) return; 

    const fetchCart = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/cart`, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) setCarts(json.data);
        else if (res.status === 401) router.push('/login');
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat keranjang');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token, authLoading, router, BASE_URL]);

  // Helper untuk Checkbox
  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected = carts.length > 0 && selectedIds.length === carts.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
        setSelectedIds([]);
    } else {
        setSelectedIds(carts.map(item => item.id));
    }
  };

  // 2. Fungsi Hapus Item
  const handleDelete = async (id: number) => {
    if(!confirm('Hapus item ini?')) return; 
    
    try {
      await fetch(`${BASE_URL}/api/cart/${id}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
      });
      setCarts(carts.filter(item => item.id !== id));
      setSelectedIds(selectedIds.filter(selId => selId !== id));
      
      toast.success('Item dihapus');
      await refreshCart(); 
    } catch (error) {
      toast.error('Gagal menghapus');
    }
  };

  // 3. Kalkulasi Total
  const { totalQty, subTotal, grandTotal } = useMemo(() => {
    const selectedItems = carts.filter(item => selectedIds.includes(item.id));
    const totalQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subTotal = selectedItems.reduce((sum, item) => sum + item.total_price, 0);
    return { totalQty, subTotal, grandTotal: subTotal };
  }, [carts, selectedIds]);

  // 4. Logic Checkout
  const handleCheckout = async () => {
    if (selectedIds.length === 0) return toast.error('Pilih minimal 1 item!');
    
    setIsCheckingOut(true);
    try {
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        },
        // Kirim payment_method yang dipilih user
        body: JSON.stringify({ cart_ids: selectedIds, payment_method: paymentMethod })
      });

      const json = await res.json();

      if (res.ok) {
        addNotification(
            'transaction',
            'Menunggu Pembayaran',
            `Pesanan dengan kode ${json.booking_code} berhasil dibuat.`
        );
        toast.success("Checkout berhasil!");
        await refreshCart(); 
        router.push(`/payment/${json.booking_code}`);
      } else {
        toast.error('Checkout Gagal: ' + json.message);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#F57C00]"/>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-40">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-24 px-4 md:px-6">
        <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#F57C00] transition-colors gap-1">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-[#0B2F5E]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B2F5E]">Keranjang Saya</h1>
        </div>

        {carts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Ticket className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Keranjang Kosong</h3>
            <p className="text-gray-500 mb-8 text-center max-w-sm">Belum ada tiket wisata yang ditambahkan.</p>
            <Link href="/" className="px-8 py-3 bg-[#F57C00] hover:bg-[#E65100] text-white rounded-xl font-bold transition-all flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 relative">
            
            {/* --- LIST ITEMS --- */}
            <div className="flex-1 space-y-4">
               <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm sticky top-20 z-10 lg:static">
                <div className="flex items-center gap-3 cursor-pointer select-none" onClick={toggleSelectAll}>
                    {isAllSelected ? <CheckSquare className="w-5 h-5 text-[#F57C00]" /> : <Square className="w-5 h-5 text-gray-300" />}
                    <span className="font-semibold text-gray-700 text-sm">Pilih Semua ({carts.length})</span>
                </div>
              </div>

              {carts.map((item) => (
                <div 
                    key={item.id} 
                    className={`group bg-white p-4 rounded-2xl border transition-all duration-200 flex gap-4
                    ${selectedIds.includes(item.id) 
                        ? 'border-[#F57C00] ring-1 ring-[#F57C00]/20' 
                        : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="pt-8 cursor-pointer" onClick={() => toggleSelect(item.id)}>
                      {selectedIds.includes(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#F57C00]" />
                      ) : (
                          <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                      )}
                  </div>

                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img 
                      src={getImageUrl(item.destination.image_url)} 
                      alt={item.destination.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800'; }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[#0B2F5E] line-clamp-1">{item.destination.name}</h3>
                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col text-xs text-gray-500 mt-2 gap-1.5">
                      <div className="flex items-center gap-1.5 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
                          <Calendar className="w-3 h-3 text-gray-400" /> {item.visit_date}
                      </div>
                      <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400" /> {item.quantity} Tiket
                      </div>
                    </div>
                    <p className="text-[#F57C00] font-bold text-lg mt-2">Rp {item.total_price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* --- SUMMARY SECTION (WITH PAYMENT METHOD) --- */}
            <div className="hidden lg:block lg:w-96">
                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-28">
                    <h3 className="text-lg font-bold text-[#0B2F5E] mb-6 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#F57C00]"/> Ringkasan Belanja
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Total Item</span>
                            <span className="font-medium">{totalQty} Tiket</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">Rp {subTotal.toLocaleString('id-ID')}</span>
                        </div>
                        
                        {/* PILIHAN METODE PEMBAYARAN */}
                        <div className="pt-4 border-t border-dashed border-gray-200">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Metode Pembayaran</p>
                            <div className="grid grid-cols-1 gap-2.5">
                                {/* Option 1: QRIS */}
                                <div 
                                    onClick={() => setPaymentMethod('qris')}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 
                                    ${paymentMethod === 'qris' 
                                        ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]/30' 
                                        : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'qris' ? 'border-[#F57C00]' : 'border-gray-300'}`}>
                                        {paymentMethod === 'qris' && <div className="w-2.5 h-2.5 bg-[#F57C00] rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <ScanLine className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-bold text-gray-800">QRIS (Instant)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Option 2: BCA */}
                                <div 
                                    onClick={() => setPaymentMethod('bca')}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 
                                    ${paymentMethod === 'bca' 
                                        ? 'border-[#F57C00] bg-orange-50 ring-1 ring-[#F57C00]/30' 
                                        : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'bca' ? 'border-[#F57C00]' : 'border-gray-300'}`}>
                                        {paymentMethod === 'bca' && <div className="w-2.5 h-2.5 bg-[#F57C00] rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-bold text-gray-800">Bank Transfer (BCA)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center mt-4">
                            <span className="font-bold text-gray-800">Total Bayar</span>
                            <span className="font-bold text-xl text-[#F57C00]">Rp {grandTotal.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={selectedIds.length === 0 || isCheckingOut}
                        className="w-full bg-[#0B2F5E] hover:bg-[#061A35] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-[0.98] transition-all"
                    >
                        {isCheckingOut ? <Loader2 className="animate-spin w-5 h-5"/> : (
                            <>
                                <ShieldCheck className="w-5 h-5" /> Bayar Sekarang
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Mobile Sticky Bar (Simplified) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">Total ({paymentMethod === 'qris' ? 'QRIS' : 'BCA'})</p>
                        <p className="font-bold text-lg text-[#F57C00]">Rp {grandTotal.toLocaleString('id-ID')}</p>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={selectedIds.length === 0 || isCheckingOut}
                        className="flex-1 bg-[#0B2F5E] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:bg-gray-300"
                    >
                        {isCheckingOut ? <Loader2 className="animate-spin w-5 h-5"/> : 'Checkout'}
                    </button>
                </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}