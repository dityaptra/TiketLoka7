'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
    Loader2, Copy, Clock, AlertCircle, 
    CheckCircle2, XCircle, ChevronLeft, ScanLine, 
    Building2, PlusCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';

// --- 1. DEFINISI INTERFACE ---
interface AddonDetail {
    id: number;
    name: string;
    price: number;
}

interface BookingItem {
    id: number;
    quantity: number;
    price: number; // Harga unit tiket
    subtotal: number;
    destination: {
        name: string;
        location: string;
        price: number;
        addons?: AddonDetail[]; // Master data addons untuk lookup
    };
    addons: any; // Bisa JSON string "[1,2]" atau array [1,2]
}

interface BookingDetail {
    id: number;
    booking_code: string;
    grand_total: number;
    status: 'pending' | 'paid' | 'cancelled';
    payment_method: string; 
    created_at: string;
    details: BookingItem[]; // Rincian tiket dalam pesanan
    qris_string?: string; 
}

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); 

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    // --- FETCH DATA ---
    const fetchBooking = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/bookings/${params.code}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (res.ok) {
                setBooking(json.data);
                if (json.data.status === 'paid') {
                    toast.success("Pembayaran berhasil!");
                    router.replace(`/tickets/${json.data.booking_code}`);
                }
            } else {
                toast.error("Data pesanan tidak ditemukan");
                router.push('/');
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }, [params.code, token, router, BASE_URL]);

    useEffect(() => {
        if (token) fetchBooking();
    }, [token, fetchBooking]);

    // --- KALKULASI RINCIAN HARGA (TIKET + ADDONS) ---
    const priceBreakdown = useMemo(() => {
        if (!booking || !booking.details) return [];
        
        return booking.details.map(item => {
            const qty = Number(item.quantity) || 0;
            const ticketPrice = Number(item.price || item.destination.price);
            
            // Parsing Addon yang dipilih
            let selectedAddonIds: any[] = [];
            try {
                selectedAddonIds = Array.isArray(item.addons) 
                    ? item.addons 
                    : JSON.parse(item.addons || "[]");
            } catch (e) { selectedAddonIds = []; }

            const selectedIdsString = selectedAddonIds.map(String);

            // Lookup Nama & Harga Addon
            const masterAddons = item.destination.addons || [];
            const selectedAddonData = masterAddons.filter((a: any) => 
                selectedIdsString.includes(String(a.id))
            );

            // Gunakan subtotal dari DB jika tersedia, jika tidak hitung manual
            const finalItemTotal = Number(item.subtotal) > 0 
                ? Number(item.subtotal) 
                : (ticketPrice + selectedAddonData.reduce((s, a) => s + Number(a.price), 0)) * qty;

            return {
                name: item.destination.name,
                qty,
                addons: selectedAddonData,
                itemTotal: finalItemTotal
            };
        });
    }, [booking]);

    // --- TIMER ---
    useEffect(() => {
        if (!booking || booking.status !== 'pending') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [booking]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // --- ACTIONS ---
    const handleCheckStatus = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${BASE_URL}/api/bookings/${booking?.booking_code}/pay`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (res.ok) {
                toast.success("Pembayaran Dikonfirmasi!");
                await fetchBooking(); 
            } else {
                toast.error("Gagal konfirmasi pembayaran");
            }
        } catch (error) {
            toast.error("Gagal menghubungi server");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        const result = await Swal.fire({
            title: 'Batalkan Pesanan?',
            text: "Pesanan yang dibatalkan tidak dapat dikembalikan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Tidak',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setProcessing(true);
        try {
            const res = await fetch(`${BASE_URL}/api/bookings/${booking?.booking_code}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Pesanan berhasil dibatalkan");
                setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
            } else {
                toast.error("Gagal membatalkan pesanan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan server");
        } finally {
            setProcessing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Disalin!");
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#0B2F5E] w-10 h-10"/></div>;
    if (!booking) return null;

    const isQRIS = booking.payment_method === 'qris';
    const bankAccount = "8277 1234 5678"; 

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">
            <Navbar />
            
            <div className="max-w-xl mx-auto px-4 pt-28">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#0B2F5E] mb-6 transition font-medium text-sm">
                    <ChevronLeft size={18}/> Kembali
                </button>

                {booking.status === 'pending' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <Clock className="text-[#F57C00] w-6 h-6" />
                                <div>
                                    <p className="text-xs text-orange-700 font-bold uppercase">Sisa Waktu</p>
                                    <p className="text-[#F57C00] font-extrabold text-2xl font-mono">{formatTime(timeLeft)}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-orange-200 text-orange-800 px-2.5 py-1 rounded-full font-bold uppercase">Pending</span>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* Header Tagihan */}
                            <div className="bg-[#0B2F5E] p-8 text-center text-white relative">
                                <p className="text-sm text-blue-100 mb-1">Total Tagihan</p>
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-4xl font-extrabold">Rp {(booking.grand_total || 0).toLocaleString('id-ID')}</h1>
                                    <button onClick={() => copyToClipboard(String(booking.grand_total))} className="p-1.5 hover:bg-white/10 rounded-lg transition"><Copy size={18}/></button>
                                </div>
                                <p className="mt-4 text-xs opacity-60">ID Pesanan: {booking.booking_code}</p>
                            </div>

                            {/* --- RINCIAN PESANAN (ADDONS TERMASUK) --- */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Rincian Pesanan</h3>
                                {priceBreakdown.map((item, i) => (
                                    <div key={i} className="mb-4 last:mb-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                <p className="text-[10px] text-gray-400">{item.qty} Tiket</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800">Rp {item.itemTotal.toLocaleString('id-ID')}</p>
                                        </div>
                                        {item.addons.map((a: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-[10px] text-orange-600 pl-4 border-l border-orange-200 mt-1">
                                                <span>+ {a.name}</span>
                                                <span>Rp {(Number(a.price) * item.qty).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 flex flex-col items-center">
                                {isQRIS ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 justify-center">
                                                <ScanLine className="w-5 h-5 text-[#0B2F5E]"/> Scan QRIS
                                            </h3>
                                        </div>
                                        <div className="bg-white p-4 rounded-3xl border-2 border-dashed border-gray-300 mb-8 transition-all hover:border-[#0B2F5E]">
                                            <QRCodeSVG value={booking.qris_string || `TIKETLOKA-${booking.booking_code}`} size={200} level="H" includeMargin={true} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-100">
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">Transfer BCA</p>
                                        <div className="flex items-center gap-3 mb-4">
                                            <p className="font-mono text-2xl font-bold text-[#0B2F5E]">{bankAccount}</p>
                                            <button onClick={() => copyToClipboard(bankAccount.replace(/\s/g, ''))} className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Copy size={16}/></button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 italic">A/N PT TIKETLOKA INDONESIA</p>
                                    </div>
                                )}

                                <div className="w-full space-y-3">
                                    <button onClick={handleCheckStatus} disabled={processing} className="w-full bg-[#005eff] hover:bg-[#004bc7] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                        {processing ? <Loader2 className="animate-spin w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
                                        Konfirmasi Pembayaran
                                    </button>
                                    <button onClick={handleCancelOrder} disabled={processing} className="w-full bg-white border border-gray-200 text-gray-400 font-bold py-4 rounded-xl hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2">
                                        <XCircle size={18}/> Batalkan Pesanan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {booking.status === 'cancelled' && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in zoom-in-95">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Dibatalkan</h2>
                        <p className="text-gray-500 mb-8">Pesanan ini tidak dapat diproses lebih lanjut.</p>
                        <button onClick={() => router.push('/')} className="bg-[#0B2F5E] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg">Kembali Jelajah</button>
                    </div>
                )}
            </div>
        </div>
    );
}