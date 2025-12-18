'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface CartContextType {
    cartCount: number;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    cartCount: 0,
    refreshCart: async () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);
    const { token } = useAuth();

    // KONFIGURASI URL API
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    // Fungsi untuk cek ulang jumlah keranjang ke API Backend
    // Menggunakan useCallback agar fungsi tidak dibuat ulang setiap render (mencegah infinite loop di useEffect)
    const refreshCart = useCallback(async () => {
        if (!token) {
            setCartCount(0);
            return;
        }

        try {
            // Menggunakan BASE_URL
            const res = await fetch(`${BASE_URL}/api/cart`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (res.ok && json.data) {
                // Hitung jumlah item
                setCartCount(json.data.length);
            }
        } catch (error) {
            console.error("Gagal memuat keranjang", error);
        }
    }, [token, BASE_URL]);

    // Load data cart saat pertama kali login/buka web
    useEffect(() => {
        refreshCart();
    }, [refreshCart]); // Sekarang aman memasukkan refreshCart sebagai dependency

    return (
        <CartContext.Provider value={{ cartCount, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => useContext(CartContext);