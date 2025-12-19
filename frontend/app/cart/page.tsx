'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { 
    Trash2, Calendar, MapPin, Loader2, ShoppingCart, ArrowLeft, 
    Ticket, CheckSquare, Square, Wallet, ShieldCheck, 
    ScanLine, Building2, PlusCircle
} from 'lucide-react'; 
import { CartItem } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext'; 
import { useNotification } from '@/context/NotificationContext'; 
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function CartPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const { refreshCart } = useCartContext(); 
  const { addNotification } = useNotification(); 

  const [carts, setCarts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('qris'); 
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // --- HELPER 1: Format Rupiah ---
  const formatIDR = (value: any) => {
    const price = Number(value);
    if (isNaN(price)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // --- HELPER 2: Parsing Addons per Item ---
  const getItemAddons = (item: CartItem) => {
    let ids: any[] = [];
    try { 
        // Mendukung format array maupun string JSON dari backend
        ids = Array.isArray(item.addons) ? item.addons : JSON.parse(item.addons as any || "[]"); 
    } catch (e) { ids = []; }
    
    return (item.destination.addons || []).filter((a: any) => 
        ids.map(String).includes(String(a.id))
    );
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1596423348633-8472df3b006c?auto=format&fit=crop&w=800';
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    if (cleanPath.startsWith('storage/')) return `${BASE_URL}/${cleanPath}`;
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  // 1. Fetch Data
  useEffect(() => {
    if (authLoading) return; 
    const fetchCart = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${BASE_URL}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) setCarts(json.data);
        else if (res.status === 401) router.push('/login');
      } catch (error) {
        toast.error('Gagal memuat keranjang');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token, authLoading, router, BASE_URL]);

  // --- LOGIKA KALKULASI TOTAL (TERMASUK ADDONS) ---
  const { totalQty, subTotalBase, totalAddons, grandTotal } = useMemo(() => {
    const selectedItems = carts.filter(item => selectedIds.includes(item.id));
    
    let tQty = 0;
    let sBase = 0;
    let tAddons = 0;

    selectedItems.forEach(item => {
        const qty = Number(item.quantity) || 0;
        tQty += qty;

        // 1. Harga Tiket Dasar
        sBase += (Number(item.destination.price) || 0) * qty;

        // 2. Kalkulasi Addons
        const itemAddonDetails = getItemAddons(item);
        const itemAddonPricePerPax = itemAddonDetails.reduce((sum, a) => sum + Number(a.price), 0);
        
        tAddons += (itemAddonPricePerPax * qty);
    });

    return { 
        totalQty: tQty, 
        subTotalBase: sBase, 
        totalAddons: tAddons, 
        grandTotal: sBase + tAddons 
    };
  }, [carts, selectedIds]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === carts.length && carts.length > 0 ? [] : carts.map(item => item.id));
  };

  // 2. Fungsi Hapus Item (SWEETALERT)
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
        title: 'Hapus dari keranjang?',
        text: "Anda harus menambahkannya lagi jika berubah pikiran.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus',
        reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${BASE_URL}/api/cart/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      setCarts(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(selId => selId !== id));
      toast.success('Item dihapus');
      await refreshCart(); 
    } catch (error) { toast.error('Gagal menghapus'); }
  };

  // 3. Logic Checkout (SWEETALERT)
  const handleCheckout = async () => {
    if (selectedIds.length === 0) return toast.error('Pilih minimal 1 item!');

    const result = await Swal.fire({
        title: 'Konfirmasi Pesanan',
        html: `
            <div class="text-left text-sm space-y-1">
                <p>Total Item: <b>${totalQty} Tiket</b></p>
                <p>Total Bayar: <b class="text-[#F57C00]">${formatIDR(grandTotal)}</b></p>
                <p class="text-gray-500">Metode: ${paymentMethod === 'qris' ? 'QRIS (Instant)' : 'BCA Transfer'}</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0B2F5E',
        confirmButtonText: 'Proses Pembayaran',
        reverseButtons: true
    });

    if (!result.isConfirmed) return;
    
    setIsCheckingOut(true);
    try {
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ cart_ids: selectedIds, payment_method: paymentMethod })
      });
      const json = await res.json();
      if (res.ok) {
        addNotification('transaction', 'Menunggu Pembayaran', `Pesanan ${json.booking_code} berhasil dibuat.`);
        toast.success("Checkout berhasil!");
        await refreshCart(); 
        router.push(`/payment/${json.booking_code}`);
      } else { toast.error(json.message); }
    } catch (error) { toast.error('Kesalahan koneksi'); } finally { setIsCheckingOut(false); }
  };

  if (loading || authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#F57C00]"/></div>;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-40 font-sans text-gray-800">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-24 px-4">
        <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#F57C00] gap-1">
                <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-8 h-8 text-[#0B2F5E]" />
            <h1 className="text-3xl font-extrabold text-[#0B2F5E]">Keranjang</h1>
        </div>

        {carts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <Ticket className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Keranjang Kosong</h3>
            <Link href="/" className="mt-6 inline-block px-8 py-3 bg-[#F57C00] text-white rounded-xl font-bold">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* --- LIST ITEM --- */}
            <div className="flex-1 space-y-4">
               <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 cursor-pointer" onClick={toggleSelectAll}>
                    {selectedIds.length === carts.length ? <CheckSquare className="text-[#F57C00]" /> : <Square className="text-gray-300" />}
                    <span className="font-bold text-sm">Pilih Semua ({carts.length})</span>
               </div>

              {carts.map((item) => {
                const itemAddons = getItemAddons(item);
                const itemAddonTotal = itemAddons.reduce((s, a) => s + Number(a.price), 0);
                const itemPrice = (Number(item.destination.price) + itemAddonTotal) * item.quantity;

                return (
                    <div key={item.id} className={`bg-white p-5 rounded-2xl border flex gap-4 transition-all ${selectedIds.includes(item.id) ? 'border-[#F57C00] ring-1 ring-orange-100' : 'border-gray-100'}`}>
                      <div className="pt-2 cursor-pointer" onClick={() => toggleSelect(item.id)}>
                          {selectedIds.includes(item.id) ? <CheckSquare className="text-[#F57C00]" /> : <Square className="text-gray-300" />}
                      </div>

                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border flex-shrink-0">
                        <img src={getImageUrl(item.destination.image_url)} alt="" className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-[#0B2F5E] truncate">{item.destination.name}</h3>
                            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12}/> {item.visit_date}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><Ticket size={12}/> {item.quantity} Tiket</p>
                            
                            {itemAddons.map((addon: any, idx: number) => (
                                <p key={idx} className="text-[10px] text-green-600 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-0.5 rounded">
                                    <PlusCircle size={10}/> {addon.name} (+{formatIDR(addon.price)})
                                </p>
                            ))}
                        </div>
                        <p className="text-[#F57C00] font-extrabold mt-2 text-lg">{formatIDR(itemPrice)}</p>
                      </div>
                    </div>
                );
              })}
            </div>

            {/* --- RINGKASAN BELANJA --- */}
            <div className="lg:w-96">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-28">
                    <h3 className="font-bold text-[#0B2F5E] mb-6 flex items-center gap-2 border-b pb-4"><Wallet className="text-[#F57C00]"/> Ringkasan Belanja</h3>
                    
                    <div className="space-y-3 mb-6 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Tiket Dasar ({totalQty})</span>
                            <span>{formatIDR(subTotalBase)}</span>
                        </div>
                        
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Total Add-ons</span>
                            <span>+{formatIDR(totalAddons)}</span>
                        </div>
                        
                        <div className="pt-4 border-t border-dashed">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Metode Pembayaran</p>
                            <div className="space-y-2">
                                <div onClick={() => setPaymentMethod('qris')} className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-orange-100' : 'border-gray-100 hover:bg-gray-50'}`}>
                                    <ScanLine size={18} className="text-gray-600" /> <span className="text-sm font-bold">QRIS (Instant)</span>
                                </div>
                                <div onClick={() => setPaymentMethod('bca')} className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'bca' ? 'border-[#F57C00] bg-orange-50 ring-1 ring-orange-100' : 'border-gray-100 hover:bg-gray-50'}`}>
                                    <Building2 size={18} className="text-gray-600" /> <span className="text-sm font-bold">BCA Transfer</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t-2 border-gray-50 flex justify-between items-center mb-6">
                        <span className="font-bold">Total Bayar</span>
                        <span className="font-black text-2xl text-[#F57C00]">{formatIDR(grandTotal)}</span>
                    </div>

                    <button onClick={handleCheckout} disabled={selectedIds.length === 0 || isCheckingOut} className="w-full bg-[#0B2F5E] text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-[#061A35] transition-all disabled:opacity-50 active:scale-95 shadow-lg">
                        {isCheckingOut ? <Loader2 className="animate-spin"/> : <ShieldCheck />} Bayar Sekarang
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}