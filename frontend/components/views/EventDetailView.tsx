'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartContext } from '@/context/CartContext'; 
import { useNotification } from '@/context/NotificationContext'; 
import Navbar from '@/components/layout/Navbar'; 
import { 
    MapPin, Calendar as CalendarIcon, ArrowLeft, Minus, Plus, X, CheckCircle, Check, Tag, Star, 
    ChevronLeft, ChevronRight, ShoppingCart, 
    ScanLine, Building2, Grid, Loader2, Camera, User as UserIcon, Info 
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

// --- KONFIGURASI API URL ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- TYPES ---
interface Destination {
    id: number; 
    name: string; 
    slug: string; 
    description: string; 
    price: number; 
    location: string; 
    image_url: string; 
    category?: { name: string };
    images?: { id: number; image: string }[]; 
    inclusions?: { id: number; name: string }[]; 
    addons?: { id: number; name: string; price: number }[]; 
    reviews?: {
        id: number;
        rating: number;
        comment: string;
        created_at: string;
        image?: string;
        user?: { name: string; avatar_url?: string; };
    }[];
}

// --- HELPERS ---
const getImageUrl = (url: string | null) => {
    if (!url) return 'https://placehold.co/800x600?text=No+Image';
    if (url.startsWith('http')) return url;
    const path = url.startsWith('/') ? url.substring(1) : url;
    if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
    return `${API_BASE_URL}/storage/${path}`;
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const getDayName = (date: Date) => date.toLocaleDateString('id-ID', { weekday: 'short' });

const formatDateValue = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset*60*1000));
    return localDate.toISOString().split('T')[0];
};

const isHoliday = (date: Date) => {
    const day = date.getDay();
    const dateStr = formatDateValue(date);
    if (day === 0) return true;
    const publicHolidays = ['2025-12-25', '2025-12-26', '2026-01-01'];
    return publicHolidays.includes(dateStr);
};

// --- MAIN COMPONENT ---
export default function EventDetailView({ slug }: { slug: string }) {
    const params = useParams();
    const router = useRouter();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/destinations/${params.slug}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error('Gagal mengambil data');
            const json = await res.json();
            if (json.data) setDestination(json.data);
            else toast.error("Data tidak ditemukan");
        } catch (err) { 
            console.error("Fetch Error:", err); 
            toast.error("Terjadi kesalahan koneksi");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { if (params.slug) fetchDetail(); }, [params.slug]);

    if (loading) return <DetailSkeleton />;
    if (!destination) return null;

    return (
        <main className="min-h-screen bg-white text-gray-800 pb-20 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
                <div className="mb-12">
                    <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-[#0B2F5E] flex items-center gap-2 mb-6 transition font-medium group">
                        <div className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-colors"><ArrowLeft className="w-4 h-4"/></div> 
                        Kembali ke Jelajah
                    </button>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2F5E] mb-4 leading-tight">{destination.name}</h1>
                            <div className="flex flex-wrap items-center text-gray-600 text-sm gap-4 mb-6">
                                <div className="flex items-center gap-1.5 font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <MapPin className="w-4 h-4 text-[#F57C00]" /><span>{destination.location}</span>
                                </div>
                                {destination.category && <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-100">{destination.category.name}</span>}
                                {destination.reviews && destination.reviews.length > 0 && (
                                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-yellow-100 bg-yellow-50/50">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold text-gray-900">{(destination.reviews.reduce((a, b) => a + b.rating, 0) / destination.reviews.length).toFixed(1)}</span>
                                        <span className="text-gray-400 text-xs">({destination.reviews.length} Ulasan)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <GallerySection destination={destination} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
                    <div className="lg:col-span-2 space-y-10">
                        <DescriptionSection destination={destination} />
                        <ReviewSection destination={destination} onRefresh={fetchDetail} />
                    </div>
                    <div className="relative h-full">
                        <BookingCard destination={destination} />
                    </div>
                </div>
            </div>
        </main>
    );
}

// --- SUB-COMPONENTS ---

function DetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8 animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 w-3/4 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-4 gap-2 h-[400px] rounded-3xl overflow-hidden mb-8">
                <div className="col-span-2 row-span-2 bg-gray-200"></div>
                <div className="bg-gray-200"></div><div className="bg-gray-200"></div>
                <div className="bg-gray-200"></div><div className="bg-gray-200"></div>
            </div>
        </div>
    );
}

function GallerySection({ destination }: { destination: Destination }) {
    const [isOpen, setIsOpen] = useState(false);
    const [idx, setIdx] = useState(0);
    const allImages = [{ id: 9999, image: destination.image_url }, ...(destination.images || [])].filter(img => img.image);
    const displayImages = allImages.slice(0, 5);
    const remainingCount = allImages.length - 5;
    const getGridClass = (index: number) => index === 0 ? 'col-span-4 md:col-span-2 row-span-2 h-[300px] md:h-[460px]' : 'col-span-2 md:col-span-1 row-span-1 h-[145px] md:h-[226px]';

    return (
        <>
            <div className="grid grid-cols-4 gap-2 rounded-3xl overflow-hidden shadow-sm relative group bg-gray-50 border border-gray-100 p-1">
                {displayImages.map((img, i) => (
                    <div key={i} onClick={() => { setIdx(i); setIsOpen(true); }} className={`relative cursor-pointer overflow-hidden rounded-xl hover:brightness-95 transition duration-300 ${getGridClass(i)}`}>
                        <Image src={getImageUrl(img.image)} alt={`Gallery ${i}`} fill className="object-cover hover:scale-105 transition duration-700" unoptimized priority={i === 0} />
                        {i === 4 && remainingCount > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] transition hover:bg-black/70">
                                <span className="text-white font-bold text-lg md:text-xl flex flex-col items-center">+{remainingCount} <span className="text-xs font-normal opacity-80">Lainnya</span></span>
                            </div>
                        )}
                    </div>
                ))}
                <button onClick={() => { setIdx(0); setIsOpen(true); }} className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-[#0B2F5E] px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm transition active:scale-95 border border-gray-200"><Grid className="w-4 h-4" /> Lihat Semua Foto</button>
            </div>
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
                    <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-10 bg-white/10 rounded-full transition"><X className="w-6 h-6"/></button>
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + allImages.length) % allImages.length); }} className="absolute left-4 md:left-8 text-white/80 hover:text-white p-3 z-10 bg-white/10 rounded-full transition hover:bg-white/20"><ChevronLeft className="w-8 h-8"/></button>
                    <div className="relative w-full max-w-6xl h-[80vh] p-4 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl"><Image src={getImageUrl(allImages[idx].image)} alt="Full" fill className="object-contain" unoptimized /></div>
                        <p className="text-white/70 mt-4 text-sm font-medium tracking-widest">{idx + 1} / {allImages.length}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % allImages.length); }} className="absolute right-4 md:right-8 text-white/80 hover:text-white p-3 z-10 bg-white/10 rounded-full transition hover:bg-white/20"><ChevronRight className="w-8 h-8"/></button>
                </div>
            )}
        </>
    );
}

