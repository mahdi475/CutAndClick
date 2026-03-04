import React, { useEffect, useState } from 'react';
import { Save, Loader2, X } from 'lucide-react';

interface BarberSchedulePageProps { user: any; }

const DAYS = [
    { key: 'monday', label: 'Måndag' },
    { key: 'tuesday', label: 'Tisdag' },
    { key: 'wednesday', label: 'Onsdag' },
    { key: 'thursday', label: 'Torsdag' },
    { key: 'friday', label: 'Fredag' },
    { key: 'saturday', label: 'Lördag' },
    { key: 'sunday', label: 'Söndag' },
];

interface DayHours {
    day_of_week: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

const DEFAULT_HOURS: DayHours[] = DAYS.map((d, i) => ({
    day_of_week: d.key,
    open_time: '09:00',
    close_time: '18:00',
    is_closed: i >= 6, // Sunday closed by default
}));

const BarberSchedulePage: React.FC<BarberSchedulePageProps> = ({ user }) => {
    const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const token = user?.token;
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    useEffect(() => {
        if (!user?.id || !token) { setLoading(false); return; }
        fetch(`/api/opening-hours/${user.id}`)
            .then(r => r.json())
            .then((data: DayHours[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    // Merge with defaults to always show all 7 days
                    const merged = DAYS.map(d => {
                        const found = data.find(h => h.day_of_week === d.key);
                        return found
                            ? { ...found, open_time: found.open_time?.slice(0, 5) || '09:00', close_time: found.close_time?.slice(0, 5) || '18:00' }
                            : { day_of_week: d.key, open_time: '09:00', close_time: '18:00', is_closed: true };
                    });
                    setHours(merged);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user?.id, token]);

    const update = (dayKey: string, field: keyof DayHours, value: any) => {
        setHours(prev => prev.map(h => h.day_of_week === dayKey ? { ...h, [field]: value } : h));
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch('/api/opening-hours', {
            method: 'PUT',
            headers,
            body: JSON.stringify(hours),
        });
        if (res.ok) { setToast('Öppettiderna är sparade! ✅'); setToastType('success'); }
        else { setToast('Fel vid sparande, försök igen'); setToastType('error'); }
        setSaving(false);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div className="flex flex-col min-h-full bg-[#F8F8F8] pb-24">
            {/* Header */}
            <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
                <h1 className="font-inter font-bold text-[24px] text-black">Öppettider</h1>
                <p className="font-inter text-[14px] text-gray-400 mt-1">Ange din salongs öppettider per dag</p>
            </div>

            {toast && (
                <div className={`mx-5 mt-4 px-4 py-3 rounded-2xl font-inter text-[14px] flex items-center justify-between ${toastType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                    <span>{toast}</span><button onClick={() => setToast('')}><X size={14} /></button>
                </div>
            )}

            {/* Days */}
            <div className="px-5 mt-5 flex flex-col gap-3">
                {loading ? DAYS.map((_, i) => <div key={i} className="h-[70px] bg-white rounded-2xl animate-pulse" />)
                    : DAYS.map(day => {
                        const h = hours.find(x => x.day_of_week === day.key)!;
                        return (
                            <div key={day.key} className={`bg-white rounded-2xl px-4 py-3 shadow-sm border ${h.is_closed ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
                                {/* Day name + toggle */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-inter font-semibold text-[16px] ${h.is_closed ? 'text-gray-400' : 'text-black'}`}>{day.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-inter text-[13px] ${h.is_closed ? 'text-red-400' : 'text-green-500'}`}>
                                            {h.is_closed ? 'Stängt' : 'Öppet'}
                                        </span>
                                        <button
                                            onClick={() => update(day.key, 'is_closed', !h.is_closed)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${h.is_closed ? 'bg-gray-200' : 'bg-green-500'}`}
                                        >
                                            <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${h.is_closed ? 'left-[2px]' : 'left-[22px]'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Times (only shown when open) */}
                                {!h.is_closed && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="block font-inter text-[11px] text-gray-400 mb-1">Öppnar</label>
                                            <input
                                                type="time"
                                                value={h.open_time}
                                                onChange={e => update(day.key, 'open_time', e.target.value)}
                                                className="w-full h-[40px] border border-gray-200 rounded-xl px-3 font-inter text-[15px] outline-none focus:border-black bg-white"
                                            />
                                        </div>
                                        <span className="text-gray-300 font-inter text-[18px] mt-4">—</span>
                                        <div className="flex-1">
                                            <label className="block font-inter text-[11px] text-gray-400 mb-1">Stänger</label>
                                            <input
                                                type="time"
                                                value={h.close_time}
                                                onChange={e => update(day.key, 'close_time', e.target.value)}
                                                className="w-full h-[40px] border border-gray-200 rounded-xl px-3 font-inter text-[15px] outline-none focus:border-black bg-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                }
            </div>

            {/* Save button */}
            {!loading && (
                <div className="px-5 mt-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-[56px] bg-black rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 hover:bg-gray-800 transition-colors"
                    >
                        {saving ? <Loader2 size={18} className="text-white animate-spin" /> : <><Save size={18} className="text-white" /><span className="font-inter font-semibold text-white text-[16px]">Spara öppettider</span></>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BarberSchedulePage;
