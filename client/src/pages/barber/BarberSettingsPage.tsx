import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../../components/common/ImageUpload';
import AddressAutocomplete from '../../components/common/AddressAutocomplete';
import PhoneInput from '../../components/common/PhoneInput';
import WebsiteInput from '../../components/common/WebsiteInput';

interface BarberSettingsPageProps {
    user: any;
}

const BarberSettingsPage: React.FC<BarberSettingsPageProps> = ({ user }) => {
    const { updateUser } = useAuth();
    const token = user?.token;
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const [formData, setFormData] = useState({
        username: user?.username || '',
        salon_name: '',
        salon_address: '',
        city: '',
        postal_code: '',
        phone: '',
        website: '',
        bio: '',
        profile_pic_url: user?.profile_pic_url || '',
        cover_image: ''
    });

    const [phoneValid, setPhoneValid] = useState(true);
    const [websiteValid, setWebsiteValid] = useState(true);

    useEffect(() => {
        fetch('/api/auth/profile', { headers })
            .then(r => r.json())
            .then(data => {
                if (data.barber) {
                    setFormData(prev => ({
                        ...prev,
                        salon_name: data.barber.salon_name || '',
                        salon_address: data.barber.salon_address || '',
                        city: data.barber.city || '',
                        postal_code: data.barber.postal_code || '',
                        phone: data.barber.phone || '',
                        website: data.barber.website || '',
                        bio: data.barber.bio || '',
                        cover_image: data.barber.cover_image || '',
                        profile_pic_url: data.profile_pic_url || data.user?.profile_pic_url || prev.profile_pic_url
                    }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const handleSave = async () => {
        if (!phoneValid || !websiteValid) {
            setSaveMsg('Rätta till felaktiga fält innan du sparar');
            setTimeout(() => setSaveMsg(''), 3000);
            return;
        }
        setSaving(true); setSaveMsg('');
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers,
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setSaveMsg('Inställningar sparade!');
                updateUser({
                    username: formData.username,
                    profile_pic_url: formData.profile_pic_url
                });
            } else {
                setSaveMsg('Fel vid sparande');
            }
        } catch {
            setSaveMsg('Serverfel');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(''), 3000);
        }
    };

    const handleImageSuccess = (type: 'profile' | 'cover', url: string) => {
        setFormData(prev => ({
            ...prev,
            [type === 'profile' ? 'profile_pic_url' : 'cover_image']: url
        }));
    };

    const inputClass = 'w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black bg-[#FCFCFC]';

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-black" /></div>;

    return (
        <div className="flex flex-col min-h-full bg-white pb-24 text-black">
            <div className="flex flex-col gap-6">

                {/* Header & Images Section combined for proper design */}
                <div className="flex flex-col mb-8">
                    {/* Banner Section */}
                    <div className="relative w-full h-48 md:h-64 bg-gray-50 rounded-b-3xl overflow-hidden shadow-sm group border-b border-gray-100">
                        <ImageUpload
                            onUploadSuccess={(url) => handleImageSuccess('cover', url)}
                            folderPath={`${user?.id}/salon`}
                            currentImageUrl={formData.cover_image}
                            initials="LADDA UPP BANNER"
                            size="lg"
                            shape="square"
                            variant="banner"
                            fixedFileName="salon_cover.png"
                        />
                        <div className="absolute top-4 left-6 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-none">
                            <span className="text-[11px] text-white/90 font-inter font-bold uppercase tracking-wider">Omslagsbild</span>
                        </div>
                    </div>

                    {/* Logo/Profile Section Overlap */}
                    <div className="px-6 -mt-14 md:-mt-20 flex items-end gap-4 relative z-20 pointer-events-none">
                        <div className="bg-white p-1 rounded-full shadow-xl pointer-events-auto">
                            <ImageUpload
                                onUploadSuccess={(url) => handleImageSuccess('profile', url)}
                                folderPath={`${user?.id}/avatar`}
                                currentImageUrl={formData.profile_pic_url}
                                initials={formData.username.slice(0, 2).toUpperCase()}
                                size="lg"
                                shape="circle"
                                fixedFileName="profile_pic.png"
                            />
                        </div>
                        <div className="pb-2 md:pb-6 pointer-events-auto">
                            <h2 className="text-black font-inter font-bold text-[24px] leading-tight drop-shadow-sm md:text-white md:drop-shadow-md">
                                {formData.salon_name || 'Din Salong'}
                            </h2>
                            <p className="text-gray-500 font-inter text-sm md:text-gray-200">
                                Salongslogotyp & Omslagsbild
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Fields */}
                <div className="px-6 flex flex-col gap-4 mt-4">

                    {/* Namn */}
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Ditt Namn / Alias</label>
                        <input
                            value={formData.username}
                            onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                            className={inputClass}
                        />
                    </div>

                    {/* Salongens namn */}
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Salongens Namn</label>
                        <input
                            value={formData.salon_name}
                            onChange={e => setFormData(f => ({ ...f, salon_name: e.target.value }))}
                            className={inputClass}
                        />
                    </div>

                    {/* Adress — med autocomplete (visar fullständig adress) */}
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Adress</label>
                        <AddressAutocomplete
                            value={formData.salon_address}
                            placeholder="Sök adress (t.ex. Drottninggatan 1, Stockholm)"
                            onSelect={({ fullAddress, address, city, postalCode, validated }) => {
                                setFormData(f => ({
                                    ...f,
                                    salon_address: fullAddress,
                                    city,
                                    postal_code: postalCode,
                                }));
                            }}
                            onChange={val => setFormData(f => ({ ...f, salon_address: val }))}
                        />
                    </div>

                    {/* Telefon */}
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Telefon</label>
                        <PhoneInput
                            value={formData.phone}
                            onChange={(e164, valid) => {
                                setFormData(f => ({ ...f, phone: e164 }));
                                setPhoneValid(valid);
                            }}
                        />
                    </div>

                    {/* Hemsida */}
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Hemsida</label>
                        <WebsiteInput
                            value={formData.website}
                            onChange={(url, valid) => {
                                setFormData(f => ({ ...f, website: url }));
                                setWebsiteValid(valid);
                            }}
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Beskrivning / Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                            rows={4}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-[15px] outline-none focus:border-black resize-none bg-[#FCFCFC]"
                        />
                    </div>
                </div>

                <div className="px-6 mb-10 flex flex-col gap-4">
                    {saveMsg && (
                        <div className={`p-4 rounded-xl font-inter text-[14px] text-center ${saveMsg.includes('Fel') || saveMsg.includes('Rätta') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                            {saveMsg}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-[56px] bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-inter font-bold text-[16px] shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                    >
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Spara Inställningar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarberSettingsPage;
