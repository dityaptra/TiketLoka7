'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Tipe Data Notifikasi
export type NotificationType = 'transaction' | 'promo' | 'system';

export interface NotificationItem {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    date: string;
    isRead: boolean;
}

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    addNotification: (type: NotificationType, title: string, message: string) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    addNotification: () => {},
    markAllAsRead: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    // Data Dummy Awal (Agar tidak kosong saat demo)
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: 1,
            type: 'promo',
            title: 'Selamat Datang!',
            message: 'Terima kasih telah bergabung dengan TiketLoka.',
            date: 'Baru saja',
            isRead: false,
        }
    ]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Fungsi Menambah Notifikasi Baru
    const addNotification = (type: NotificationType, title: string, message: string) => {
        const newNotif: NotificationItem = {
            id: Date.now(), // ID unik berdasarkan timestamp
            type,
            title,
            message,
            date: 'Baru saja',
            isRead: false, // Default belum dibaca (Badge Merah Muncul)
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);