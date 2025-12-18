// --- USER ---
export interface User {
  id: number;
  name: string;
  email: string;
}

// --- CATEGORY ---
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string; // Opsional: untuk ikon di homepage
}

// --- SUB-INTERFACES (PENTING UNTUK FITUR BARU) ---
export interface DestinationImage {
  id: number;
  image_path: string;
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

// --- DESTINATION (DIGABUNGKAN) ---
export interface Destination {
  // Field Dasar (Sesuai Request Anda)
  id: number;
  name: string;
  slug: string; // <--- WAJIB ADA
  location: string;
  image_url: string | null;
  price: number;
  description?: string;
  category_id?: number;
  category?: Category; 
  is_active?: boolean | number;

  // Field Tambahan (Opsional) - Agar fitur Galeri & Paket berjalan
  images?: DestinationImage[]; // Galeri Foto
  inclusions?: Inclusion[];    // Fasilitas Termasuk
  addons?: Addon[];            // Upgrade Paket
  reviews?: Review[];          // Ulasan User
}

// --- BOOKING ---
export interface BookingDetail {
  id: number;
  destination: Destination;
  quantity: number;
  visit_date: string;
  subtotal: number;
  
  // Tambahan untuk fitur Scan QR
  ticket_code?: string;
  redeemed_at?: string | null;
}

export interface Booking {
  id: number;
  booking_code: string;
  grand_total: number;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  paid_at: string;
  qr_string: string;
  created_at: string;
  details: BookingDetail[];
  user?: User; // Opsional: Relasi ke pemesan
}

// --- CART ---
export interface CartItem {
  id: number;
  user_id: number;
  destination_id: number;
  quantity: number;
  visit_date: string;
  total_price: number;
  destination: Destination;
}