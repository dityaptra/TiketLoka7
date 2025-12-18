'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star, Loader2, MessageSquare, Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  user: { name: string };
  rating: number;
  comment: string;
  image: string | null;
  created_at: string;
}

// KONFIGURASI URL API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Helper URL Gambar
const getImageUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `${BASE_URL}/storage/${cleanPath}`;
};

export default function ReviewSection({ destinationId }: { destinationId: number }) {
  const { token, user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/${destinationId}`);
      const json = await res.json();
      setReviews(json.data || []);
    } catch (err) {
      console.error("Gagal load review", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationId]);

  // Handle Pilih Gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran (Max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Hapus Gambar
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle Submit Review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Silakan login untuk memberi ulasan");
      return;
    }
    if (rating === 0) {
      toast.error("Mohon berikan bintang (1-5)");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('destination_id', destinationId.toString());
      formData.append('rating', rating.toString());
      formData.append('comment', comment);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json', // PENTING: Tambahkan ini!
        },
        body: formData 
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Ulasan berhasil dikirim!", { icon: '⭐' });
        setComment('');
        setRating(0);
        removeImage();
        fetchReviews(); 
      } else {
        toast.error(json.message || "Gagal mengirim ulasan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">
      <h2 className="text-2xl font-bold text-[#0B2F5E] mb-6 flex items-center gap-2">
        <Star className="fill-yellow-400 text-yellow-400" /> Ulasan Pengunjung
      </h2>

      {/* FORM INPUT REVIEW */}
      {user ? (
        <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">Tulis Pengalaman Anda</h3>
          <p className="text-sm text-gray-500 mb-4">Bagikan cerita dan foto seru Anda di sini.</p>
          
          <form onSubmit={handleSubmit}>
            {/* Rating Bintang */}
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={36} 
                    className={`${
                      star <= (hoverRating || rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'fill-gray-200 text-gray-200'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              disabled={submitting}
              className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm mb-3 min-h-[120px] shadow-sm disabled:bg-gray-100"
            ></textarea>

            {/* AREA UPLOAD GAMBAR */}
            <div className="mb-4">
              {!imagePreview ? (
                <div>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden" 
                    id="review-image-upload"
                  />
                  <label 
                    htmlFor="review-image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 cursor-pointer hover:bg-gray-50 transition shadow-sm"
                  >
                    <Camera className="w-4 h-4" /> Tambah Foto
                  </label>
                </div>
              ) : (
                <div className="relative w-fit">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="bg-[#0B2F5E] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#09254A] transition disabled:opacity-70 flex items-center gap-2 shadow-md"
            >
              {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Kirim Ulasan"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-xl text-center mb-8 border border-blue-100">
          <p className="text-[#0B2F5E] text-sm">Silakan <b>Login</b> untuk menulis ulasan.</p>
        </div>
      )}

      {/* LIST REVIEW */}
      {loading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-yellow-400 mx-auto"/></div>
      ) : reviews.length > 0 ? (
        <div className="space-y-8">
          {reviews.map((rev) => (
            <div key={rev.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0B2F5E]/10 rounded-full flex items-center justify-center text-[#0B2F5E] font-bold">
                    {rev.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{rev.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-yellow-600 text-sm">{rev.rating}.0</span>
                </div>
              </div>

              {/* Komentar */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3 pl-[52px]">
                {rev.comment || <span className="italic text-gray-400">Tidak ada komentar tertulis.</span>}
              </p>

              {/* TAMPILKAN GAMBAR REVIEW */}
              {rev.image && getImageUrl(rev.image) && (
                <div className="pl-[52px]">
                  <div className="relative h-40 w-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition">
                    <img 
                      src={getImageUrl(rev.image)!} 
                      alt="Review Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 flex flex-col items-center text-gray-400">
          <MessageSquare size={40} className="mb-2 opacity-20" />
          <p>Belum ada ulasan untuk destinasi ini.</p>
        </div>
      )}
    </div>
  );
}