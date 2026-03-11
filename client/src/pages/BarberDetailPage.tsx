import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Heart, MoreHorizontal, Globe, MessageCircle,
  Phone, MapPin, Share2, Star, Clock, Loader2, Info,
  ShoppingBag, Scissors, LayoutGrid, CheckCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavouritesContext';
import { BarberShop, BarberDetail, Product, Service } from '../types';
import ProductCard from '../components/ProductCard';

interface BarberDetailPageProps {
  barber: BarberShop;
  onBack: () => void;
  onSeeAllProducts: () => void;
  onProductClick: (item: Product | Service) => void;
}

// ── Tiny inline toast ──────────────────────────────────────────
interface ToastState { msg: string; type: 'info' | 'error' }
let _setToast: ((t: ToastState | null) => void) | null = null;
const toast = (msg: string, type: ToastState['type'] = 'info') => _setToast?.({ msg, type });

const InlineToast: React.FC = () => {
  const [state, setState] = useState<ToastState | null>(null);
  _setToast = setState;
  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => setState(null), 3200);
    return () => clearTimeout(t);
  }, [state]);
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl max-w-[320px]"
        >
          {state.type === 'error'
            ? <X size={16} className="text-red-400 shrink-0" />
            : <CheckCircle size={16} className="text-green-400 shrink-0" />}
          <span className="font-inter text-[14px]">{state.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Action button ──────────────────────────────────────────────
const ActionBtn: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon: Icon, label, onClick, active = true }) => (
  <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={onClick}>
    <button
      className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all active:scale-90 ${active
          ? 'bg-[#F2F2F2] group-hover:bg-gray-200'
          : 'bg-[#F2F2F2] opacity-50'
        }`}
    >
      <Icon size={20} className="text-black" strokeWidth={1.8} />
    </button>
    <span className={`text-[12px] font-inter font-medium text-center leading-tight ${active ? 'text-black/60' : 'text-black/30'}`}>
      {label}
    </span>
  </div>
);

// ── Days ───────────────────────────────────────────────────────
const DAYS_SV: Record<string, string> = {
  monday: 'Måndag', tuesday: 'Tisdag', wednesday: 'Onsdag',
  thursday: 'Torsdag', friday: 'Fredag', saturday: 'Lördag', sunday: 'Söndag',
};
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const formatTime = (t: string | null) => t?.slice(0, 5) ?? '';

// ── Service card ───────────────────────────────────────────────
const ServiceCard: React.FC<{ service: Service; onBook: (s: Service) => void }> = ({ service, onBook }) => (
  <div className="flex items-center gap-4 p-4 bg-[#F9F9F9] rounded-2xl hover:bg-gray-100 transition-colors">
    <div className="w-[70px] h-[70px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
      <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-inter font-semibold text-[15px] text-black truncate">{service.title}</h3>
      <p className="font-inter text-[12px] text-black/50 mt-0.5 line-clamp-1">{service.description}</p>
      <div className="flex items-center gap-3 mt-2">
        {service.duration_minutes && (
          <span className="flex items-center gap-1 text-[11px] text-black/40 font-inter">
            <Clock size={10} /> {service.duration_minutes} min
          </span>
        )}
        <span className="text-[14px] font-inter font-bold text-black">{service.price} kr</span>
      </div>
    </div>
    <button
      onClick={() => onBook(service)}
      className="flex-shrink-0 px-4 py-2 bg-black text-white rounded-xl text-[13px] font-inter font-medium hover:bg-gray-800 transition-colors active:scale-95"
    >
      Boka
    </button>
  </div>
);

// ── Skeleton ───────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
);

// ── Tabs ───────────────────────────────────────────────────────
type Tab = 'all' | 'services' | 'products' | 'info';
const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'all', icon: LayoutGrid, label: 'Allt' },
  { id: 'services', icon: Scissors, label: 'Tjänster' },
  { id: 'products', icon: ShoppingBag, label: 'Produkter' },
  { id: 'info', icon: Info, label: 'Info' },
];

// ── Main component ─────────────────────────────────────────────
const BarberDetailPage: React.FC<BarberDetailPageProps> = ({
  barber, onBack, onSeeAllProducts, onProductClick,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [detail, setDetail] = useState<BarberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [productCatFilter, setProductCatFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/barbers/${barber.id}`)
      .then(r => r.json())
      .then(data => { setDetail(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [barber.id]);

  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(barber.id);

  // Resolved values — detail takes priority over barber prop
  const phone = detail?.phone || barber.phone || '';
  const website = (detail as any)?.website || barber.website || '';
  const address = detail?.address || barber.address || '';
  const city = detail?.city || barber.city || '';
  const fullAddress = [address, city].filter(Boolean).join(', ');

  // ── Action handlers ──────────────────────────────────────────
  const handleWebsite = useCallback(() => {
    if (!website) {
      toast('Ingen hemsida registrerad för denna frisör', 'info');
      return;
    }
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [website]);

  const handleWhatsApp = useCallback(() => {
    if (!phone) {
      toast('Frisören har inte lagt till något telefonnummer', 'info');
      return;
    }
    // E.164 → WhatsApp expects digits only, no +
    const digits = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer');
  }, [phone]);

  const handleCall = useCallback(() => {
    if (!phone) {
      toast('Frisören har inte lagt till något telefonnummer', 'info');
      return;
    }
    window.open(`tel:${phone}`);
  }, [phone]);

  const handleAddress = useCallback(() => {
    if (!address) {
      toast('Ingen adress registrerad för denna frisör', 'info');
      return;
    }
    const q = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener,noreferrer');
  }, [address, fullAddress]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: barber.name,
      text: `Kolla in ${barber.name} — boka din tid på Cut & Click!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast('Länk kopierad till urklipp!', 'info');
      }
    } catch {
      // User cancelled share — do nothing
    }
  }, [barber.name]);

  const handleToggleFavourite = useCallback(async () => {
    if (!user?.token) {
      toast('Logga in för att spara favoriter', 'info');
      return;
    }
    await toggleFavorite(barber.id);
  }, [user, barber.id, toggleFavorite]);

  const allItems: (Product | Service)[] = detail
    ? [...(detail.services || []), ...(detail.products || [])].sort(() => Math.random() - 0.5)
    : [];

  const info = detail || barber;

  return (
    <div className="flex flex-col min-h-full bg-white relative pb-10">
      <InlineToast />

      {/* Hero Image */}
      <div className="relative w-full h-[360px] md:h-[440px] flex-shrink-0">
        <img
          src={detail?.image || barber.image}
          alt={barber.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111]/70 via-transparent to-transparent" />

        {/* Nav bar */}
        <div className="absolute top-10 left-0 w-full px-6 flex justify-between items-center z-20">
          <button
            onClick={onBack}
            className="w-[45px] h-[45px] bg-white/10 backdrop-blur-sm rounded-[16px] border border-white/15 flex items-center justify-center shadow-md hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleToggleFavourite}
              className="w-[45px] h-[45px] bg-white/10 backdrop-blur-sm rounded-[16px] border border-white/15 flex items-center justify-center shadow-md hover:bg-white/20 transition-colors"
            >
              <motion.div animate={favorited ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                <Heart size={20} className={favorited ? 'text-red-400 fill-red-400' : 'text-white'} />
              </motion.div>
            </motion.button>
            <button
              onClick={handleShare}
              className="w-[45px] h-[45px] bg-white rounded-[16px] flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal size={20} className="text-black" />
            </button>
          </div>
        </div>

        {/* Floating info card */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[302px] md:w-[420px] bg-black/40 backdrop-blur-[24px] rounded-[20px] border border-white/10 shadow-xl flex flex-col justify-center px-6 py-4 z-10">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h1 className="text-white font-roboto font-semibold text-[22px] md:text-[24px] truncate">{barber.name}</h1>
            {address && <span className="text-[#CAC8C8] font-roboto text-[15px] truncate">{address}</span>}
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[#CAC8C8] font-roboto text-[15px]">{city}</span>
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[#CAC8C8] font-roboto text-[16px]">{barber.rating}</span>
              {detail?.total_reviews ? (
                <span className="text-[#CAC8C8]/60 font-roboto text-[12px]">({detail.total_reviews})</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 px-4 flex justify-between items-start md:justify-center md:gap-14">
        <ActionBtn
          icon={Globe}
          label="Websida"
          onClick={handleWebsite}
          active={!!website}
        />
        <ActionBtn
          icon={MessageCircle}
          label="Medela"
          onClick={handleWhatsApp}
          active={!!phone}
        />
        <ActionBtn
          icon={Phone}
          label="Ring"
          onClick={handleCall}
          active={!!phone}
        />
        <ActionBtn
          icon={MapPin}
          label="Adress"
          onClick={handleAddress}
          active={!!address}
        />
        <ActionBtn
          icon={Share2}
          label="Dela"
          onClick={handleShare}
          active
        />
      </div>

      {/* Tab Bar */}
      <div className="mt-8 px-6 flex gap-2 border-b border-gray-100">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-[13px] font-inter font-medium transition-all ${activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'text-black/40 hover:text-black hover:bg-gray-50'
                }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6 px-6 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (loading ? '-loading' : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 w-full"
          >

        {loading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="h-[80px] w-3/4" />
          </div>
        )}

        {/* ALL */}
        {!loading && activeTab === 'all' && (
          <>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {allItems.slice(0, 6).map(item => (
                <div key={item.id} className="flex-shrink-0">
                  <ProductCard product={item as Product} onClick={() => onProductClick(item)} />
                </div>
              ))}
            </div>
            {allItems.length === 0 && (
              <p className="text-center text-black/40 font-inter py-8">Inga tjänster eller produkter ännu</p>
            )}
          </>
        )}

        {/* SERVICES */}
        {!loading && activeTab === 'services' && (
          <div className="flex flex-col gap-3">
            {(detail?.services || []).length === 0 ? (
              <p className="text-center text-black/40 font-inter py-8">Inga tjänster ännu</p>
            ) : (
              (detail?.services || []).map(s => (
                <ServiceCard key={s.id} service={s} onBook={() => onProductClick(s)} />
              ))
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {!loading && activeTab === 'products' && (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { key: 'all', label: 'Alla' },
                { key: 'hair', label: 'Hår' },
                { key: 'beard', label: 'Skägg' },
                { key: 'skincare', label: 'Hudvård' },
                { key: 'tools', label: 'Verktyg' },
                { key: 'general', label: 'Övrigt' },
              ].map(cat => (
                <button key={cat.key}
                  onClick={() => setProductCatFilter(cat.key)}
                  className={`flex-shrink-0 px-4 h-[36px] rounded-xl font-inter font-medium text-[13px] transition-all ${productCatFilter === cat.key
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {(detail?.products || [])
                .filter(p => productCatFilter === 'all' || (p as Product).category === productCatFilter)
                .map(p => (
                  <ProductCard key={p.id} product={p} className="w-full" onClick={() => onProductClick(p)} />
                ))}
            </div>
            {(detail?.products || []).filter(p =>
              productCatFilter === 'all' || (p as Product).category === productCatFilter
            ).length === 0 && (
                <p className="text-center text-black/40 font-inter py-8">
                  {productCatFilter === 'all' ? 'Inga produkter ännu' : 'Inga produkter i denna kategori'}
                </p>
              )}
          </>
        )}

        {/* INFO */}
        {!loading && activeTab === 'info' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#F9F9F9] rounded-2xl p-5 flex flex-col gap-3">
              <h3 className="font-inter font-semibold text-[16px] text-black">{info.salon_name || info.name}</h3>

              {/* Address row — clickable */}
              {address && (
                <button
                  onClick={handleAddress}
                  className="flex items-start gap-2 text-black/60 hover:text-black transition-colors text-left"
                >
                  <MapPin size={14} className="mt-0.5 flex-shrink-0 text-black/40" />
                  <span className="font-inter text-[14px]">{fullAddress}</span>
                </button>
              )}

              {/* Phone — clickable → tel */}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors">
                  <Phone size={14} className="text-black/40" />
                  <span className="font-inter text-[14px]">{phone}</span>
                </a>
              )}

              {/* Website — clickable */}
              {website ? (
                <button
                  onClick={handleWebsite}
                  className="flex items-center gap-2 text-black/60 hover:text-black transition-colors text-left"
                >
                  <Globe size={14} className="text-black/40" />
                  <span className="font-inter text-[14px] truncate">{website.replace(/^https?:\/\//, '')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-black/25">
                  <Globe size={14} />
                  <span className="font-inter text-[13px]">Ingen hemsida</span>
                </div>
              )}

              {/* WhatsApp quick link */}
              {phone && (
                <button
                  onClick={handleWhatsApp}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors font-inter font-medium text-[14px]"
                >
                  <MessageCircle size={15} />
                  Skicka meddelande på WhatsApp
                </button>
              )}

              {/* Bio */}
              {detail?.bio && (
                <p className="font-inter text-[14px] text-black/60 leading-relaxed border-t border-gray-100 pt-3 mt-1">
                  {detail.bio}
                </p>
              )}
            </div>

            {/* Opening hours */}
            {detail?.opening_hours && detail.opening_hours.length > 0 && (
              <div className="bg-[#F9F9F9] rounded-2xl p-5">
                <h3 className="font-inter font-semibold text-[15px] text-black mb-4">Öppettider</h3>
                <div className="flex flex-col gap-2">
                  {DAY_ORDER.map(day => {
                    const oh = detail.opening_hours.find(h => h.day_of_week === day);
                    const today = new Date().toLocaleDateString('en-EN', { weekday: 'long' }).toLowerCase();
                    const isToday = day === today;
                    return (
                      <div key={day} className={`flex justify-between items-center py-1.5 ${isToday ? 'font-semibold text-black' : 'text-black/60'}`}>
                        <span className="font-inter text-[14px]">
                          {DAYS_SV[day]}
                          {isToday && <span className="ml-2 text-[10px] uppercase tracking-wider text-green-500 font-bold">Idag</span>}
                        </span>
                        <span className="font-inter text-[14px]">
                          {!oh || oh.is_closed
                            ? <span className="text-red-400">Stängt</span>
                            : `${formatTime(oh.open_time)} — ${formatTime(oh.close_time)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Google Maps Embed */}
            {address && (
              <div className="rounded-2xl overflow-hidden h-[220px] bg-gray-100 shadow-sm">
                <iframe
                  title="Karta"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                />
              </div>
            )}
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Deco blob */}
      <div className="absolute bottom-[100px] right-[-50px] w-[200px] h-[200px] bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
    </div>
  );
};

export default BarberDetailPage;