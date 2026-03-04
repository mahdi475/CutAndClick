import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MapPin, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Favourite {
  barber_id: string;
  salon_name: string;
  city: string;
  salon_address: string;
  image: string;
  rating: number | null;
}

interface FavouritesPageProps {
  onBack: () => void;
  onBarberClick?: (barberId: string) => void;
}

const FavouritesPage: React.FC<FavouritesPageProps> = ({ onBack, onBarberClick }) => {
  const { user } = useAuth();
  const [favs, setFavs] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const token = user?.token;

  const load = () => {
    if (!token) { setLoading(false); return; }
    fetch('/api/favourites', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setFavs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const handleRemove = async (barberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemoving(barberId);
    setFavs(prev => prev.filter(f => f.barber_id !== barberId)); // optimistic
    await fetch(`/api/favourites/${barberId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setRemoving(null);
  };

  return (
    <div className="flex flex-col min-h-full bg-white pb-24 px-6 pt-10">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <button onClick={onBack} className="w-[44px] h-[44px] bg-white rounded-[14px] border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft className="text-[#222]" size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-[#333] font-inter font-bold text-[24px]">Mina Favoriter</h1>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center pt-16">
          <Loader2 size={28} className="animate-spin text-black/30" />
        </div>
      ) : !token ? (
        <div className="flex flex-col items-center pt-20 gap-4">
          <Heart size={48} className="text-gray-200" />
          <p className="font-inter text-gray-400 text-center">Logga in för att spara favoriter</p>
        </div>
      ) : favs.length === 0 ? (
        <div className="flex flex-col items-center pt-16 gap-4 text-center px-8">
          <Heart size={52} className="text-gray-200" />
          <p className="font-inter font-semibold text-[18px] text-black">Inga favoriter ännu</p>
          <p className="font-inter text-[14px] text-gray-400">Utforska barbershops och spara dina favoriter! 💈</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-inter text-[14px] text-gray-400 pl-1">{favs.length} sparade barbershops</p>
          {favs.map(fav => (
            <button
              key={fav.barber_id}
              onClick={() => onBarberClick?.(fav.barber_id)}
              className="w-full bg-[#FAFAFA] rounded-[24px] shadow-sm flex items-center px-4 py-3 gap-4 relative border border-gray-100 hover:shadow-md transition-shadow active:scale-[0.99]"
            >
              {/* Avatar */}
              <div className="w-[60px] h-[60px] rounded-[16px] overflow-hidden bg-gray-200 flex-shrink-0">
                {fav.image
                  ? <img src={fav.image} alt={fav.salon_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center text-white font-bold text-xl">✂</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="font-roboto font-semibold text-[17px] text-black truncate">{fav.salon_name}</p>
                <p className="font-roboto text-[14px] text-gray-400 truncate">
                  {fav.city}{fav.salon_address ? `, ${fav.salon_address}` : ''}
                </p>
                {fav.rating && fav.rating > 0 ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-inter text-[12px] text-gray-500">{fav.rating.toFixed(1)}</span>
                  </div>
                ) : null}
              </div>

              {/* Remove heart */}
              <button
                onClick={e => handleRemove(fav.barber_id, e)}
                className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 hover:bg-red-100 transition-colors"
              >
                {removing === fav.barber_id
                  ? <Loader2 size={14} className="animate-spin text-red-400" />
                  : <Heart size={16} className="text-red-400 fill-red-400" />
                }
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;