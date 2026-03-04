import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';

interface ReviewModalProps {
    barberId: string;
    salonName: string;
    salonImage?: string;
    token: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    barberId, salonName, salonImage, token, onClose, onSuccess
}) => {
    const [stars, setStars] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!stars) { setError('Välj ett betyg (1-5 stjärnor)'); return; }
        if (desc.length > 0 && desc.length < 10) { setError('Beskrivningen måste vara minst 10 tecken'); return; }
        setSaving(true); setError('');
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ barber_id: barberId, stars, review_title: title || null, review_description: desc || null }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Fel vid skickande'); setSaving(false); return; }
            onSuccess();
        } catch { setError('Serverfel, försök igen'); setSaving(false); }
    };

    const displayStars = hovered || stars;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 max-h-[85vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-inter font-bold text-[20px] text-black">Lämna omdöme</h3>
                    <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                {/* Salon info (readonly) */}
                <div className="flex items-center gap-3 mb-6 bg-gray-50 rounded-2xl p-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        {salonImage
                            ? <img src={salonImage} alt={salonName} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">{salonName[0]}</div>
                        }
                    </div>
                    <p className="font-inter font-semibold text-[15px] text-black">{salonName}</p>
                </div>

                {/* Star picker */}
                <div className="mb-5">
                    <p className="font-inter text-[13px] text-gray-500 mb-3">Betyg *</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button key={s}
                                onMouseEnter={() => setHovered(s)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setStars(s)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    size={38}
                                    className={displayStars >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                                />
                            </button>
                        ))}
                    </div>
                    {stars > 0 && (
                        <p className="font-inter text-[13px] text-gray-400 mt-2">
                            {['', 'Dåligt 😞', 'Okej 😐', 'Bra 🙂', 'Mycket bra 😊', 'Utmärkt! 🤩'][stars]}
                        </p>
                    )}
                </div>

                {/* Title */}
                <div className="mb-4">
                    <label className="block font-inter text-[13px] text-gray-500 mb-1">Rubrik (valfritt)</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="T.ex. Fantastisk service!"
                        maxLength={80}
                        className="w-full h-[44px] border border-gray-200 rounded-xl px-4 font-inter text-[14px] outline-none focus:border-black" />
                </div>

                {/* Description */}
                <div className="mb-5">
                    <label className="block font-inter text-[13px] text-gray-500 mb-1">Beskrivning (min 10 tecken)</label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)}
                        rows={4} maxLength={500}
                        placeholder="Beskriv din upplevelse..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-[14px] outline-none focus:border-black resize-none" />
                    <p className="font-inter text-[11px] text-gray-300 text-right mt-1">{desc.length}/500</p>
                </div>

                {error && <p className="font-inter text-[13px] text-red-500 mb-4 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

                <button onClick={handleSubmit} disabled={saving || !stars}
                    className="w-full h-[52px] bg-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-gray-800 transition-colors">
                    {saving
                        ? <Loader2 size={18} className="text-white animate-spin" />
                        : <span className="font-inter font-semibold text-white text-[16px]">Skicka omdöme ⭐</span>
                    }
                </button>
            </div>
        </div>
    );
};

export default ReviewModal;
