import React, { useState } from 'react';
import { MoreHorizontal, Clock, ArrowLeft } from 'lucide-react';
import { Booking } from '../types';

const UPCOMING_BOOKING: Booking = {
    id: '1',
    barberName: 'Ferrari Cutzz',
    address: 'Avenyn',
    city: 'Göteborg',
    date: 'Imorgon, 14:30',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200'
};

const PAST_BOOKINGS: Booking[] = [
    {
        id: '2',
        barberName: 'ProClips',
        address: 'Avenyn',
        city: 'Göteborg',
        date: '12 Februari',
        price: 250,
        status: 'completed',
        image: 'https://placehold.co/200'
    },
    {
        id: '3',
        barberName: 'Ferrari Cutzz',
        address: 'Avenyn',
        city: 'Göteborg',
        date: '12 Februari',
        price: 250,
        status: 'cancelled',
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200'
    },
    {
        id: '4',
        barberName: 'GentleMensClub',
        address: 'Avenyn',
        city: 'Göteborg',
        date: '12 Februari',
        price: 250,
        status: 'completed',
        image: 'https://placehold.co/200'
    },
    {
        id: '5',
        barberName: 'Urban Cut',
        address: 'Vasastan',
        city: 'Stockholm',
        date: '10 Februari',
        price: 320,
        status: 'completed',
        image: 'https://placehold.co/200'
    }
];

interface HistoryPageProps {
    onBack: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    return (
        <div className="flex flex-col min-h-full bg-white relative pb-24 px-9 pt-10 md:px-10">

            {/* --- Header --- */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    onClick={onBack}
                    className="w-[45px] h-[45px] bg-white rounded-[16px] border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="text-[#222222]" size={20} strokeWidth={2.5} />
                </button>
                <h1 className="text-[#333333] font-inter font-bold text-[25px]">Historia</h1>
            </div>

            {/* --- Toggle Tabs --- */}
            <div className="w-full h-[53px] bg-[#D9D9D9] rounded-[20px] p-1 flex relative mb-8 md:max-w-md">
                {/* Animated Background for Tab */}
                <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[18px] transition-all duration-300 shadow-sm
            ${activeTab === 'upcoming' ? 'left-1' : 'left-[calc(50%)]'}
            `}
                />

                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex-1 z-10 font-inter font-bold text-[17px] transition-colors duration-300 ${activeTab === 'upcoming' ? 'text-black' : 'text-[#6B6B6B]'}`}
                >
                    Kommande
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`flex-1 z-10 font-inter font-bold text-[17px] transition-colors duration-300 ${activeTab === 'past' ? 'text-black' : 'text-[#6B6B6B]'}`}
                >
                    Gammalt
                </button>
            </div>

            {/* --- Content Area --- */}
            {activeTab === 'upcoming' && (
                <div className="flex flex-col gap-8 animate-fade-in">

                    {/* Active Booking Section */}
                    <div>
                        <h2 className="text-[#888888] font-inter font-bold text-[17px] mb-4 pl-2">Active Bookning</h2>

                        <div className="w-full bg-[#FBFBFB] rounded-[30px] p-5 shadow-[0px_9px_28px_rgba(0,0,0,0.1)] relative overflow-hidden md:max-w-2xl">

                            {/* Header: Avatar + Info */}
                            <div className="flex gap-4 items-start mb-4">
                                <img
                                    src={UPCOMING_BOOKING.image}
                                    alt={UPCOMING_BOOKING.barberName}
                                    className="w-[55px] h-[55px] rounded-[15px] object-cover bg-gray-200"
                                />
                                <div className="flex flex-col">
                                    <h3 className="text-black font-roboto font-medium text-[18px] leading-tight">
                                        {UPCOMING_BOOKING.barberName},
                                    </h3>
                                    <span className="text-[#CAC8C8] font-roboto font-medium text-[16px]">
                                        {UPCOMING_BOOKING.city}, {UPCOMING_BOOKING.address}
                                    </span>
                                </div>
                            </div>

                            {/* Time Info */}
                            <div className="flex items-center gap-3 mb-6 pl-2">
                                <div className="w-[34px] h-[34px] bg-[#EDEDED] rounded-[6px] flex items-center justify-center">
                                    <Clock size={16} className="text-[#3F3F3F]" />
                                </div>
                                <span className="text-[#7E7E7E] font-roboto font-medium text-[18px]">
                                    {UPCOMING_BOOKING.date}
                                </span>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between mt-2">
                                <button className="flex-1 h-[44px] bg-black rounded-[16px] text-white font-inter font-bold text-[15px] flex items-center justify-center mr-3 hover:bg-gray-800 transition-colors">
                                    View Details
                                </button>
                                <button className="w-[50px] h-[50px] bg-[#E5E5E5] rounded-[15px] flex items-center justify-center hover:bg-gray-300 transition-colors">
                                    <MoreHorizontal size={20} className="text-black" />
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Recently Visited Section */}
                    <div>
                        <h2 className="text-[#888888] font-inter font-bold text-[17px] mb-4 pl-2">Nyligen besökta</h2>

                        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-2">
                            {PAST_BOOKINGS.map((booking) => (
                                <div key={booking.id} className="w-full h-[86px] bg-[#FBFBFB] rounded-[30px] shadow-[0px_9px_28px_rgba(0,0,0,0.05)] flex items-center px-4 relative hover:shadow-lg transition-shadow cursor-pointer">
                                    {/* Avatar */}
                                    <img
                                        src={booking.image}
                                        alt={booking.barberName}
                                        className="w-[55px] h-[55px] rounded-[15px] object-cover bg-gray-200 flex-shrink-0"
                                    />

                                    {/* Info */}
                                    <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex flex-col">
                                            <span className="text-black font-roboto font-medium text-[16px] truncate">
                                                {booking.barberName}, <span className="text-[#CAC8C8] text-[14px]">{booking.city}, {booking.address}</span>
                                            </span>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[#656565] font-roboto font-medium text-[15px]">
                                                    {booking.date} {booking.price}Kr
                                                </span>
                                                <span className={`font-roboto font-medium text-[14px] mr-8
                                            ${booking.status === 'completed' ? 'text-[#00B84A]' : 'text-[#DF080B]'}
                                        `}>
                                                    {booking.status === 'completed' ? 'UTFÖRD' : 'AVBRYTEN'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Dots */}
                                    <div className="absolute right-5 flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-[#D9D9D9]"></div>
                                        <div className="w-2 h-2 rounded-full bg-[#D9D9D9]"></div>
                                        <div className="w-2 h-2 rounded-full bg-[#D9D9D9]"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'past' && (
                <div className="flex flex-col items-center justify-center pt-20 opacity-50">
                    <Clock size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-400 font-inter">No older history available</p>
                </div>
            )}

        </div>
    );
};

export default HistoryPage;