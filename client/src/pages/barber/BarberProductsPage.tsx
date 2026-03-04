import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';

interface BarberProductsPageProps { user: any; }

interface ItemPost {
    id: string; title: string; description: string;
    price: number; image_url: string | null; category: string; is_active: boolean;
}

interface FormData { title: string; description: string; price: string; image_url: string; category: string; }

const CATEGORIES = [
    { value: 'hair', label: '💇 Hår' },
    { value: 'beard', label: '🧔 Skägg' },
    { value: 'skincare', label: '💆 Hudvård' },
    { value: 'tools', label: '🔧 Verktyg' },
    { value: 'general', label: '📦 Övrigt' },
];

const EMPTY: FormData = { title: '', description: '', price: '', image_url: '', category: 'general' };

const BarberProductsPage: React.FC<BarberProductsPageProps> = ({ user }) => {
    const [items, setItems] = useState<ItemPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<ItemPost | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const token = user?.token;
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const load = () => {
        fetch('/api/posts/my/items', { headers }).then(r => r.json())
            .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, [token]);
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const openAdd = () => { setEditItem(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (p: ItemPost) => {
        setEditItem(p);
        setForm({ title: p.title, description: p.description || '', price: String(p.price), image_url: p.image_url || '', category: p.category || 'general' });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.price) return;
        setSaving(true);
        const body = { title: form.title, description: form.description, price: parseFloat(form.price), image_url: form.image_url || null, category: form.category };
        const url = editItem ? `/api/posts/items/${editItem.id}` : '/api/posts/items';
        const method = editItem ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
        if (res.ok) { showToast(editItem ? 'Produkt uppdaterad!' : 'Produkt skapad!'); setShowModal(false); load(); }
        else showToast('Fel vid sparande');
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/posts/items/${id}`, { method: 'DELETE', headers });
        if (res.ok) { showToast('Produkt borttagen!'); load(); }
        setDeleteId(null);
    };

    const handleToggle = async (p: ItemPost) => {
        const res = await fetch(`/api/posts/items/${p.id}/toggle`, { method: 'PATCH', headers });
        if (res.ok) load();
    };

    const catLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label || v;

    return (
        <div className="flex flex-col min-h-full bg-[#F8F8F8] pb-24">
            <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
                <h1 className="font-inter font-bold text-[24px] text-black">Mina Produkter</h1>
                <p className="font-inter text-[14px] text-gray-400 mt-1">{items.length} produkter • Visas bara i katalog</p>
            </div>

            {/* Info banner */}
            <div className="mx-5 mt-4 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="font-inter text-[13px] text-blue-600">ℹ️ Produkterna visas som katalog — <strong>ingen onlineköp</strong>. Kunder köper i salongen.</p>
            </div>

            {toast && (
                <div className="mx-5 mt-3 px-4 py-3 bg-black text-white rounded-2xl font-inter text-[14px] flex items-center justify-between">
                    <span>{toast}</span><button onClick={() => setToast('')}><X size={14} /></button>
                </div>
            )}

            <div className="px-5 mt-5 flex flex-col gap-4">
                {loading ? [1, 2, 3].map(i => <div key={i} className="h-[100px] bg-white rounded-2xl animate-pulse" />)
                    : items.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="font-inter text-gray-400">Inga produkter ännu</p>
                        </div>
                    ) : items.map(p => (
                        <div key={p.id} className={`bg-white rounded-2xl p-4 flex gap-4 shadow-sm border ${p.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                            <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                {p.image_url
                                    ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-2xl">🛍️</div>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-inter font-semibold text-[15px] text-black truncate">{p.title}</h3>
                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                        <button onClick={() => handleToggle(p)}>
                                            {p.is_active ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                                        </button>
                                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-black"><Edit2 size={16} /></button>
                                        <button onClick={() => setDeleteId(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-lg font-inter text-[11px] text-gray-500 mt-1">{catLabel(p.category)}</span>
                                <p className="font-inter font-bold text-[15px] text-black mt-1">{p.price} kr</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            <button
                onClick={openAdd}
                className="fixed bottom-[80px] right-5 w-[56px] h-[56px] bg-black rounded-full flex items-center justify-center shadow-xl active:scale-90 z-40"
            >
                <Plus size={24} className="text-white" />
            </button>

            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6">
                        <h3 className="font-inter font-bold text-[18px] mb-2">Ta bort produkt?</h3>
                        <p className="font-inter text-[14px] text-gray-400 mb-6">Detta kan inte ångras.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 h-[48px] border border-gray-200 rounded-2xl font-inter font-semibold">Avbryt</button>
                            <button onClick={() => handleDelete(deleteId)} className="flex-1 h-[48px] bg-red-500 rounded-2xl font-inter font-semibold text-white">Ta bort</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-inter font-bold text-[20px]">{editItem ? 'Redigera produkt' : 'Ny produkt'}</h3>
                            <button onClick={() => setShowModal(false)}><X size={22} className="text-gray-400" /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Titel *</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="T.ex. Nordic Hold Hair Clay"
                                    className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                            </div>
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Beskrivning</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-[15px] outline-none focus:border-black resize-none" />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block font-inter text-[13px] text-gray-500 mb-1">Pris (kr) *</label>
                                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                                </div>
                                <div className="flex-1">
                                    <label className="block font-inter text-[13px] text-gray-500 mb-1">Kategori</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full h-[48px] border border-gray-200 rounded-xl px-3 font-inter text-[14px] outline-none focus:border-black bg-white">
                                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block font-inter text-[13px] text-gray-500 mb-1">Bild-URL</label>
                                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full h-[48px] border border-gray-200 rounded-xl px-4 font-inter text-[15px] outline-none focus:border-black" />
                                {form.image_url.startsWith('http') && (
                                    <img src={form.image_url} alt="preview" className="mt-2 h-20 w-20 rounded-xl object-cover border border-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
                                )}
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <p className="font-inter text-[12px] text-blue-600">📌 Produkten kan köpas i salongen.</p>
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={!form.title || !form.price || saving}
                            className="mt-6 w-full h-[52px] bg-black rounded-2xl flex items-center justify-center disabled:opacity-40">
                            {saving ? <Loader2 size={18} className="text-white animate-spin" /> : <span className="font-inter font-semibold text-white">{editItem ? 'Uppdatera' : 'Skapa produkt'}</span>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarberProductsPage;
