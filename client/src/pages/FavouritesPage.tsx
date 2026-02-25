import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, Service } from '../types';

interface FavouritesPageProps {
  onItemClick?: (item: Product | Service) => void;
  onBack: () => void;
}

const FAV_BARBERS = [
  {
    id: '1',
    name: 'ProClips',
    address: 'Avenyn',
    city: 'Göteborg',
    image: 'https://placehold.co/200'
  },
  {
    id: '2',
    name: 'Ferrari Cutzz',
    address: 'Avenyn',
    city: 'Göteborg',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '3',
    name: 'Ferrari Cutzz',
    address: 'Avenyn',
    city: 'Göteborg',
    image: 'https://placehold.co/200'
  },
  {
    id: '4',
    name: 'Fade Masters',
    address: 'Central',
    city: 'Stockholm',
    image: 'https://placehold.co/200'
  }
];

const SAVED_PRODUCTS: Product[] = [
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
    title: 'Hår Clay',
    subtitle: 'För Håret',
    price: 230,
    image: 'https://placehold.co/400'
  }
];

const TABS = [
  { id: 'most_viewed', label: 'Most Viewed' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'latest', label: 'Latest' }
];

const FavouritesPage: React.FC<FavouritesPageProps> = ({ onItemClick, onBack }) => {
  const [activeFilter, setActiveFilter] = useState('most_viewed');

  return (
    <div className="flex flex-col min-h-full bg-white relative pb-24 px-7 pt-10 md:px-10">

      {/* --- Header --- */}
      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={onBack}
          className="w-[45px] h-[45px] bg-white rounded-[16px] border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="text-[#222222]" size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-[#333333] font-inter font-bold text-[25px]">Mina Favoriter</h1>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 mb-8 md:overflow-visible">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`
              flex-shrink-0 px-6 h-[54px] rounded-[20px] flex items-center justify-center font-roboto font-medium text-[15px] transition-all duration-300
              ${activeFilter === tab.id
                ? 'bg-[#2F2F2F] text-white shadow-[0px_9px_19px_rgba(0,0,0,0.15)]'
                : 'bg-[#FBFBFB] text-[#C5C5C5] hover:bg-gray-100'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- Section: Frisörer (Barbers) --- */}
      <div>
        <h2 className="text-[#888888] font-inter font-bold text-[17px] mb-4 pl-3">Frisörer</h2>
        <div className="flex flex-col gap-4 mb-8 md:grid md:grid-cols-2 lg:grid-cols-3">
          {FAV_BARBERS.map((barber, index) => (
            <div key={`${barber.id}-${index}`} className="w-full h-[86px] bg-[#FBFBFB] rounded-[30px] shadow-[0px_9px_28px_rgba(0,0,0,0.05)] flex items-center px-4 relative hover:shadow-lg transition-shadow cursor-pointer">
              {/* Avatar */}
              <img
                src={barber.image}
                alt={barber.name}
                className="w-[55px] h-[55px] rounded-[15px] object-cover bg-gray-200 flex-shrink-0"
              />

              {/* Info */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex flex-col leading-tight">
                  <span className="text-black font-roboto font-medium text-[20px] truncate">
                    {barber.name},
                  </span>
                  <span className="text-[#CAC8C8] font-roboto font-medium text-[16px] truncate">
                    {barber.city}, {barber.address}
                  </span>
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

      {/* --- Section: Sparade Produkter (Saved Products) --- */}
      <div>
        <h2 className="text-[#888888] font-inter font-bold text-[17px] mb-4 pl-3">Sparade Produkter</h2>
        <div className="flex overflow-x-auto pb-4 no-scrollbar -mx-7 px-7 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible">
          {SAVED_PRODUCTS.map(product => (
            <div key={product.id} className="mr-4 md:mr-0 md:w-full">
              <ProductCard product={product} className="md:w-full" onClick={onItemClick} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default FavouritesPage;