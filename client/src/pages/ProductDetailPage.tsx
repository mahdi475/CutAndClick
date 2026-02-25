import React from 'react';
import { ArrowLeft, Heart, Clock, MapPin, Star, Calendar } from 'lucide-react';
import { Product, Service } from '../types';

interface ProductDetailPageProps {
    item: Product | Service;
    onBack: () => void;
    onBookNow?: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ item, onBack, onBookNow }) => {
    // Determine if it's a Service or Product for the subtitle
    const subtitle = 'description' in item ? item.description : item.subtitle;

    // Default description text if none provided in the item data
    const description = item.details || "En komplett genomgång av hår och skägg. Tjänsten inkluderar konsultation, precisionsklippning (fade eller sax) samt skäggtrimning. Vi avslutar med knivrakning av linjer, tvätt och styling för ett hållbart resultat.";

    return (
        <div className="flex flex-col min-h-full bg-white pb-32">

            {/* --- Top Image Section --- */}
            <div className="relative w-full h-[460px] rounded-b-[25px] overflow-hidden">
                <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Navigation Buttons */}
                <div className="absolute top-10 w-full px-7 flex justify-between z-20">
                    <button
                        onClick={onBack}
                        className="w-[44px] h-[44px] bg-[#1D1D1D]/40 backdrop-blur-[20px] rounded-full flex items-center justify-center"
                    >
                        <ArrowLeft size={24} className="text-[#E1E1E1]" />
                    </button>

                    <button
                        className="w-[44px] h-[44px] bg-[#1D1D1D]/40 backdrop-blur-[20px] rounded-full flex items-center justify-center"
                    >
                        <Heart size={20} className="text-[#E1E1E1]" />
                    </button>
                </div>

                {/* Floating Info Card */}
                <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[calc(100%-48px)] h-[104px] bg-[#1D1D1D]/30 backdrop-blur-[20px] rounded-[15px] shadow-[0px_5px_9px_rgba(255,255,255,0.1)] flex items-center justify-between px-6 border border-white/5">
                    <div>
                        <h1 className="text-white font-inter font-semibold text-[24px] leading-tight mb-1">{item.title}</h1>
                        <p className="text-[#CAC8C8] font-roboto font-normal text-[18px]">{subtitle}</p>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[#CAC8C8] font-roboto font-normal text-[16px]">Price</span>
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-[#434343] font-roboto font-medium text-[20px]">$</span>
                            <span className="text-[#CAC8C8] font-roboto font-medium text-[26px]">{item.price}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Content Section --- */}
            <div className="px-7 mt-8">

                {/* Section Tabs */}
                <div className="flex items-center gap-6 mb-6">
                    <span className="text-[#1B1B1B] font-inter font-semibold text-[22px] border-b-2 border-transparent">Overview</span>
                    <span className="text-[#1B1B1B]/60 font-inter font-semibold text-[16px]">Details</span>
                </div>

                {/* Stats Row */}
                <div className="flex gap-4 mb-8">
                    {/* Duration */}
                    <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[34px] bg-[#EDEDED] rounded-[6px] flex items-center justify-center">
                            <Clock size={16} className="text-[#3F3F3F]" />
                        </div>
                        <span className="text-[#7E7E7E] font-roboto font-medium text-[18px]">2 hours</span>
                    </div>

                    {/* Distance */}
                    <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[34px] bg-[#EDEDED] rounded-[6px] flex items-center justify-center">
                            <MapPin size={16} className="text-[#3F3F3F]" />
                        </div>
                        <span className="text-[#7E7E7E] font-roboto font-medium text-[18px]">2.3 Km</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[34px] bg-[#EDEDED] rounded-[6px] flex items-center justify-center">
                            <Star size={16} className="text-[#3F3F3F] fill-[#3F3F3F]" />
                        </div>
                        <span className="text-[#7E7E7E] font-roboto font-medium text-[18px]">4.5</span>
                    </div>
                </div>

                {/* Description Text */}
                <p className="text-[#A5A5A5] font-roboto font-medium text-[18px] leading-[27px]">
                    {description}
                </p>

            </div>

            {/* --- Sticky Bottom Booking Bar --- */}
            <div className="absolute bottom-6 left-0 w-full px-7 z-50">
                <button
                    onClick={onBookNow}
                    className="w-full h-[66px] bg-gradient-to-t from-[#1B1B1B] to-[#1B1B1B]/95 shadow-[0px_13px_26px_-2px_rgba(0,0,0,0.12)] rounded-[20px] flex items-center justify-center gap-3 relative overflow-hidden active:scale-95 transition-transform"
                >
                    {/* Subtle light overlay */}
                    <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                    <span className="text-white font-roboto font-medium text-[20px]">Book Now</span>
                    <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center">
                        <Calendar size={14} className="text-black" />
                    </div>
                </button>
            </div>

        </div>
    );
};

export default ProductDetailPage;