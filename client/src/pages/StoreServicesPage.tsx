import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BarberShop, Service, Product } from '../types';
import StoreItemCard from '../components/StoreItemCard';

interface StoreServicesPageProps {
  barber: BarberShop;
  onBack: () => void;
  onItemClick: (item: Service | Product) => void;
}

const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Herrklippning',
    description: 'Skin fade / taper fade',
    price: 230,
    image: 'https://placehold.co/400',
    details: 'En komplett genomgång av hår och skägg. Tjänsten inkluderar konsultation, precisionsklippning (fade eller sax) samt skäggtrimning. Vi avslutar med knivrakning av linjer, tvätt och styling för ett hållbart resultat.'
  },
  {
    id: 's2',
    title: 'Skäggtrim',
    description: 'formning + längdjustering',
    price: 230,
    image: 'https://placehold.co/400'
  },
  {
    id: 's3',
    title: 'Line-up',
    description: 'Straight fire',
    price: 230,
    image: 'https://placehold.co/400'
  },
  {
    id: 's4',
    title: 'Buzz Cut',
    description: 'Maskin hela huvudet',
    price: 180,
    image: 'https://placehold.co/400'
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Skägg Olja',
    subtitle: 'För skägget',
    price: 230,
    image: 'https://placehold.co/400'
  },
  {
    id: 'p2',
    title: 'Hår Clay',
    subtitle: 'För Håret',
    price: 230,
    image: 'https://placehold.co/400'
  },
  {
    id: 'p3',
    title: 'After shave Olja',
    subtitle: 'After du har shaveat',
    price: 230,
    image: 'https://placehold.co/400'
  }
];

const TABS = ['All', 'Tjänster', 'Producter', 'Favouriter', 'Info'];

const StoreServicesPage: React.FC<StoreServicesPageProps> = ({ barber, onBack, onItemClick }) => {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="flex flex-col min-h-full bg-white relative pb-6">

      {/* --- Top Header --- */}
      <div className="flex justify-between items-start px-7 pt-10">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="w-[45px] h-[45px] bg-white rounded-[16px] border border-gray-100 shadow-[0px_2px_10px_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#333333]" strokeWidth={2.5} />
          </button>
          <span className="text-[#333333] font-inter font-bold text-[16px]">Utforska</span>
        </div>

        {/* User Avatar */}
        <div className="w-[50px] h-[50px] bg-[#2F2F2F] rounded-full overflow-hidden relative shadow-lg">
          <img
            src="https://placehold.co/150"
            alt="User"
            className="w-full h-full object-cover transform rotate-4"
          />
        </div>
      </div>

      {/* --- Barber Title Info --- */}
      <div className="px-7 mt-8">
        <h1 className="text-[#333333] font-inter font-semibold text-[30px] leading-tight">
          {barber.name}, {barber.address.split(',')[0]}
        </h1>
        <h2 className="text-[#BDBDBD] font-inter font-normal text-[21px] mt-1">
          Alla Tjänster
        </h2>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="px-7 mt-8 flex gap-8 overflow-x-auto no-scrollbar md:gap-12 md:overflow-visible">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              font-inter text-[16px] whitespace-nowrap transition-colors hover:text-[#262626]
              ${activeTab === tab
                ? 'font-semibold text-[#262626]'
                : 'font-normal text-[#BDBDBD]'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- Content Sections --- */}
      <div className="mt-8 flex-1 overflow-y-auto no-scrollbar pb-10">

        {/* Services Section */}
        {(activeTab === 'All' || activeTab === 'Tjänster') && (
          <div className="mb-10 pl-7 md:pr-7">
            {/* Responsive Grid/Scroll */}
            <div className="flex overflow-x-auto pb-4 no-scrollbar pr-7 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pr-0">
              {MOCK_SERVICES.map(service => (
                <div key={service.id} className="md:w-full">
                  <StoreItemCard item={service} type="service" onClick={onItemClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {(activeTab === 'All' || activeTab === 'Producter') && (
          <div className="pl-7 md:pr-7">
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-[#333333] font-inter font-extralight text-[20px]">Recommended Products</h2>
              <button className="flex items-center gap-1 text-[#6C6C6C] font-inter text-[16px] hover:text-black">
                See Alla
                <ArrowRight size={14} className="bg-[#424040] text-white rounded-full p-0.5 w-4 h-4" />
              </button>
            </div>

            <div className="flex overflow-x-auto pb-4 no-scrollbar pr-7 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pr-0">
              {MOCK_PRODUCTS.map(product => (
                <div key={product.id} className="md:w-full">
                  <StoreItemCard item={product} type="product" onClick={onItemClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab === 'Favouriter' && <div className="px-7 text-gray-400">No favourites yet.</div>}
        {activeTab === 'Info' && <div className="px-7 text-gray-400">Store information here.</div>}

      </div>

    </div>
  );
};

export default StoreServicesPage;