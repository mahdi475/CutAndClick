import React from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  className?: string;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = "", onClick }) => (
  <div
    onClick={() => onClick?.(product)}
    className={`relative flex-shrink-0 w-[176px] h-[217px] rounded-[12px] overflow-hidden bg-[#D9D9D9] shadow-lg group cursor-pointer active:scale-95 transition-transform duration-200 ${className}`}
  >
    <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

    <div className="absolute inset-0 bg-black/10" />

    <div className="absolute top-3 right-3 w-[21px] h-[21px] bg-[#1D1D1D]/40 backdrop-blur-[9px] flex items-center justify-center rounded-sm">
      <Plus size={12} className="text-white" />
    </div>

    <div className="absolute top-3 left-3 w-[21px] h-[21px] bg-[#1D1D1D]/40 backdrop-blur-[9px] flex items-center justify-center rounded-sm">
      <ShoppingBag size={10} className="text-white" />
    </div>

    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[156px] h-[49px] bg-[#1D1D1D]/30 backdrop-blur-[10px] rounded-[7px] border border-white/10 px-3 flex flex-col justify-center shadow-lg">
      <div className="flex justify-between items-start">
        <span className="text-white font-inter font-semibold text-[11px] truncate w-full">{product.title}</span>
      </div>
      <div className="flex justify-between items-end mt-[1px]">
        <span className="text-[#CAC8C8] font-roboto font-normal text-[8px] truncate max-w-[50%]">{product.subtitle}</span>
        <div className="flex flex-col items-end leading-none">
          <span className="text-[#CAC8C8] font-roboto font-normal text-[7px] mb-[1px]">Price</span>
          <div className="flex items-baseline gap-[1px]">
            <span className="text-[#434343] font-roboto font-medium text-[9px]">$</span>
            <span className="text-[#CAC8C8] font-roboto font-medium text-[12px]">{product.price}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductCard;