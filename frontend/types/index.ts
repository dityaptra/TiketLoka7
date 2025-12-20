// --- USER ---
export interface User {
  id: number;
  name: string;
  email: string;
  // Tambahan wajib agar AuthContext & Middleware berjalan
  role?: string; 
  avatar_url?: string;
}

// --- CATEGORY ---
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string; 
  image_url?: string; // Fallback jika backend kirim image_url
}

// --- SUB-INTERFACES ---
export interface DestinationImage {
  id: number;
  // Support kedua penamaan dari backend agar aman
  image_path?: string; 
  image?: string; 
}

export interface Inclusion {
  id: number;
  name: string;
}

export interface Addon {
  id: number;
  name: string;
  price: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  image?: string | null;
  created_at: string;
  user: User;
}

// --- DESTINATION ---
export interface Destination {
  rating: any;
  id: number;
  name: string;
  slug: string; 
  location: string;
  image_url: string | null;
  price: number;
  description?: string;
  category_id?: number;
  category?: Category; 
  is_active?: boolean | number;
  
  // Field Tambahan untuk UI (Jumlah Terjual)
  sold_count?: number;

  // Relasi
  images?: DestinationImage[]; 
  inclusions?: Inclusion[];    
  addons?: Addon[]; // Daftar Addon yang TERSEDIA untuk dibeli
  reviews?: Review[];          
}

// --- BOOKING ---
export interface BookingDetail {
  id: number;
  destination: Destination;
  quantity: number;
  visit_date: string;
  subtotal: number;
  price?: number; // Opsional: harga satuan saat transaksi
  
  // Fitur Scan QR
  ticket_code?: string;
  redeemed_at?: string | null;

  // PENTING: Properti ini WAJIB ADA agar halaman MyTicketsPage tidak error
  // Menyimpan ID addon yang dipilih user saat booking
  addons?: string | number[] | null; 
}

export interface Booking {
  id: number;
  booking_code: string;
  grand_total: number;
  // Gabungan status backend & frontend logic
  status: 'pending' | 'success' | 'failed' | 'paid' | 'cancelled'; 
  payment_method: string;
  paid_at?: string | null;
  qr_string?: string;
  created_at: string;
  details: BookingDetail[];
  user?: User; 
}

// --- CART ---
export interface CartItem {
  id: number;
  user_id: number;
  destination_id: number;
  quantity: number;
  visit_date: string;
  total_price: number; // atau subtotal
  destination: Destination;
  // Menyimpan addon yang dipilih di keranjang
  addons?: number[]; 
}

// --- AUTH ---
export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}