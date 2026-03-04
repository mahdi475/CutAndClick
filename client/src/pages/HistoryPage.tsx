import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Clock, ArrowLeft, Loader2, MapPin, Calendar, X, Star, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal';

interface ApiBooking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: 'confirmed' | 'completed' | 'cancelled';
    service_title: string;
    service_price: number;
    barber_id: string;
    salon_name: string;
    salon_address: string;
    city: string;
    image: string;
}

interface HistoryPageProps {
    onBack: () => void;
}

function formatBookingDate(dateStr: string, timeStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    if (date.toDateString() === today.toDateString()) return `Idag, ${timeStr}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Imorgon, ${timeStr}`;
    return `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}, ${timeStr}`;
}

// ── 3-dot menu ───────────────────────────────
const BookingMenu: React.FC<{
    booking: ApiBooking;
    onCancel: (id: string) => void;
    onReview: (b: ApiBooking) => void;
    alreadyReviewed: boolean;
}> = ({ booking, onCancel, onReview, alreadyReviewed }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(o => !o)} className="w-[38px] h-[38px] bg-[#F2F2F2] rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                <MoreHorizontal size={18} className="text-black" />
            </button>
            {open && (
                <div className="absolute right-0 top-[44px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden min-w-[180px]">
                    {booking.status === 'completed' && (
                        <button
                            onClick={() => { setOpen(false); onReview(booking); }}
                            className={`w-full px-4 py-3 text-left font-inter text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-2 ${alreadyReviewed ? 'text-gray-300' : 'text-yellow-500'}`}
                            disabled={alreadyReviewed}
                        >
                            {alreadyReviewed ? <><Check size={14} /><span>Omdöme lämnat ✓</span></> : <><Star size={14} /><span>Lämna omdöme</span></>}
                        </button>
                    )}
                    {booking.status === 'confirmed' && (
                        <button
                            onClick={() => { setOpen(false); onCancel(booking.id); }}
                            className="w-full px-4 py-3 text-left font-inter text-[14px] text-red-500 hover:bg-red-50 transition-colors"
                        >
                            Avboka
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main ─────────────────────────────────────
const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [bookings, setBookings] = useState<ApiBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState<string | null>(null);
    const [cancelMsg, setCancelMsg] = useState('');
    const [reviewBooking, setReviewBooking] = useState<ApiBooking | null>(null);
    const [reviewed, setReviewed] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState('');
    const token = user?.token;

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        fetch('/api/bookings/my', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setError('Kunde inte hämta bokningar'); setLoading(false); });
    }, [token]);

    const todayStr = new Date().toISOString().slice(0, 10);
    const upcoming = bookings.filter(b => b.booking_date >= todayStr && b.status === 'confirmed');
    const past = bookings.filter(b => b.booking_date < todayStr || b.status === 'cancelled' || b.status === 'completed');

    const handleCancel = async (id: string) => {
        if (!token) return;
        setCancelling(id);
        const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) setCancelMsg(data.error || 'Avbokning misslyckades');
        else { setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)); setCancelMsg('Bokning avbokad!'); }
        setCancelling(null);
        setTimeout(() => setCancelMsg(''), 3000);
    };

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const handleReviewSuccess = (barberId: string) => {
        setReviewed(prev => new Set(prev).add(barberId));
        setReviewBooking(null);
        showToast('Tack för ditt omdöme! ⭐');
    };

    return (
        <div className="flex flex-col min-h-full bg-white relative pb-24 px-6 pt-10 md:px-10">

            {/* Header */}
            <div className="flex items-center gap-5 mb-8">
                <button onClick={onBack} className="w-[44px] h-[44px] bg-white rounded-[14px] border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="text-[#222222]" size={20} strokeWidth={2.5} />
                </button>
                <h1 className="text-[#333333] font-inter font-bold text-[24px]">Bokningar</h1>
            </div>

            {/* Toast */}
            {toast && (
                <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-xl font-inter text-[14px] text-yellow-700 flex items-center gap-2">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Cancel message */}
            {cancelMsg && (
                <div className={`mb-4 px-4 py-3 rounded-xl font-inter text-[14px] flex items-center justify-between ${cancelMsg.includes('avbokad') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    <span>{cancelMsg}</span><button onClick={() => setCancelMsg('')}><X size={14} /></button>
                </div>
            )}

            {/* Tabs */}
            <div className="w-full h-[52px] bg-[#F0F0F0] rounded-[18px] p-1 flex relative mb-8 md:max-w-md">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[15px] transition-all duration-300 shadow-sm ${activeTab === 'upcoming' ? 'left-1' : 'left-[calc(50%+2px)]'}`} />
                <button onClick={() => setActiveTab('upcoming')} className={`flex-1 z-10 font-inter font-bold text-[16px] transition-colors ${activeTab === 'upcoming' ? 'text-black' : 'text-[#6B6B6B]'}`}>
                    Kommande {upcoming.length > 0 && <span className="ml-1 text-[12px] bg-black text-white rounded-full px-1.5 py-0.5">{upcoming.length}</span>}
                </button>
                <button onClick={() => setActiveTab('past')} className={`flex-1 z-10 font-inter font-bold text-[16px] transition-colors ${activeTab === 'past' ? 'text-black' : 'text-[#6B6B6B]'}`}>
                    Gammalt
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center pt-16"><Loader2 size={28} className="animate-spin text-black/30" /></div>
            ) : error ? (
                <p className="text-red-400 font-inter text-center pt-12">{error}</p>
            ) : !token ? (
                <p className="text-black/40 font-inter text-center pt-12">Logga in för att se dina bokningar</p>
            ) : activeTab === 'upcoming' ? (
                <div className="flex flex-col gap-5">
                    {upcoming.length === 0 ? (
                        <div className="flex flex-col items-center pt-16 gap-3">
                            <Calendar size={40} className="text-gray-200" />
                            <p className="text-black/30 font-inter">Inga kommande bokningar</p>
                        </div>
                    ) : upcoming.map(b => (
                        <div key={b.id} className="w-full bg-[#FAFAFA] rounded-[24px] p-5 shadow-[0px_4px_24px_rgba(0,0,0,0.07)] border border-[#F0F0F0] md:max-w-2xl">
                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-[54px] h-[54px] rounded-[16px] overflow-hidden bg-gray-200 flex-shrink-0">
                                    {b.image ? <img src={b.image} alt={b.salon_name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center text-white font-bold">{b.salon_name[0]}</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-black font-roboto font-semibold text-[17px] truncate">{b.salon_name}</h3>
                                    <p className="text-[#CAC8C8] font-roboto text-[14px] truncate">{b.city}, {b.salon_address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 bg-[#EDEDED] rounded-xl flex items-center justify-center"><Clock size={14} className="text-[#3F3F3F]" /></div><span className="text-[#555] font-roboto font-medium text-[15px]">{formatBookingDate(b.booking_date, b.booking_time)}</span></div>
                            <div className="flex items-center gap-3 mb-5"><div className="w-8 h-8 bg-[#EDEDED] rounded-xl flex items-center justify-center"><MapPin size={14} className="text-[#3F3F3F]" /></div><span className="text-[#555] font-roboto text-[14px]">{b.service_title} — {b.service_price} kr</span></div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(`${b.salon_address}, ${b.city}`)}`, '_blank')} className="flex-1 h-[42px] bg-black rounded-[14px] text-white font-inter font-semibold text-[14px] hover:bg-gray-800 transition-colors">Visa karta</button>
                                {cancelling === b.id ? <div className="w-[42px] h-[42px] flex items-center justify-center"><Loader2 size={16} className="animate-spin text-black/40" /></div> : <BookingMenu booking={b} onCancel={handleCancel} onReview={setReviewBooking} alreadyReviewed={reviewed.has(b.barber_id)} />}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {past.length === 0 ? (
                        <div className="flex flex-col items-center pt-16 gap-3"><Clock size={40} className="text-gray-200" /><p className="text-black/30 font-inter">Ingen historik ännu</p></div>
                    ) : past.map(b => (
                        <div key={b.id} className="w-full bg-[#FAFAFA] rounded-[22px] shadow-sm flex items-center px-4 py-3 gap-4 relative border border-[#F0F0F0] hover:shadow-md transition-shadow md:max-w-2xl">
                            <div className="w-[52px] h-[52px] rounded-[14px] overflow-hidden bg-gray-200 flex-shrink-0">
                                {b.image ? <img src={b.image} alt={b.salon_name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">{b.salon_name[0]}</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-roboto font-semibold text-[15px] text-black truncate">{b.salon_name}</p>
                                <p className="font-roboto text-[12px] text-[#888] truncate">{b.city}, {b.salon_address}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[#888] font-roboto text-[13px]">{b.booking_date} • {b.service_price} kr</span>
                                    <span className={`font-roboto font-bold text-[12px] px-2 py-0.5 rounded-full ${b.status === 'completed' ? 'bg-green-50 text-green-600' : b.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                                        {b.status === 'completed' ? '✅ UTFÖRD' : b.status === 'cancelled' ? '❌ AVBRYTEN' : '🕐'}
                                    </span>
                                </div>
                            </div>
                            <BookingMenu booking={b} onCancel={handleCancel} onReview={setReviewBooking} alreadyReviewed={reviewed.has(b.barber_id)} />
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {reviewBooking && (
                <ReviewModal
                    barberId={reviewBooking.barber_id}
                    salonName={reviewBooking.salon_name}
                    salonImage={reviewBooking.image}
                    token={token || ''}
                    onClose={() => setReviewBooking(null)}
                    onSuccess={() => handleReviewSuccess(reviewBooking.barber_id)}
                />
            )}
        </div>
    );
};

export default HistoryPage;