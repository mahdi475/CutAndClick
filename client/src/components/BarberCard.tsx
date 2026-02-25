import React from 'react';
import { Star, Heart } from 'lucide-react';
import { BarberShop } from '../types';

interface BarberCardProps {
  data: BarberShop;
  onClick?: () => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ data, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative flex-shrink-0 w-[270px] md:w-full h-[405px] rounded-[30px] overflow-hidden group cursor-pointer active:scale-95 transition-transform duration-200 shadow-sm hover:shadow-xl"
    >
      {/* Background Image */}
      <img
        src={data.image}
        alt={data.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

      {/* Heart Icon Button (Top Right) */}
      <button className="absolute top-4 right-4 w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors z-10" onClick={(e) => e.stopPropagation()}>
        <Heart size={20} color="white" />
      </button>

      {/* Floating Info Card (Bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[224px] h-[75px] bg-[#1D1D1D]/40 backdrop-filter backdrop-blur-[20px] rounded-[15px] border border-white/10 shadow-lg flex flex-col justify-center px-4">

        {/* Title Row */}
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-white font-roboto font-medium text-[16px] truncate max-w-[70%]">
            {data.name}
          </h3>
          <span className="text-[#CAC8C8] font-roboto font-medium text-[12px] truncate">
            {data.address}
          </span>
        </div>

        {/* Subtitle Row (Location & Rating) */}
        <div className="flex justify-between items-center">
          <p className="text-[#CAC8C8] font-roboto text-[12px]">
            {data.city}
          </p>

          <div className="flex items-center gap-1">
            <Star size={12} className="fill-[#CAC8C8] text-[#CAC8C8]" />
            <span className="text-[#CAC8C8] font-roboto text-[12px]">
              {data.rating}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BarberCard;