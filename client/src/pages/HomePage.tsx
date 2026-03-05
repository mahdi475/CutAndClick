import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Bell } from 'lucide-react';
import BarberCard from '../components/BarberCard';
import NotificationsPanel from '../components/NotificationsPanel';
import { BarberShop } from '../types';
import { useAuth } from '../context/AuthContext';

// ----------------------------------------
// Loading skeleton
// ----------------------------------------
const BarberSkeleton: React.FC = () => (
  <div className="flex-shrink-0 w-[270px] h-[405px] rounded-[30px] bg-gray-100 animate-pulse md:w-full">
    <div className="w-full h-full rounded-[30px] bg-gradient-to-br from-gray-200 to-gray-100" />
  </div>
);

const TABS = [
  { id: 'most_viewed', label: 'Populärast' },
  { id: 'nearby', label: 'Nära mig' },
  { id: 'latest', label: 'Nyast' },
];

interface HomePageProps {
  onBarberClick: (barber: BarberShop) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onBarberClick }) => {
  const { user } = useAuth();

  const [barbers, setBarbers] = useState<BarberShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('most_viewed');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BarberShop[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.token) return;
    const fetchUnread = () =>
      fetch('/api/notifications', { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => r.json())
        .then(d => { if (Array.isArray(d)) setUnreadCount(d.filter((n: any) => !n.is_read).length); })
        .catch(() => { });
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user?.token]);

  // ── Fetch all barbers on mount (with 5-min sessionStorage cache) ─
  const fetchBarbers = useCallback(async (filter: string) => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/barbers';
      if (filter === 'nearby' && user?.location) {
        url = `/api/barbers/nearby?city=${encodeURIComponent(user.location)}`;
      }

      // ── Session cache ──────────────────────────────────────────
      const cacheKey = `cc_barbers_${filter}_${user?.location || 'all'}`;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < 5 * 60 * 1000) { // 5 min TTL
            setBarbers(data);
            setLoading(false);
            return;
          }
        }
      } catch { /* sessionStorage ej tillgänglig */ }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Kunde inte hämta barbershops');

      let result: BarberShop[] = data;

      // Client-side sort for 'latest' (API already returns by rating for others)
      if (filter === 'latest') {
        result = [...result].sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      }

      setBarbers(result);
    } catch (err: any) {
      setError(err.message || 'Serverfel');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchBarbers(activeFilter); }, [activeFilter, fetchBarbers]);

  // ── Debounced search ──────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setShowDropdown(false);
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/barbers/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSearchResults(res.ok ? data : []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = user?.username || 'Dig';
  const displayBarbers = barbers;

  return (
    <div className="flex flex-col min-h-full bg-white relative">

      {/* Header */}
      <div className="px-7 pt-12 pb-4 flex justify-between items-center lg:pt-10">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-[#2F2F2F] font-montserrat font-semibold text-[26px]">Hej,</span>
            <span className="text-[#2F2F2F] font-montserrat font-bold text-[26px]"> {displayName}</span>
          </div>
          <h2 className="text-[#888888] font-inter font-medium text-[18px] tracking-wide mt-1">
            Utforska Barbershops
          </h2>
        </div>

        <div
          onClick={() => { if (user?.token) { setShowNotifs(true); setUnreadCount(0); } }}
          className="relative w-[50px] h-[50px] bg-[#2F2F2F] rounded-full overflow-visible shadow-lg cursor-pointer transition-transform hover:scale-105 flex items-center justify-center"
        >
          {user?.profile_pic_url
            ? <img src={user.profile_pic_url} alt="User" className="w-full h-full object-cover rounded-full" />
            : <span className="text-white font-inter font-bold text-[16px]">{displayName.charAt(0).toUpperCase()}</span>
          }
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center z-10">
              <span className="text-white font-inter font-bold text-[10px] px-1">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-7 mt-6 md:max-w-md relative" ref={searchRef}>
        <div className="relative w-full h-[58px] rounded-[20px] border-[1.5px] border-[#D2D2D2] flex items-center px-5 bg-white shadow-sm hover:border-gray-400 transition-colors focus-within:border-black">
          <Search className="text-[#888888] w-5 h-5 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Sök på salong eller stad..."
            className="w-full h-full outline-none text-[#2F2F2F] placeholder-[#888888] font-roboto font-medium text-[15px] bg-transparent"
          />
          {searchQuery ? (
            <button onClick={() => { setSearchQuery(''); setShowDropdown(false); setSearchResults([]); }}>
              <X className="text-[#888888] w-5 h-5 ml-2 hover:text-black transition-colors" />
            </button>
          ) : (
            <>
              <div className="h-6 w-[1.5px] bg-[#D2D2D2] mx-3" />
              <button className="p-1">
                <SlidersHorizontal className="text-[#888888] w-6 h-6 transform rotate-90" />
              </button>
            </>
          )}
        </div>

        {/* Search Dropdown */}
        {showDropdown && (
          <div className="absolute top-[64px] left-7 right-7 bg-white border border-gray-100 rounded-[16px] shadow-xl z-50 overflow-hidden">
            {searching ? (
              <div className="px-5 py-4 text-[#888888] font-inter text-sm">Söker...</div>
            ) : searchResults.length === 0 ? (
              <div className="px-5 py-4 text-[#888888] font-inter text-sm">Inga resultat för "{searchQuery}"</div>
            ) : (
              searchResults.map(b => (
                <button
                  key={b.id}
                  onClick={() => { setShowDropdown(false); setSearchQuery(''); onBarberClick(b); }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <img src={b.image} alt={b.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  <div>
                    <p className="font-inter font-semibold text-[14px] text-black">{b.name}</p>
                    <p className="font-inter text-[12px] text-[#888888]">{b.city}</p>
                  </div>
                  <div className="ml-auto text-[12px] font-inter text-[#888888]">{b.rating}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Title + View All */}
      <div className="px-7 mt-8 flex justify-between items-end">
        <h2 className="text-[#2F2F2F] font-poppins font-semibold text-[20px]">Populära platser</h2>
        <button className="text-[#888888] font-roboto font-semibold text-[14px] mb-1 hover:text-black transition-colors">
          Visa alla
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-7 mt-6 flex gap-4 overflow-x-auto no-scrollbar pb-2 md:overflow-visible md:flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex-shrink-0 px-6 h-[54px] rounded-[20px] flex items-center justify-center font-roboto font-medium text-[15px] transition-all duration-300
              ${activeFilter === tab.id
                ? 'bg-[#2F2F2F] text-white shadow-[0px_9px_19px_rgba(0,0,0,0.15)]'
                : 'bg-[#FBFBFB] text-[#C5C5C5] hover:bg-gray-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barber Cards */}
      <div className="pl-7 mt-8 pb-10 flex overflow-x-auto snap-x snap-mandatory no-scrollbar pr-7 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:pl-7 md:pr-7 md:pb-12 md:overflow-visible">
        {loading ? (
          // Loading skeletons
          [1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 mr-6 md:mr-0 snap-center md:w-full">
              <BarberSkeleton />
            </div>
          ))
        ) : error ? (
          <div className="w-full text-center py-16 col-span-4">
            <p className="text-red-500 font-inter mb-3">{error}</p>
            <button
              onClick={() => fetchBarbers(activeFilter)}
              className="px-6 py-2 bg-black text-white rounded-xl font-inter text-sm hover:bg-gray-800 transition-colors"
            >
              Försök igen
            </button>
          </div>
        ) : displayBarbers.length === 0 ? (
          <div className="w-full text-center py-16 col-span-4">
            <p className="text-[#888888] font-inter text-lg">Inga barbershops hittades</p>
            <p className="text-[#aaa] font-inter text-sm mt-1">
              {activeFilter === 'nearby' ? 'Inga salonger i din stad än' : 'Kom tillbaka senare'}
            </p>
          </div>
        ) : (
          displayBarbers.map(barber => (
            <div key={barber.id} className="flex-shrink-0 mr-6 md:mr-0 snap-center md:w-full">
              <BarberCard
                data={barber}
                onClick={() => onBarberClick(barber)}
              />
            </div>
          ))
        )}
        <div className="w-1 flex-shrink-0 md:hidden" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-[500px] left-[50px] w-[200px] h-[200px] bg-blue-400 opacity-10 blur-[80px] rounded-full pointer-events-none z-0 mix-blend-multiply" />
      <div className="absolute top-[600px] right-[50px] w-[200px] h-[200px] bg-purple-400 opacity-10 blur-[80px] rounded-full pointer-events-none z-0 mix-blend-multiply" />

      {/* Notifications panel */}
      {showNotifs && (
        <NotificationsPanel
          token={user?.token || null}
          onClose={() => setShowNotifs(false)}
        />
      )}
    </div>
  );
};

export default HomePage;