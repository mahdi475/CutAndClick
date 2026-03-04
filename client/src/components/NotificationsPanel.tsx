import React, { useEffect, useState, useCallback } from 'react';
import { X, Bell, Calendar, Star, CheckCheck, Loader2 } from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    title: string;
    body: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationsPanelProps {
    token: string | null;
    onClose: () => void;
}

function timeAgo(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'just nu';
    if (diff < 3600) return `${Math.floor(diff / 60)} min sedan`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} tim sedan`;
    return `${Math.floor(diff / 86400)} d sedan`;
}

const notifIcon = (type: string) => {
    if (type === 'booking_confirmed' || type === 'new_booking') return <Calendar size={18} className="text-blue-500" />;
    if (type === 'review_received') return <Star size={18} className="text-yellow-500" />;
    return <Bell size={18} className="text-gray-400" />;
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ token, onClose }) => {
    const [notifs, setNotifs] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const load = useCallback(() => {
        if (!token) { setLoading(false); return; }
        fetch('/api/notifications', { headers })
            .then(r => r.json())
            .then(d => { setNotifs(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const markRead = async (id: number) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await fetch(`/api/notifications/${id}`, { method: 'PATCH', headers });
    };

    const markAllRead = async () => {
        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
        await fetch('/api/notifications/read-all', { method: 'PATCH', headers });
    };

    const unread = notifs.filter(n => !n.is_read).length;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-[320px] max-w-[90vw] bg-white z-50 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-5 pt-10 pb-4 flex items-center justify-between border-b border-gray-100">
                    <div>
                        <h2 className="font-inter font-bold text-[20px] text-black">Notifikationer</h2>
                        {unread > 0 && <p className="font-inter text-[13px] text-gray-400">{unread} olästa</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {unread > 0 && (
                            <button onClick={markAllRead} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                                <CheckCheck size={14} className="text-gray-500" />
                                <span className="font-inter text-[12px] text-gray-500">Rensa</span>
                            </button>
                        )}
                        <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <X size={14} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto py-2">
                    {loading ? (
                        <div className="flex justify-center pt-12"><Loader2 size={24} className="animate-spin text-black/20" /></div>
                    ) : notifs.length === 0 ? (
                        <div className="flex flex-col items-center pt-16 gap-3">
                            <Bell size={36} className="text-gray-200" />
                            <p className="font-inter text-[14px] text-gray-400">Inga notifikationer ännu</p>
                        </div>
                    ) : notifs.map(n => (
                        <button
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`w-full px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${!n.is_read ? 'bg-blue-50/60' : ''}`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.is_read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                {notifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-inter font-semibold text-[14px] leading-snug ${!n.is_read ? 'text-black' : 'text-gray-500'}`}>{n.title}</p>
                                {n.body && <p className="font-inter text-[12px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{n.body}</p>}
                                <p className="font-inter text-[11px] text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                            </div>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default NotificationsPanel;
