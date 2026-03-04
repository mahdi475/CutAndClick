import React, { useState, useEffect } from 'react';
import { Check, Loader2, Calendar, Clock, User } from 'lucide-react';

interface BarberBookingsPageProps { user: any; }

type FilterType = 'today' | 'week' | 'all';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: string;
    service_title: string;
    service_price: number;
    customer_name: string;
}

const BarberBookingsPage: React.FC<BarberBookingsPageProps> = ({ user }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('today');
    const [completing, setCompleting] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const token = user?.token;
    const headers = { Authorization: `Bearer ${token}` };

    const todayStr = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
    const weekStr = weekEnd.toISOString().slice(0, 10);

    const load = () => {
        if (!token) { setLoading(false); return; }
        fetch('/api/bookings/barber', { headers }).then(r => r.json())
            .then(d => { setBookings(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, [token]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleComplete = async (id: string) => {
        setCompleting(id);
        const res = await fetch(`/api/posts/bookings/${id}/complete`, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' } });
        if (res.ok) { showToast('Bokning markerad som utförd!'); load(); }
        else showToast('Fel vid uppdatering');
        setCompleting(null);
    };

    const filtered = bookings.filter(b => {
        if (filter === 'today') return b.booking_date === todayStr;
        if (filter === 'week') return b.booking_date >= todayStr && b.booking_date <= weekStr;
        return true;
    });

    const FILTERS: { key: FilterType; label: string }[] = [
        { key: 'today', label: 'Idag' },
        { key: 'week', label: 'Veckan' },
        { key: 'all', label: 'Alla' },
    ];

    const statusColor = (s: string) =>
        s === 'confirmed' ? 'bg-blue-50 text-blue-600'
            : s === 'completed' ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-500';

    const statusLabel = (s: string) =>
        s === 'confirmed' ? 'Bekräftad' : s === 'completed' ? 'Utförd' : 'Avbokad';

    return (
        <div className="flex flex-col min-h-full bg-[#F8F8F8] pb-24">
            {/* Header */}
            <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
                <h1 className="font-inter font-bold text-[24px] text-black">Bokningar</h1>
                <p className="font-inter text-[14px] text-gray-400 mt-1">{bookings.filter(b => b.status === 'confirmed').length} aktiva bokningar</p>
            </div>

            {/* Filter tabs */}
            <div className="px-5 mt-4 flex gap-2">
                {FILTERS.map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`px-5 h-[38px] rounded-xl font-inter font-medium text-[14px] transition-all ${filter === f.key ? 'bg-black text-white' : 'bg-white text-gray-400 border border-gray-200 hover:text-black'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {toast && (
                <div className="mx-5 mt-3 px-4 py-3 bg-green-50 text-green-700 rounded-2xl font-inter text-[14px] border border-green-100">{toast}</div>
            )}

            {/* List */}
            <div className="px-5 mt-4 flex flex-col gap-3">
                {loading ? [1, 2, 3].map(i => <div key={i} className="h-[100px] bg-white rounded-2xl animate-pulse" />)
                    : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
                            <p className="font-inter text-gray-400">Inga bokningar {filter === 'today' ? 'idag' : filter === 'week' ? 'denna vecka' : ''}</p>
                        </div>
                    ) : filtered.map(b => (
                        <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <User size={16} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-inter font-semibold text-[15px] text-black">{b.customer_name}</p>
                                        <p className="font-inter text-[13px] text-gray-400">{b.service_title} • {b.service_price} kr</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-lg font-inter text-[11px] font-semibold ${statusColor(b.status)}`}>
                                    {statusLabel(b.status)}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-3">
                                <span className="flex items-center gap-1 font-inter text-[13px] text-gray-400">
                                    <Calendar size={12} /> {b.booking_date}
                                </span>
                                <span className="flex items-center gap-1 font-inter text-[13px] text-gray-400">
                                    <Clock size={12} /> {b.booking_time}
                                </span>
                            </div>

                            {b.status === 'confirmed' && (
                                <button
                                    onClick={() => handleComplete(b.id)}
                                    disabled={completing === b.id}
                                    className="w-full h-[40px] bg-green-500 rounded-xl flex items-center justify-center gap-2 font-inter font-semibold text-[14px] text-white hover:bg-green-600 transition-colors disabled:opacity-60"
                                >
                                    {completing === b.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /><span>Markera utförd</span></>}
                                </button>
                            )}
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default BarberBookingsPage;
