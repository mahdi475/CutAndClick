import React from 'react';
import { Plus } from 'lucide-react';
import { Service, Product } from '../types';

interface StoreItemCardProps {
  item: Service | Product;
  type: 'service' | 'product';
  onClick?: (item: Service | Product) => void;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, type, onClick }) => {
  // Map properties based on whether it's a Service (description) or Product (subtitle)
  const subtitle = 'description' in item ? item.description : item.subtitle;

  return (
    <div
      onClick={() => onClick?.(item)}
      className="relative flex-shrink-0 w-[177px] md:w-full h-[217px] rounded-[12px] overflow-hidden bg-[#D9D9D9] mr-4 md:mr-0 shadow-lg group cursor-pointer active:scale-95 transition-transform duration-200"
    >
      {/* Image */}
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

      {/* Glassmorphism Info Box */}
      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-[156px] md:w-[90%] h-[49px] bg-[#1D1D1D]/30 backdrop-blur-[9px] rounded-[7px] border border-white/10 shadow-lg flex items-center justify-between px-3">

        {/* Text Info */}
        <div className="flex flex-col justify-center h-full max-w-[65%]">
          <span className="text-white font-inter font-semibold text-[11px] truncate leading-tight">
            {item.title}
          </span>
          <span className="text-[#CAC8C8] font-roboto font-normal text-[8px] truncate leading-tight mt-0.5">
            {subtitle}
          </span>
        </div>

        {/* Price Info */}
        <div className="flex flex-col items-end justify-center h-full">
          <span className="text-[#CAC8C8] font-roboto font-normal text-[7px] mb-0.5">
            Price
          </span>
          <div className="flex items-baseline gap-[1px]">
            <span className="text-[#434343] font-roboto font-medium text-[9px]">$</span>
            <span className="text-[#CAC8C8] font-roboto font-medium text-[12px]">{item.price}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Visual only based on design snippet, reusing the blurred squares from design) */}
      <div className="absolute top-[10px] left-[10px] w-[21px] h-[21px] bg-[#1D1D1D]/40 backdrop-blur-[9px] rounded-sm flex items-center justify-center">
        {/* Icon placeholder based on design */}
        <div className="w-[8px] h-[9px] border border-[#E1E1E1] opacity-50"></div>
      </div>

      <div className="absolute top-[10px] right-[10px] w-[21px] h-[21px] bg-[#1D1D1D]/40 backdrop-blur-[9px] rounded-sm flex items-center justify-center hover:bg-[#1D1D1D]/60 transition-colors">
        <Plus size={10} className="text-white" />
      </div>

    </div>
  );
};

export default StoreItemCard;