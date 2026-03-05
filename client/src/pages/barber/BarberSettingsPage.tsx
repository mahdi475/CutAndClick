import React, { useState, useEffect } from 'react';
import { Save, Loader2, ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../../components/common/ImageUpload';

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
        phone: '',
        bio: '',
        profile_pic_url: user?.profile_pic_url || '',
        cover_image: ''
    });

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
                        phone: data.barber.phone || '',
                        bio: data.barber.bio || '',
                        cover_image: data.barber.cover_image || ''
                    }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const handleSave = async () => {
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
        } catch (err) {
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

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-black" /></div>;

    return (
        <div className="flex flex-col min-h-full bg-white pb-24 text-black">
            <div className="px-6 pt-12 pb-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h1 className="font-inter font-bold text-[24px] text-black">Salongens Inställningar</h1>
                <p className="font-inter text-[14px] text-gray-400 mt-1">Hantera din salongs profil och bilder</p>
            </div>

            <div className="px-6 pt-6 flex flex-col gap-6">

                {/* Images Section */}
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-3 uppercase tracking-wider font-bold">Omslagsbild (Banner)</label>
                        <div className="w-full h-40 rounded-2xl overflow-hidden relative border border-gray-100 bg-gray-50 flex items-center justify-center">
                            <ImageUpload
                                onUploadSuccess={(url) => handleImageSuccess('cover', url)}
                                folderPath={`${user?.id}/salon`}
                                currentImageUrl={formData.cover_image}
                                initials="BANNER"
                                size="lg"
                                fixedFileName="salon_cover.png"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center -mt-16 relative z-20">
                        <label className="block font-inter text-[13px] text-gray-500 mb-2 uppercase tracking-wider font-bold bg-white px-2 rounded">Profilbild</label>
                        <ImageUpload
                            onUploadSuccess={(url) => handleImageSuccess('profile', url)}
                            folderPath={`${user?.id}/avatar`}
                            currentImageUrl={formData.profile_pic_url}
                            initials={formData.username.slice(0, 2).toUpperCase()}
                            size="lg"
                            fixedFileName="profile_pic.png"
                        />
                    </div>
                </div>

                {/* Info Fields */}
                <div className="flex flex-col gap-4 mt-4">
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Ditt Namn / Alias</label>
                        <input value={formData.username} onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                            className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                    </div>
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Salongens Namn</label>
                        <input value={formData.salon_name} onChange={e => setFormData(f => ({ ...f, salon_name: e.target.value }))}
                            className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                    </div>
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Adress</label>
                        <input value={formData.salon_address} onChange={e => setFormData(f => ({ ...f, salon_address: e.target.value }))}
                            className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block font-inter text-[13px] text-gray-500 mb-1">Stad</label>
                            <input value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                                className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                        </div>
                        <div className="flex-1">
                            <label className="block font-inter text-[13px] text-gray-500 mb-1">Telefon</label>
                            <input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                                className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-inter text-[13px] text-gray-500 mb-1">Beskrivning / Bio</label>
                        <textarea value={formData.bio} onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                            rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-[15px] outline-none focus:border-black resize-none" />
                    </div>
                </div>

                {saveMsg && (
                    <div className={`p-4 rounded-xl font-inter text-[14px] text-center ${saveMsg.includes('Fel') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        {saveMsg}
                    </div>
                )}

                <button onClick={handleSave} disabled={saving}
                    className="w-full h-[56px] bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-inter font-bold text-[16px] shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Spara Inställningar
                </button>
            </div>
        </div>
    );
};

export default BarberSettingsPage;
