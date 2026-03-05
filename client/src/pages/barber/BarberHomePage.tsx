import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, Users, Star, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BarberHomePageProps {
    user: any;
    onAddService: () => void;
    onSignOut: () => void;
}

interface DashStats {
    today: number;
    week: number;
    total: number;
}

interface TodayBooking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: string;
    customer_name: string;
    service_title: string;
}

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
            <p className="font-inter text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="font-inter font-bold text-[20px] text-black leading-tight">{value}</p>
        </div>
    </div>
);

const BarberHomePage: React.FC<BarberHomePageProps> = ({ user, onAddService, onSignOut }) => {
    const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);
    const [stats, setStats] = useState<DashStats>({ today: 0, week: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const { user: authUser, logout } = useAuth();
    const token = user?.token;

    const todayStr = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
    const weekStr = weekEnd.toISOString().slice(0, 10);

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        fetch('/api/bookings/barber', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => {
                const all: TodayBooking[] = Array.isArray(data) ? data : [];
                const todayList = all.filter(b => b.booking_date === todayStr && b.status !== 'cancelled');
                const weekCount = all.filter(b => b.booking_date >= todayStr && b.booking_date <= weekStr && b.status !== 'cancelled').length;
                setTodayBookings(todayList);
                setStats({ today: todayList.length, week: weekCount, total: all.length });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'God morgon' : hour < 17 ? 'God dag' : 'God kväll';
    const displayName = user?.username || 'Barber';

    return (
        <div className="flex flex-col min-h-full px-5 pt-12 pb-6">

            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="font-inter font-bold text-[26px] text-black">{greeting}, {displayName}!</h1>
                    <p className="font-inter text-[15px] text-gray-400 mt-1">Här är din översikt</p>
                </div>
                <button
                    onClick={() => { logout(); onSignOut(); }}
                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                    title="Logga ut"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <StatCard icon={Calendar} label="Idag" value={stats.today} color="bg-black" />
                <StatCard icon={TrendingUp} label="Denna veckan" value={stats.week} color="bg-blue-500" />
                <StatCard icon={Users} label="Totalt bokningar" value={stats.total} color="bg-purple-500" />
                <StatCard icon={Star} label="Betyg" value={user?.rating || '—'} color="bg-yellow-500" />
            </div>

            {/* Today's bookings */}
            <div className="mb-8">
                <h2 className="font-inter font-bold text-[18px] text-black mb-4">
                    Dagens bokningar
                    <span className="ml-2 text-[13px] font-normal text-gray-400">{todayStr}</span>
                </h2>
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                ) : todayBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                        <p className="font-inter text-gray-400">Inga bokningar idag</p>
                        <p className="font-inter text-[12px] text-gray-300 mt-1">Njut av ledigheten!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {todayBookings.map(b => (
                            <div key={b.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-4 shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-inter font-bold text-[14px]">{b.booking_time}</span>
                                </div>
                                <div>
                                    <p className="font-inter font-semibold text-[15px] text-black">{b.customer_name}</p>
                                    <p className="font-inter text-[13px] text-gray-400">{b.service_title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick action */}
            <button
                onClick={onAddService}
                className="w-full h-[56px] bg-black rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 transition-colors active:scale-95"
            >
                <Plus size={18} className="text-white" />
                <span className="font-inter font-semibold text-white text-[16px]">Lägg till ny tjänst</span>
            </button>
        </div>
    );
};

export default BarberHomePage;
