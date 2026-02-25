import React from 'react';
import { ArrowLeft, Heart, MoreHorizontal, Globe, MessageCircle, Phone, MapPin, Share2, Star } from 'lucide-react';
import { BarberShop, Product, Service } from '../types';
import ProductCard from '../components/ProductCard';

interface BarberDetailPageProps {
  barber: BarberShop;
  onBack: () => void;
  onSeeAllProducts: () => void;
  onProductClick: (item: Product | Service) => void;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Skägg Olja',
    subtitle: 'För skägget',
    price: 230,
    image: 'https://placehold.co/400'
  },
  {
    id: '2',
    title: 'Herrklippning',
    subtitle: 'Skin fade / taper fade',
    price: 230,
    image: 'https://placehold.co/400'
  },
  {
    id: '3',
    title: 'Vaxning',
    subtitle: 'Hår styling',
    price: 150,
    image: 'https://placehold.co/400'
  },
  {
    id: '4',
    title: 'Styling Gel',
    subtitle: 'Starkt fäste',
    price: 180,
    image: 'https://placehold.co/400'
  }
];

const ActionButton: React.FC<{ icon: React.ElementType, label: string }> = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center gap-2 group cursor-pointer">
    <button className="w-[50px] h-[50px] bg-[#E5E5E5] rounded-[17px] flex items-center justify-center group-hover:bg-gray-300 transition-colors">
      <Icon size={20} className="text-black" strokeWidth={2} />
    </button>
    <span className="text-[14px] font-inter font-medium text-black/65 text-center leading-tight">
      {label}
    </span>
  </div>
);

const BarberDetailPage: React.FC<BarberDetailPageProps> = ({ barber, onBack, onSeeAllProducts, onProductClick }) => {
  return (
    <div className="flex flex-col min-h-full bg-white relative pb-6">

      {/* --- Top Image Header --- */}
      <div className="relative w-full h-[360px] md:h-[450px]">
        <img
          src={barber.image}
          alt={barber.name}
          className="w-full h-full object-cover"
        />

        {/* Header Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#222222]/70 to-transparent pointer-events-none" />

        {/* --- Navigation Bar --- */}
        <div className="absolute top-10 left-0 w-full px-6 flex justify-between items-center z-20">
          <button
            onClick={onBack}
            className="w-[45px] h-[45px] bg-white/10 backdrop-blur-sm rounded-[16px] border border-white/10 flex items-center justify-center shadow-[0px_2px_10px_rgba(0,0,0,0.2)] hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>

          <div className="flex gap-4">
            <button className="w-[45px] h-[45px] bg-white/10 backdrop-blur-sm rounded-[16px] border border-white/10 flex items-center justify-center shadow-[0px_2px_10px_rgba(0,0,0,0.2)] hover:bg-white/20 transition-colors">
              <Heart size={20} className="text-white" />
            </button>
            <button className="w-[45px] h-[45px] bg-white rounded-[16px] border border-white/10 flex items-center justify-center shadow-[0px_2px_10px_rgba(0,0,0,0.2)] hover:bg-gray-100 transition-colors">
              <MoreHorizontal size={20} className="text-[#222222]" />
            </button>
          </div>
        </div>

        {/* --- Floating Info Card --- */}
        <div className="absolute bottom-[36px] left-1/2 -translate-x-1/2 w-[302px] h-[101px] bg-[#1D1D1D]/40 backdrop-blur-[27px] rounded-[20px] shadow-[0px_6px_12px_rgba(255,255,255,0.1)] border border-white/5 flex flex-col justify-center px-6 z-10 md:w-[400px] md:h-[120px]">
          <div className="flex items-baseline gap-1">
            <h1 className="text-white font-roboto font-medium text-[22px] md:text-[26px]">{barber.name},</h1>
            <span className="text-[#CAC8C8] font-roboto font-medium text-[19px] md:text-[22px]">{barber.address}</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-[#CAC8C8] font-roboto font-normal text-[19px] md:text-[20px]">{barber.city.split(',')[0]}</span>

            <div className="flex items-center gap-1.5">
              <div className="w-[21px] h-[21px] bg-[#CAC8C8] flex items-center justify-center rounded-sm">
                <Star size={14} className="text-white fill-white" />
              </div>
              <span className="text-[#CAC8C8] font-roboto font-normal text-[19px] md:text-[20px]">{barber.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="mt-8 px-4 flex justify-between items-start md:justify-center md:gap-16">
        <ActionButton icon={Globe} label="Websida" />
        <ActionButton icon={MessageCircle} label="Medela" />
        <ActionButton icon={Phone} label="Ring" />
        <ActionButton icon={MapPin} label="Adress" />
        <ActionButton icon={Share2} label="Dela" />
      </div>

      {/* --- Recommended Products --- */}
      <div className="mt-10 md:mt-16 md:px-7">
        <div className="px-6 flex justify-between items-end mb-5 md:px-0">
          <h2 className="text-[#333333] font-inter font-extralight text-[21px] md:text-[24px]">Recommended Products</h2>
          <button
            onClick={onSeeAllProducts}
            className="flex items-center gap-1 text-[#6C6C6C] font-inter text-[16px] hover:text-black transition-colors"
          >
            See Alla
            <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>

        {/* Responsive List: Scroll on Mobile, Grid on Tablet/Desktop */}
        <div className="pl-6 flex overflow-x-auto pb-4 no-scrollbar md:pl-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible">
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} className="mr-4 md:mr-0">
              <ProductCard product={product} className="md:w-full" onClick={onProductClick} />
            </div>
          ))}
        </div>
      </div>

      {/* Background Blurs for atmosphere */}
      <div className="absolute bottom-[100px] right-[-50px] w-[200px] h-[200px] bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />

    </div>
  );
};

export default BarberDetailPage;