'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
    Loader2, Copy, Clock, AlertCircle, 
    CheckCircle2, XCircle, ChevronLeft, ScanLine, 
    Building2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

// --- 1. UPDATE INTERFACE ---
interface BookingDetail {
    id: number;
    booking_code: string;
    grand_total: number;
    status: 'pending' | 'paid' | 'cancelled';
    payment_method: string; 
    created_at: string;
    destination: {
        name: string;
        location: string;
    };
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

    // KONFIGURASI URL API
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

    // --- TIMER ---
    useEffect(() => {
        if (!booking || booking.status !== 'pending') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
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
            // Simulasi Bayar Sukses via API Backend
            const res = await fetch(`${BASE_URL}/api/bookings/${booking?.booking_code}/pay`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            const json = await res.json();

            if (res.ok) {
                toast.success("Pembayaran Dikonfirmasi!");
                await fetchBooking(); 
            } else {
                toast.error(json.message || "Gagal konfirmasi");
            }
        } catch (error) {
            toast.error("Gagal menghubungi server");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
        setProcessing(true);
        try {
            const res = await fetch(`${BASE_URL}/api/bookings/${booking?.booking_code}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Pesanan dibatalkan");
                setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
            } else {
                toast.error("Gagal membatalkan");
            }
        } catch (error) {
            toast.error("Error server");
        } finally {
            setProcessing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Disalin!");
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50"><Loader2 className="animate-spin text-[#0B2F5E] w-10 h-10"/></div>;
    if (!booking) return null;

    // --- VARIABEL UNTUK TAMPILAN DINAMIS ---
    const isQRIS = booking.payment_method === 'qris';
    const bankName = "Bank Central Asia (BCA)";
    const bankAccount = "8277 1234 5678"; // Nomor Rekening Dummy
    const bankHolder = "PT TIKETLOKA INDONESIA";

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">
            <Navbar />
            
            <div className="max-w-xl mx-auto px-4 pt-28">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#0B2F5E] mb-6 transition font-medium text-sm">
                    <ChevronLeft size={18}/> Kembali
                </button>

                {booking.status === 'pending' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Timer Alert */}
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-100 p-2.5 rounded-full">
                                    <Clock className="text-[#F57C00] w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-orange-700 font-bold uppercase tracking-wide">Sisa Waktu Bayar</p>
                                    <p className="text-[#F57C00] font-extrabold text-2xl font-mono">{formatTime(timeLeft)}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-orange-200 text-orange-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Pending</span>
                        </div>

                        {/* Main Payment Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                            {/* Header Card */}
                            <div className="bg-[#0B2F5E] p-8 text-center text-white relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <p className="text-sm text-blue-100 mb-1 font-medium relative z-10">Total Tagihan</p>
                                <div className="flex items-center justify-center gap-2 relative z-10">
                                    <h1 className="text-4xl font-extrabold tracking-tight">
                                        Rp {(booking.grand_total || 0).toLocaleString('id-ID')}
                                    </h1>
                                    <button onClick={() => copyToClipboard(String(booking.grand_total))} className="p-1.5 hover:bg-white/10 rounded-lg transition"><Copy size={18}/></button>
                                </div>
                                <div className="mt-4 flex justify-center relative z-10">
                                    <span className="text-xs bg-white/20 px-4 py-1.5 rounded-full font-medium text-white backdrop-blur-sm border border-white/10">ID: {booking.booking_code}</span>
                                </div>
                            </div>

                            {/* --- DYNAMIC BODY CONTENT --- */}
                            <div className="p-8 flex flex-col items-center">
                                
                                {isQRIS ? (
                                    // --- TAMPILAN QRIS ---
                                    <>
                                        <div className="text-center mb-8">
                                            <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2 justify-center">
                                                <ScanLine className="w-5 h-5 text-[#0B2F5E]"/> Scan QRIS
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1">Gunakan GoPay, OVO, Dana, BCA, dll.</p>
                                        </div>
                                        <div className="relative group bg-white p-4 rounded-3xl border-2 border-dashed border-gray-300 mb-8 transition-all hover:border-[#0B2F5E]">
                                            <QRCodeSVG value={booking.qris_string || `TIKETLOKA-${booking.booking_code}`} size={220} level="H" includeMargin={true} />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-white px-2 py-1 rounded font-bold text-[10px] text-[#0B2F5E] shadow-sm border border-gray-100">QRIS</div></div>
                                        </div>
                                    </>
                                ) : (
                                    // --- TAMPILAN TRANSFER BANK ---
                                    <>
                                        <div className="text-center mb-8">
                                            <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2 justify-center">
                                                <Building2 className="w-5 h-5 text-[#0B2F5E]"/> Transfer Bank
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1">Silakan transfer ke rekening berikut.</p>
                                        </div>
                                        
                                        <div className="w-full bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 size={80} /></div>
                                            
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Bank Tujuan</p>
                                            <p className="font-bold text-gray-800 text-lg mb-4">{bankName}</p>
                                            
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Nomor Rekening</p>
                                            <div className="flex items-center gap-3 mb-4">
                                                <p className="font-mono text-2xl font-bold text-[#0B2F5E] tracking-wider">{bankAccount}</p>
                                                <button onClick={() => copyToClipboard(bankAccount.replace(/\s/g, ''))} className="p-2 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-100"><Copy size={16}/></button>
                                            </div>

                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Atas Nama</p>
                                            <p className="font-bold text-gray-800">{bankHolder}</p>
                                        </div>
                                    </>
                                )}

                                {/* Action Buttons (Sama untuk keduanya) */}
                                <div className="w-full space-y-3">
                                    <button 
                                        onClick={handleCheckStatus} 
                                        disabled={processing}
                                        className="w-full bg-[#005eff] hover:bg-[#004bc7] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {processing ? <Loader2 className="animate-spin w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
                                        Saya Sudah Bayar
                                    </button>
                                    
                                    <button 
                                        onClick={handleCancelOrder}
                                        disabled={processing}
                                        className="w-full bg-white border border-gray-200 text-gray-500 font-bold py-4 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5"/>
                                        Batalkan Pesanan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Instructions (Dinamis) */}
                        <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <AlertCircle size={18} className="text-blue-500"/> Cara Pembayaran
                            </h4>
                            <ul className="space-y-3">
                                {isQRIS ? (
                                    [
                                        "Buka aplikasi e-wallet atau mobile banking.",
                                        "Pilih menu 'Scan QRIS'.",
                                        "Arahkan kamera ke kode QR.",
                                        "Periksa nama merchant 'TiketLoka Official'.",
                                        "Selesaikan pembayaran & Klik 'Saya Sudah Bayar'."
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-600"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">{i+1}</span>{step}</li>
                                    ))
                                ) : (
                                    [
                                        "Buka aplikasi Mobile Banking atau ATM.",
                                        "Pilih menu 'Transfer Antar Bank' atau 'Sesama Bank'.",
                                        "Masukkan nomor rekening yang tertera di atas.",
                                        "Pastikan jumlah transfer sesuai hingga 3 digit terakhir.",
                                        "Simpan bukti transfer & Klik 'Saya Sudah Bayar'."
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-600"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">{i+1}</span>{step}</li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {booking.status === 'cancelled' && (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl shadow-sm border border-gray-100 animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Dibatalkan</h2>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">Pesanan ini telah dibatalkan.</p>
                        <button onClick={() => router.push('/')} className="bg-[#0B2F5E] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#09254A] transition shadow-lg">Cari Wisata Lain</button>
                    </div>
                )}

                {booking.status === 'paid' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="animate-spin w-10 h-10 text-green-600 mb-4"/>
                        <p className="text-gray-600 font-medium">Mengalihkan ke tiket...</p>
                    </div>
                )}
            </div>
        </div>
    );
}