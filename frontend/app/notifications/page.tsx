'use client';

import Navbar from '@/components/layout/Navbar';
import { 
    Bell, CheckCircle, Tag, Info, Trash2, Check, Clock 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
// IMPORT CONTEXT
import { useNotification, NotificationType } from '@/context/NotificationContext';

export default function NotificationsPage() {
    // AMBIL DATA DARI CONTEXT
    const { notifications, unreadCount, markAllAsRead } = useNotification();
    const router = useRouter();

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'transaction': return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'promo': return <Tag className="w-6 h-6 text-[#F57C00]" />;
            case 'system': return <Info className="w-6 h-6 text-blue-500" />;
            default: return <Bell className="w-6 h-6 text-gray-500" />;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#0B2F5E] flex items-center gap-3">
                            Notifikasi 
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {unreadCount} Baru
                                </span>
                            )}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-[#0B2F5E] transition font-medium text-sm shadow-sm">
                                <Check className="w-4 h-4" /> Tandai semua dibaca
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((item) => (
                            <div key={item.id} className={`group relative flex gap-4 p-5 rounded-2xl border transition-all duration-300 ${item.isRead ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100 ring-1 ring-blue-50'}`}>
                                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${item.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-lg ${item.isRead ? 'text-gray-700' : 'text-[#0B2F5E]'}`}>{item.title}</h3>
                                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><Clock className="w-3 h-3"/> {item.date}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.message}</p>
                                </div>
                                {!item.isRead && <span className="absolute top-6 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-white"></span>}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Bell className="w-8 h-8 text-gray-300" /></div>
                            <h3 className="text-xl font-bold text-gray-800">Tidak ada notifikasi</h3>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}