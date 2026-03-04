import React, { useState, useEffect } from 'react';
import {
    Settings, CreditCard, Bell, User, LogOut, Edit2, ArrowLeft,
    ChevronRight, Save, Loader2, X, Eye, EyeOff, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfilePageProps {
    onBack: () => void;
    onSignOut: () => void;
}

type Section = 'main' | 'personal' | 'notifications' | 'settings';

interface NotifPrefs { booking: boolean; newService: boolean; promotions: boolean; }

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onSignOut }) => {
    const { user } = useAuth();
    const token = user?.token;
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const [section, setSection] = useState<Section>('main');
    const [bookingCount, setBookingCount] = useState<number>(0);

    // Personal info form
    const [username, setUsername] = useState(user?.username || '');
    const [location, setLocation] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // Notifications (localStorage)
    const [notifs, setNotifs] = useState<NotifPrefs>(() => {
        try { return JSON.parse(localStorage.getItem('cc_notifs') || '{"booking":true,"newService":false,"promotions":false}'); }
        catch { return { booking: true, newService: false, promotions: false }; }
    });

    // Password change
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState('');

    // Fetch booking count
    useEffect(() => {
        if (!token) return;
        fetch('/api/bookings/my', { headers }).then(r => r.json())
            .then(data => { if (Array.isArray(data)) setBookingCount(data.length); })
            .catch(() => { });
    }, [token]);

    const handleSaveProfile = async () => {
        setSaving(true); setSaveMsg('');
        const res = await fetch('/api/auth/profile', {
            method: 'PUT', headers,
            body: JSON.stringify({ username, location }),
        });
        setSaveMsg(res.ok ? 'Profil uppdaterad! ✅' : 'Fel vid sparande');
        setSaving(false);
        setTimeout(() => setSaveMsg(''), 3000);
    };

    const handleSaveNotifs = (key: keyof NotifPrefs, val: boolean) => {
        const updated = { ...notifs, [key]: val };
        setNotifs(updated);
        localStorage.setItem('cc_notifs', JSON.stringify(updated));
    };

    const handlePasswordChange = async () => {
        if (!newPw || newPw.length < 6) { setPwMsg('Lösenordet måste vara minst 6 tecken'); return; }
        setPwSaving(true); setPwMsg('');
        // In a real implementation, this would call Supabase auth.updateUser — via backend
        const res = await fetch('/api/auth/profile', {
            method: 'PUT', headers,
            body: JSON.stringify({ password: newPw }),
        });
        setPwMsg(res.ok ? 'Lösenord ändrat! ✅' : 'Fel vid lösenordsbyte');
        setPwSaving(false);
        setOldPw(''); setNewPw('');
        setTimeout(() => setPwMsg(''), 4000);
    };

    const displayName = user?.username || 'Kund';
    const initials = displayName.slice(0, 2).toUpperCase();
    const points = bookingCount * 12;

    // ── Back from sub-section ───────────────────
    if (section !== 'main') {
        return (
            <div className="flex flex-col min-h-full bg-white pb-24">
                <div className="px-6 pt-10 pb-5 flex items-center gap-4 border-b border-gray-100">
                    <button onClick={() => setSection('main')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <ArrowLeft size={18} className="text-black" />
                    </button>
                    <h1 className="font-inter font-bold text-[20px] text-black">
                        {section === 'personal' ? 'Personlig information' : section === 'notifications' ? 'Notifikationer' : 'Kontoinställningar'}
                    </h1>
                </div>

                <div className="px-6 pt-6 flex flex-col gap-5">

                    {/* Personal Info */}
                    {section === 'personal' && (
                        <>
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Användarnamn</label>
                                <input value={username} onChange={e => setUsername(e.target.value)}
                                    className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                            </div>
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Stad / Plats</label>
                                <input value={location} onChange={e => setLocation(e.target.value)}
                                    placeholder="T.ex. Göteborg"
                                    className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                            </div>
                            {saveMsg && <p className={`font-inter text-[14px] ${saveMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{saveMsg}</p>}
                            <button onClick={handleSaveProfile} disabled={saving}
                                className="w-full h-[52px] bg-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 size={16} className="text-white animate-spin" /> : <><Save size={16} className="text-white" /><span className="font-inter font-semibold text-white">Spara</span></>}
                            </button>
                        </>
                    )}

                    {/* Notifications */}
                    {section === 'notifications' && (
                        <>
                            {[
                                { key: 'booking' as const, label: 'Bokningspåminnelse', desc: 'Påminnelse 24h innan bokning' },
                                { key: 'newService' as const, label: 'Nya tjänster', desc: 'När dina favoritbarbershops lägger till' },
                                { key: 'promotions' as const, label: 'Kampanjer', desc: 'Erbjudanden och rabatter' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                                    <div>
                                        <p className="font-inter font-semibold text-[15px] text-black">{item.label}</p>
                                        <p className="font-inter text-[12px] text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <button onClick={() => handleSaveNotifs(item.key, !notifs[item.key])}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${notifs[item.key] ? 'bg-black' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[item.key] ? 'left-[22px]' : 'left-[2px]'}`} />
                                    </button>
                                </div>
                            ))}
                            <p className="font-inter text-[12px] text-gray-300 text-center">Sparas lokalt i denna enhet</p>
                        </>
                    )}

                    {/* Account Settings */}
                    {section === 'settings' && (
                        <>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="font-inter font-semibold text-[15px] text-black mb-1">Betalsätt</p>
                                <p className="font-inter text-[14px] text-gray-400">💳 Betalning sker i salongen vid besöket.</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
                                <p className="font-inter font-semibold text-[15px] text-black">Ändra lösenord</p>
                                <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                                    placeholder="Nytt lösenord (min 6 tecken)"
                                    className="w-full h-[44px] border border-gray-200 rounded-xl px-4 font-inter text-[14px] outline-none focus:border-black" />
                                {pwMsg && <p className={`font-inter text-[13px] ${pwMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{pwMsg}</p>}
                                <button onClick={handlePasswordChange} disabled={pwSaving || !newPw}
                                    className="h-[44px] bg-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
                                    {pwSaving ? <Loader2 size={14} className="text-white animate-spin" /> : <span className="font-inter font-semibold text-white text-[14px]">Byt lösenord</span>}
                                </button>
                            </div>
                            <div className="bg-red-50 rounded-2xl p-4">
                                <p className="font-inter font-semibold text-[14px] text-red-500 mb-1">Radera konto</p>
                                <p className="font-inter text-[13px] text-red-400">För att radera ditt konto, kontakta oss på support@cutandclick.se</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ── Main profile view ───────────────────────
    return (
        <div className="flex flex-col min-h-full bg-white relative pb-24 px-6 pt-10">

            <div className="flex items-center gap-5 mb-8">
                <button onClick={onBack} className="w-[44px] h-[44px] bg-white rounded-[14px] border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="text-[#222]" size={20} strokeWidth={2.5} />
                </button>
                <h1 className="text-[#333] font-inter font-bold text-[24px]">Profil</h1>
            </div>

            {/* Avatar + name */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                    <div className="w-[100px] h-[100px] rounded-full bg-black flex items-center justify-center border-2 border-black">
                        <span className="text-white font-inter font-bold text-[30px]">{initials}</span>
                    </div>
                </div>
                <h2 className="text-black font-roboto font-semibold text-[26px] leading-tight">{displayName}</h2>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-[#FBFBFB] rounded-[24px] shadow-md p-4 flex flex-col items-center h-[88px] justify-center border border-gray-100">
                    <span className="text-[#979797] font-roboto text-[13px] text-center mb-1">Totala Bokningar</span>
                    <span className="text-black font-roboto font-bold text-[28px] leading-none">{bookingCount}</span>
                </div>
                <div className="flex-1 bg-[#FBFBFB] rounded-[24px] shadow-md p-4 flex flex-col items-center h-[88px] justify-center border border-gray-100">
                    <span className="text-[#979797] font-roboto text-[13px] text-center mb-1">Konto Poäng</span>
                    <span className="text-black font-roboto font-bold text-[28px] leading-none">{points}</span>
                </div>
            </div>

            {/* Settings menu */}
            <h3 className="text-[#888] font-inter font-bold text-[16px] mb-3 pl-1">Inställningar</h3>
            <div className="bg-[#FBFBFB] rounded-[24px] shadow-md p-5 flex flex-col gap-5 mb-6 border border-gray-100">
                {[
                    { icon: User, color: 'bg-[#503DFF]', label: 'Personlig information', section: 'personal' as Section },
                    { icon: CreditCard, color: 'bg-[#FF9B9B]', label: 'Payment & konto', section: 'settings' as Section },
                    { icon: Bell, color: 'bg-[#FFD793]', label: 'Notifications hantering', section: 'notifications' as Section },
                ].map((item, i, arr) => (
                    <React.Fragment key={item.section}>
                        <button onClick={() => setSection(item.section)} className="flex items-center gap-4 hover:opacity-70 transition-opacity">
                            <div className={`w-[32px] h-[32px] ${item.color} rounded-[8px] flex items-center justify-center`}>
                                <item.icon size={16} className="text-white" />
                            </div>
                            <span className="text-black font-inter font-bold text-[14px] flex-1 text-left">{item.label}</span>
                            <ChevronRight size={16} className="text-gray-300" />
                        </button>
                        {i < arr.length - 1 && <div className="h-px bg-[#E1E1E1]" />}
                    </React.Fragment>
                ))}
            </div>

            {/* Sign out */}
            <button onClick={onSignOut}
                className="w-full h-[58px] bg-red-50 rounded-[20px] flex items-center justify-center gap-3 hover:bg-red-100 transition-colors active:scale-95">
                <LogOut size={22} className="text-red-500" />
                <span className="text-red-500 font-inter font-bold text-[18px]">SIGN OUT</span>
            </button>
        </div>
    );
};

export default ProfilePage;