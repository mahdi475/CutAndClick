import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MapPin, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavouritesContext';
import { BarberShop } from '../types';

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
  onBarberClick?: (barber: BarberShop) => void;
  onItemClick?: (item: any) => void;
}

const FavouritesPage: React.FC<FavouritesPageProps> = ({ onBack, onBarberClick, onItemClick }) => {
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

  const { toggleFavorite } = useFavorites();

  const handleRemove = async (barberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemoving(barberId);
    setFavs(prev => prev.filter(f => f.barber_id !== barberId)); // optimistic local
    await toggleFavorite(barberId); // this updates global context
    setRemoving(null);
  };

  const [sortBy, setSortBy] = useState<'name' | 'city' | 'newest'>('newest');

  const sortedFavs = [...favs].sort((a, b) => {
    if (sortBy === 'name') return a.salon_name.localeCompare(b.salon_name);
    if (sortBy === 'city') return a.city.localeCompare(b.city);
    return 0; // 'newest' is default from API usually, but we don't have created_at here yet. 
    // If we wanted real 'newest' sorting, we'd need created_at in the Favourite interface.
  });

  return (
    <div className="flex flex-col min-h-full bg-white pb-24 px-6 pt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="w-[44px] h-[44px] bg-white rounded-[14px] border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ArrowLeft className="text-[#222]" size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-[#333] font-inter font-bold text-[24px]">Mina Favoriter</h1>
        </div>

        {favs.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-50 border-none text-[12px] font-inter font-medium rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-black"
          >
            <option value="newest">Senaste</option>
            <option value="name">Namn</option>
            <option value="city">Stad</option>
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center pt-16">
          <Loader2 size={28} className="animate-spin text-black/30" />
        </div>
      ) : !token ? (
        <div className="flex flex-col items-center pt-20 gap-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
            <Heart size={32} className="text-gray-200" />
          </div>
          <p className="font-inter font-semibold text-black">Inloggning krävs</p>
          <p className="font-inter text-gray-400 text-sm max-w-[200px]">Logga in för att se och hantera dina sparade favoriter.</p>
        </div>
      ) : favs.length === 0 ? (
        <div className="flex flex-col items-center pt-16 gap-4 text-center px-8">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
            <Heart size={40} className="text-gray-200" />
          </div>
          <p className="font-inter font-semibold text-[18px] text-black">Inga favoriter ännu</p>
          <p className="font-inter text-[14px] text-gray-400">Ditt hjärta är tomt. Utforska de bästa salongerna och börja spara dina favoriter här!</p>
          <button onClick={onBack} className="mt-4 px-6 py-2 bg-black text-white rounded-xl font-inter text-sm">Utforska nu</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-inter text-[13px] text-black/40 pl-1 uppercase tracking-wider font-bold">
            {favs.length} {favs.length === 1 ? 'sparad salong' : 'sparade salonger'}
          </p>
          {sortedFavs.map(fav => (
            <motion.div
              key={fav.barber_id}
              drag="x"
              dragConstraints={{ left: -100, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) {
                  handleRemove(fav.barber_id, { stopPropagation: () => { } } as any);
                }
              }}
              className="relative"
            >
              {/* Swipe background indicator */}
              <div className="absolute inset-0 bg-red-500 rounded-[24px] flex items-center justify-end px-6 z-0">
                <Heart size={20} className="text-white fill-white" />
              </div>

              <motion.button
                onClick={() => onBarberClick?.({
                  id: fav.barber_id,
                  name: fav.salon_name,
                  salon_name: fav.salon_name,
                  address: fav.salon_address,
                  city: fav.city,
                  image: fav.image,
                  rating: fav.rating || 0,
                  isPopular: (fav.rating || 0) >= 4.5
                } as BarberShop)}
                className="w-full bg-[#FAFAFA] rounded-[24px] shadow-sm flex items-center px-4 py-3 gap-4 relative border border-gray-100 hover:shadow-md transition-shadow active:scale-[0.99] z-10"
              >
                {/* Avatar */}
                <div className="w-[60px] h-[60px] rounded-[16px] overflow-hidden bg-gray-200 flex-shrink-0">
                  {fav.image
                    ? <img src={fav.image} alt={fav.salon_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center text-white font-bold text-xl"></div>
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

                {/* Remove heart (visible on desktop or if not swiping) */}
                <button
                  onClick={e => handleRemove(fav.barber_id, e)}
                  className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 hover:bg-red-100 transition-colors"
                >
                  {removing === fav.barber_id
                    ? <Loader2 size={14} className="animate-spin text-red-400" />
                    : <Heart size={16} className="text-red-400 fill-red-400" />
                  }
                </button>
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;