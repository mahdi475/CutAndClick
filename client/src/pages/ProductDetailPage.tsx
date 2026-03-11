import React, { useState } from 'react';
import { ArrowLeft, Heart, Clock, MapPin, Star, Calendar, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, Service } from '../types';

interface ProductDetailPageProps {
    item: Product | Service;
    onBack: () => void;
    onBookNow?: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ item, onBack, onBookNow }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

    // Is it a Service (has description field) or a Product?
    const isService = 'description' in item && Boolean((item as Service).description);
    const description = (item as Service).description || (item as Product).subtitle || '';
    const duration = (item as Service).duration_minutes;
    const category = (item as Product).category;

    const placeholderImg = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800';

    return (
        <div className="flex flex-col min-h-full bg-white pb-32">

            {/* ── Hero image ───────────────────────────── */}
            <div className="relative w-full h-[460px] rounded-b-[25px] overflow-hidden">
                <motion.img
                    layoutId={`store-item-image-${item.id}`}
                    src={item.image || placeholderImg}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Nav buttons */}
                <div className="absolute top-10 w-full px-6 flex justify-between z-20">
                    <button onClick={onBack} className="w-[44px] h-[44px] bg-black/40 backdrop-blur-[20px] rounded-full flex items-center justify-center">
                        <ArrowLeft size={22} className="text-white" />
                    </button>
                    <button className="w-[44px] h-[44px] bg-black/40 backdrop-blur-[20px] rounded-full flex items-center justify-center">
                        <Heart size={20} className="text-white" />
                    </button>
                </div>

                {/* Floating info card */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] bg-black/30 backdrop-blur-[20px] rounded-[18px] border border-white/10 px-5 py-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                        <h1 className="text-white font-inter font-bold text-[22px] leading-tight truncate">{item.title}</h1>
                        {duration && <p className="text-white/70 font-inter text-[14px] mt-0.5">{duration} min</p>}
                        {category && !isService && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-lg text-white/80 font-inter text-[11px] uppercase tracking-wide">
                                {category}
                            </span>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className="text-white/60 font-inter text-[13px]">Pris</span>
                        <div className="text-white font-inter font-bold text-[24px] leading-tight">{item.price} kr</div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ─────────────────────────────────── */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="px-6 mt-6 flex items-center gap-6 border-b border-gray-100 pb-3"
            >
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`font-inter font-semibold text-[17px] pb-1 transition-all ${activeTab === 'overview' ? 'text-black border-b-2 border-black' : 'text-black/40'}`}
                >
                    Översikt
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={`font-inter font-semibold text-[17px] pb-1 transition-all ${activeTab === 'details' ? 'text-black border-b-2 border-black' : 'text-black/40'}`}
                >
                    Detaljer
                </button>
            </motion.div>

            {/* ── Content ──────────────────────────────── */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="px-6 mt-6"
            >
                {activeTab === 'overview' ? (
                    <>
                        {/* Stats row */}
                        <div className="flex gap-5 mb-6">
                            {duration && (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#EDEDED] rounded-xl flex items-center justify-center"><Clock size={14} className="text-[#3F3F3F]" /></div>
                                    <span className="text-[#7E7E7E] font-roboto font-medium text-[15px]">{duration} min</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#EDEDED] rounded-xl flex items-center justify-center"><Star size={14} className="text-[#3F3F3F] fill-[#3F3F3F]" /></div>
                                <span className="text-[#7E7E7E] font-roboto font-medium text-[15px]">4.5</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-[#555] font-roboto text-[16px] leading-[26px]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}>
                            {description || (isService
                                ? 'En komplett genomgång av hår och skägg. Tjänsten inkluderar konsultation, precisionsklippning och styling.'
                                : 'Professionell produkt av hög kvalitet. Tillgänglig för köp direkt i salongen.'
                            )}
                        </p>

                        {/* Product-specific: "in-salon" notice */}
                        {!isService && (
                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
                                <Store size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-inter font-semibold text-[14px] text-blue-700">Finns i salongen</p>
                                    <p className="font-inter text-[13px] text-blue-500 mt-0.5">Denna produkt kan köpas direkt vid ditt besök i salongen.</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Details tab */}
                        {isService ? (
                            <div className="flex flex-col gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="font-inter font-semibold text-[14px] text-black mb-2">Vad ingår</p>
                                    <ul className="flex flex-col gap-2">
                                        {['Konsultation & rådgivning', 'Precisionsklippning (fade/sax)', 'Skäggtrimning (valfritt)', 'Knivrakning av linjer', 'Tvätt & styling'].map(s => (
                                            <li key={s} className="flex items-center gap-2 font-inter text-[14px] text-gray-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {duration && (
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <p className="font-inter font-semibold text-[14px] text-black mb-1">Varaktighet</p>
                                        <p className="font-inter text-[14px] text-gray-500">{duration} minuter</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="font-inter font-semibold text-[14px] text-black mb-2">Innehåll / Ingredienser</p>
                                    <p className="font-inter text-[14px] text-gray-500">Se förpackningens etikett för fullständig ingrediensförteckning.</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="font-inter font-semibold text-[14px] text-black mb-2">Användning</p>
                                    <p className="font-inter text-[14px] text-gray-500">Applicera på fuktigt eller torrt hår. Forma efter önskad stil. Fråga din barber om råd för bästa resultat.</p>
                                </div>
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
                                    <p className="font-inter font-bold text-[13px] text-orange-600">Köps i salongen</p>
                                    <p className="font-inter text-[12px] text-orange-500 mt-0.5">Ingen onlineförsäljning — besök salongen för att köpa.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* ── Bottom CTA ───────────────────────────── */}
            <div className="absolute bottom-6 left-0 w-full px-6 z-50">
                {isService ? (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        onClick={() => {
                            if (window.navigator?.vibrate) window.navigator.vibrate(50);
                            onBookNow?.();
                        }}
                        className="w-full h-[66px] bg-black rounded-[20px] flex items-center justify-center gap-3 shadow-xl hover:bg-gray-800 outline-none"
                    >
                        <span className="text-white font-inter font-bold text-[18px]">Boka Nu</span>
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <Calendar size={13} className="text-black" />
                        </div>
                    </motion.button>
                ) : (
                    <div className="relative">
                        <button
                            disabled
                            className="w-full h-[66px] bg-gray-200 rounded-[20px] flex items-center justify-center gap-3 cursor-not-allowed"
                        >
                            <Store size={20} className="text-gray-400" />
                            <span className="text-gray-400 font-inter font-bold text-[18px]">Finns i salongen</span>
                        </button>
                        <p className="text-center text-gray-400 font-inter text-[12px] mt-2">Denna produkt kan köpas direkt i salongen</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;