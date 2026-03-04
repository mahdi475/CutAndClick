import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Loader2, Clock, DollarSign } from 'lucide-react';

interface BarberServicesPageProps { user: any; }

interface Haircut {
    id: string; title: string; description: string;
    price: number; duration_minutes: number; image_url: string | null; is_active: boolean;
}

interface FormData {
    title: string; description: string; price: string;
    duration_minutes: string; image_url: string;
}

const DURATIONS = [30, 45, 60, 90, 120];

const EMPTY_FORM: FormData = { title: '', description: '', price: '', duration_minutes: '60', image_url: '' };

const BarberServicesPage: React.FC<BarberServicesPageProps> = ({ user }) => {
    const [services, setServices] = useState<Haircut[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Haircut | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const token = user?.token;

    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const load = () => {
        fetch('/api/posts/my/haircuts', { headers }).then(r => r.json())
            .then(d => { setServices(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, [token]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (s: Haircut) => {
        setEditItem(s);
        setForm({ title: s.title, description: s.description || '', price: String(s.price), duration_minutes: String(s.duration_minutes || 60), image_url: s.image_url || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.price) return;
        setSaving(true);
        const body = { title: form.title, description: form.description, price: parseFloat(form.price), duration_minutes: parseInt(form.duration_minutes), image_url: form.image_url || null };
        const url = editItem ? `/api/posts/haircuts/${editItem.id}` : '/api/posts/haircuts';
        const method = editItem ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
        if (res.ok) { showToast(editItem ? 'Tjänst uppdaterad!' : 'Tjänst skapad!'); setShowModal(false); load(); }
        else showToast('Fel vid sparande');
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/posts/haircuts/${id}`, { method: 'DELETE', headers });
        if (res.ok) { showToast('Tjänst borttagen!'); load(); }
        else showToast('Fel vid borttagning');
        setDeleteId(null);
    };

    const handleToggle = async (s: Haircut) => {
        const res = await fetch(`/api/posts/haircuts/${s.id}/toggle`, { method: 'PATCH', headers });
        if (res.ok) load();
    };

    return (
        <div className="flex flex-col min-h-full bg-[#F8F8F8] pb-24">
            {/* Header */}
            <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
                <h1 className="font-inter font-bold text-[24px] text-black">Mina Tjänster</h1>
                <p className="font-inter text-[14px] text-gray-400 mt-1">{services.length} tjänster totalt</p>
            </div>

            {/* Toast */}
            {toast && (
                <div className="mx-5 mt-4 px-4 py-3 bg-black text-white rounded-2xl font-inter text-[14px] flex items-center justify-between">
                    <span>{toast}</span><button onClick={() => setToast('')}><X size={14} /></button>
                </div>
            )}

            {/* List */}
            <div className="px-5 mt-5 flex flex-col gap-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-[100px] bg-white rounded-2xl animate-pulse" />)
                ) : services.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="font-inter text-gray-400">Inga tjänster ännu</p>
                        <p className="font-inter text-[13px] text-gray-300 mt-1">Klicka + för att lägga till din första tjänst</p>
                    </div>
                ) : services.map(s => (
                    <div key={s.id} className={`bg-white rounded-2xl p-4 flex gap-4 shadow-sm border ${s.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                        {/* Image */}
                        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {s.image_url
                                ? <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl">✂</div>
                            }
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <h3 className="font-inter font-semibold text-[15px] text-black truncate">{s.title}</h3>
                                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                    <button onClick={() => handleToggle(s)} className="text-gray-400 hover:text-black transition-colors">
                                        {s.is_active ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} />}
                                    </button>
                                    <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-black transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => setDeleteId(s.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <p className="font-inter text-[12px] text-gray-400 mt-0.5 line-clamp-1">{s.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 font-inter text-[13px] text-black font-semibold">{s.price} kr</span>
                                <span className="flex items-center gap-1 font-inter text-[12px] text-gray-400"><Clock size={11} />{s.duration_minutes || 60} min</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FAB */}
            <button
                onClick={openAdd}
                className="fixed bottom-[80px] right-5 w-[56px] h-[56px] bg-black rounded-full flex items-center justify-center shadow-xl hover:bg-gray-800 transition-colors active:scale-90 z-40"
            >
                <Plus size={24} className="text-white" />
            </button>

            {/* Delete confirm */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6">
                        <h3 className="font-inter font-bold text-[18px] text-black mb-2">Ta bort tjänst?</h3>
                        <p className="font-inter text-[14px] text-gray-400 mb-6">Detta kan inte ångras.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 h-[48px] border border-gray-200 rounded-2xl font-inter font-semibold text-black">Avbryt</button>
                            <button onClick={() => handleDelete(deleteId)} className="flex-1 h-[48px] bg-red-500 rounded-2xl font-inter font-semibold text-white">Ta bort</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-inter font-bold text-[20px] text-black">{editItem ? 'Redigera tjänst' : 'Ny tjänst'}</h3>
                            <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Titel *</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="T.ex. Herrklippning" className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                            </div>
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Beskrivning</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3} placeholder="Beskriv tjänsten..." className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-[15px] outline-none focus:border-black resize-none" />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block font-inter text-[13px] text-gray-500 mb-1">Pris (kr) *</label>
                                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="350" className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                                </div>
                                <div className="flex-1">
                                    <label className="block font-inter text-[13px] text-gray-500 mb-1">Tid (min)</label>
                                    <select value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                                        className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black bg-white">
                                        {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Bild-URL</label>
                                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                    placeholder="https://..." className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                                {form.image_url && form.image_url.startsWith('http') && (
                                    <img src={form.image_url} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-xl border border-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
                                )}
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={!form.title || !form.price || saving}
                            className="mt-6 w-full h-[52px] bg-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-gray-800 transition-colors">
                            {saving ? <Loader2 size={18} className="text-white animate-spin" /> : <span className="font-inter font-semibold text-white text-[16px]">{editItem ? 'Uppdatera' : 'Skapa tjänst'}</span>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarberServicesPage;
