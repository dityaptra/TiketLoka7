import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

// --- KONFIGURASI SEO GLOBAL ---
export const metadata: Metadata = {
  // 1. Base URL (Penting untuk SEO Gambar & Link Absolut)
  // Ganti 'https://tiketloka.com' dengan domain asli Anda saat deploy
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://tiketloka.web.id'),

  // 2. Title Template (Halaman lain cukup set title: "Nama Wisata", otomatis jadi "Nama Wisata | TiketLoka")
  title: {
    default: "TiketLoka - Booking Tiket Wisata Termurah & Mudah",
    template: "%s | TiketLoka",
  },

  // 3. Deskripsi Global
  description: "Platform pemesanan tiket wisata terbaik di Indonesia. Temukan destinasi impianmu, pesan tiket dengan mudah, dan nikmati liburan tanpa ribet.",

  // 4. Kata Kunci Global
  keywords: ["tiket wisata", "booking online", "wisata bali", "liburan murah", "tiketloka"],

  // 5. Open Graph (Tampilan saat link dishare di WA/FB/IG)
  openGraph: {
    title: "TiketLoka - Jelajahi Indonesia",
    description: "Pesan tiket wisata favoritmu sekarang di TiketLoka.",
    url: "https://tiketloka.com",
    siteName: "TiketLoka",
    images: [
      {
        url: "/images/og-image-default.jpg", // Pastikan ada gambar default di folder public/images
        width: 1200,
        height: 630,
        alt: "TiketLoka Banner",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  // 6. Twitter Card (Tampilan di Twitter/X)
  twitter: {
    card: "summary_large_image",
    title: "TiketLoka - Booking Wisata Mudah",
    description: "Liburan impian tinggal satu klik.",
    // images: ["/images/og-image-default.jpg"],
  },

  // 8. Ikon Aplikasi
  icons: {
    icon: "/icon.png",
    shortcut: "/icon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} bg-gray-50 min-h-[100dvh] overscroll-none antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <div className="relative w-full">
                {children}
                <Toaster position="top-center" reverseOrder={false} />
              </div>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}