function DescriptionSection({ destination }: { destination: Destination }) {
    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-8 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-[#0B2F5E]">Tentang Aktivitas Ini</h2>
                <div className="prose prose-lg text-gray-600 text-justify max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: destination.description }} />
            </div>
            {destination.inclusions && destination.inclusions.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-[#0B2F5E] mb-4 flex gap-2 text-lg"><CheckCircle className="w-6 h-6 text-green-500"/> Apa yang termasuk?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                        {destination.inclusions.map(inc => (
                            <div key={inc.id} className="flex gap-3 text-gray-700 font-medium items-start"><Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5"/> <span>{inc.name}</span></div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ReviewSection({ destination, onRefresh }: { destination: Destination, onRefresh: () => void }) {
    const { token } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ rating: 0, comment: '', image: null as File | null });
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) { toast.error("Silakan login dulu"); return router.push('/login'); }
        if (form.rating === 0) return toast.error('Pilih bintang rating!');
        if (!form.comment) return toast.error('Isi komentar Anda!');
        setSubmitting(true);
        const data = new FormData();
        data.append('destination_id', String(destination.id));
        data.append('rating', String(form.rating));
        data.append('comment', form.comment);
        if (form.image) data.append('image', form.image);
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data });
            if (res.ok) { toast.success('Ulasan terkirim!'); setForm({ rating: 0, comment: '', image: null }); setPreview(null); onRefresh(); }
            else { toast.error('Gagal mengirim ulasan'); }
        } catch { toast.error('Error koneksi server'); } finally { setSubmitting(false); }
    };

    return (
        <div className="border-t border-gray-100 pt-8 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-[#0B2F5E]">Ulasan ({destination.reviews?.length || 0})</h2>
            {token ? (
                <form onSubmit={submit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 shadow-sm">
                    <div className="flex gap-2 mb-4">{[1,2,3,4,5].map(s => (<button key={s} type="button" onClick={() => setForm({...form, rating: s})} className="transition hover:scale-110 active:scale-95"><Star className={`w-8 h-8 ${s <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}/></button>))}</div>
                    <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-[#0B2F5E] outline-none" placeholder="Ceritakan pengalamanmu..." rows={3}></textarea>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-50"><Camera className="w-4 h-4"/> Foto <input type="file" accept="image/*" className="hidden" onChange={e => { if(e.target.files?.[0]) { setForm({...form, image: e.target.files[0]}); setPreview(URL.createObjectURL(e.target.files[0])); }}} /></label>
                        {preview && <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200"><Image src={preview} alt="Prev" fill className="object-cover" unoptimized /><button onClick={(e) => {e.preventDefault(); setPreview(null); setForm({...form, image: null})}} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X className="w-3 h-3"/></button></div>}
                        <button disabled={submitting} className="bg-[#0B2F5E] text-white px-6 py-2 rounded-xl font-bold ml-auto disabled:opacity-50 hover:bg-[#09254A] shadow-md">{submitting ? 'Mengirim...' : 'Kirim'}</button>
                    </div>
                </form>
            ) : <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-8 border border-blue-100 flex items-center gap-2"><Info className="w-5 h-5"/>Silakan <span className="font-bold underline cursor-pointer" onClick={() => router.push('/login')}>Login</span> untuk mereview.</div>}
            <div className="space-y-6">
                {destination.reviews?.length ? destination.reviews.map((r: any) => (
                    <div key={r.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200 shrink-0 relative overflow-hidden">{r.user?.avatar_url ? (<Image src={getImageUrl(r.user.avatar_url)} alt={r.user.name} fill className="object-cover" unoptimized />) : (<UserIcon className="w-6 h-6"/>)}</div>
                        <div>
                            <div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-gray-900">{r.user?.name || 'Pengunjung'}</h4><span className="text-xs text-gray-400">{formatDate(r.created_at)}</span></div>
                            <div className="flex mb-2">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}/>)}</div>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-xl rounded-tl-none">"{r.comment}"</p>
                            {r.image && <div className="mt-3 w-32 h-24 relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90"><Image src={getImageUrl(r.image)} alt="Review" fill className="object-cover" unoptimized /></div>}
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 italic py-4">Belum ada ulasan.</p>}
            </div>
        </div>
    );
}

// --- FIXED BOOKING CARD ---
function BookingCard({ destination }: { destination: Destination }) {
    const { token } = useAuth();
    const router = useRouter();
    const [date, setDate] = useState('');
    const [qty, setQty] = useState(1);
    const [addons, setAddons] = useState<number[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('qris');
    const [processing, setProcessing] = useState(false);
    const { refreshCart } = useCartContext(); 
    const { addNotification } = useNotification(); 
    const [addingToCart, setAddingToCart] = useState(false); 
    const [currentViewDate, setCurrentViewDate] = useState(new Date());

    // PERBAIKAN: Gunakan Number() untuk memastikan harga bukan string
    const total = useMemo(() => {
        const basePrice = Number(destination.price) || 0;
        const addonPriceSum = addons.reduce((acc, id) => {
            const found = destination.addons?.find(a => a.id === id);
            return acc + (Number(found?.price) || 0);
        }, 0);
        return (basePrice + addonPriceSum) * qty;
    }, [destination.price, destination.addons, addons, qty]);

    const toggleAddon = (id: number) => setAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const getDaysInViewMonth = () => {
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) { days.push(new Date(date)); date.setDate(date.getDate() + 1); }
        return days;
    };

    const daysInView = getDaysInViewMonth();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentViewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentViewDate(newDate);
    };

    const handleAddToCart = async () => {
        if (!token) return router.push('/login');
        if (!date) return toast.error('Pilih tanggal!');
        setAddingToCart(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ destination_id: destination.id, quantity: qty, visit_date: date, addons: addons })
            });
            if (res.ok) { toast.success('Masuk keranjang!'); await refreshCart(); }
            else { toast.error('Gagal menambahkan'); }
        } catch { toast.error('Gagal menghubungi server'); } finally { setAddingToCart(false); }
    };

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/buy-now`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ destination_id: destination.id, quantity: qty, visit_date: date, addons: addons, payment_method: paymentMethod })
            });
            const json = await res.json();
            if (res.ok) { 
                toast.success('Pesanan dibuat!'); 
                addNotification('transaction', 'Menunggu Pembayaran', `Berhasil memesan ${destination.name}.`);
                router.push(`/payment/${json.booking_code}`); 
            } else { toast.error(json.message || 'Gagal'); }
        } catch { toast.error('Error server'); } finally { setProcessing(false); }
    };

    return (
        <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-200/40">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                    <span className="text-xs text-gray-400 font-medium block">Mulai dari</span>
                    <div className="text-3xl font-extrabold text-[#F57C00]">Rp {Number(destination.price).toLocaleString('id-ID')}</div>
                </div>
                <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">per orang</span>
            </div>
            
            <div className="space-y-6 mb-6">
                <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-[#F57C00]"/> Pilih Tanggal Kunjungan</label>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl mb-2 border border-gray-100">
                        <button onClick={() => changeMonth(-1)} disabled={currentViewDate.getMonth() === today.getMonth()} className="p-1 disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
                        <span className="text-sm font-bold text-[#0B2F5E]">{currentViewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="p-1"><ChevronRight className="w-5 h-5"/></button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                        {daysInView.map((d, i) => {
                            const val = formatDateValue(d); const isSelected = date === val; const isRed = isHoliday(d); const isPast = d < today;
                            return (
                                <button key={i} onClick={() => !isPast && setDate(val)} disabled={isPast} className={`flex flex-col items-center p-2 rounded-xl border transition-all ${isPast ? 'bg-gray-100 opacity-50' : isSelected ? 'bg-[#0B2F5E] text-white border-[#0B2F5E]' : isRed ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                                    <span className="text-[10px] uppercase">{getDayName(d)}</span>
                                    <span className="text-base font-bold">{d.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">Jumlah Peserta</label>
                    <div className="flex justify-between items-center p-1 bg-gray-50 rounded-xl border border-gray-200">
                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition"><Minus className="w-4 h-4"/></button>
                        <span className="font-bold text-gray-800 text-lg">{qty}</span>
                        <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center bg-[#0B2F5E] text-white rounded-lg transition"><Plus className="w-4 h-4"/></button>
                    </div>
                </div>
                {destination.addons && destination.addons.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 flex gap-1 items-center"><Tag className="w-3 h-3"/> Add-ons</label>
                        {destination.addons.map(a => (
                            <div key={a.id} onClick={() => toggleAddon(a.id)} className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition ${addons.includes(a.id) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}>
                                <div className="flex gap-2 items-center"><div className={`w-4 h-4 rounded border flex items-center justify-center ${addons.includes(a.id) ? 'bg-blue-500 border-blue-500' : ''}`}>{addons.includes(a.id) && <Check className="w-3 h-3 text-white"/>}</div><span className="text-sm font-medium text-gray-700">{a.name}</span></div>
                                <span className="text-sm font-bold text-[#F57C00]">+Rp {Number(a.price).toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-between pt-4 border-t border-gray-100"><span className="font-medium text-gray-500">Total Harga</span><span className="font-extrabold text-2xl text-[#0B2F5E]">Rp {total.toLocaleString('id-ID')}</span></div>
            </div>
            <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={addingToCart} className="flex-1 flex justify-center py-3.5 border-2 border-[#F57C00] text-[#F57C00] rounded-xl font-bold transition disabled:opacity-50">{addingToCart ? <Loader2 className="animate-spin"/> : <ShoppingCart/>}</button>
                <button onClick={() => { if(!token) return router.push('/login'); if(!date) return toast.error('Pilih tanggal!'); setModalOpen(true); }} className="flex-[1.5] bg-[#0B2F5E] text-white py-3.5 rounded-xl font-bold transition">Pesan Sekarang</button>
            </div>
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#0B2F5E] px-6 py-4 flex justify-between text-white font-bold items-center"><span>Konfirmasi</span><button onClick={() => setModalOpen(false)}><X/></button></div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Tiket ({qty}x)</span><span className="font-medium">Rp {(Number(destination.price) * qty).toLocaleString('id-ID')}</span></div>
                                {addons.length > 0 && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Add-ons</span><span className="font-medium">Rp {(total - (Number(destination.price) * qty)).toLocaleString('id-ID')}</span></div>}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <div onClick={() => setPaymentMethod('qris')} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${paymentMethod === 'qris' ? 'border-[#F57C00] bg-orange-50' : 'border-gray-200'}`}><ScanLine/><span className="text-sm font-bold">QRIS (Instant)</span></div>
                                <div onClick={() => setPaymentMethod('bca')} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${paymentMethod === 'bca' ? 'border-[#F57C00] bg-orange-50' : 'border-gray-200'}`}><Building2/><span className="text-sm font-bold">Bank Transfer (BCA)</span></div>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total Bayar</span><span className="text-[#F57C00]">Rp {total.toLocaleString('id-ID')}</span></div>
                            <button onClick={handleCheckout} disabled={processing} className="w-full bg-[#0B2F5E] text-white py-3 rounded-xl font-bold">{processing ? 'Memproses...' : 'Bayar Sekarang'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}