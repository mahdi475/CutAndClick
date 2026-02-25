import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import BarberCard from '../components/BarberCard';
import { BarberShop } from '../types';

const MOCK_BARBERS: BarberShop[] = [
  {
    id: '1',
    name: 'Ferrari Cutzz',
    address: 'Avenyn',
    city: 'Göteborg, Angered',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=400&h=600',
    isPopular: true
  },
  {
    id: '2',
    name: 'ProClips',
    address: 'South',
    city: 'Trollhättan, BookGatan',
    rating: 4.5,
    image: 'https://placehold.co/400x600',
    isPopular: true
  },
  {
    id: '3',
    name: 'Fade Masters',
    address: 'Central',
    city: 'Stockholm, City',
    rating: 4.9,
    image: 'https://placehold.co/400x600',
    isPopular: true
  },
  {
    id: '4',
    name: 'Urban Cut',
    address: 'Vasastan',
    city: 'Stockholm',
    rating: 4.7,
    image: 'https://placehold.co/400x600',
    isPopular: true
  },
  {
    id: '5',
    name: 'Gentlemens Club',
    address: 'Majorna',
    city: 'Göteborg',
    rating: 4.6,
    image: 'https://placehold.co/400x600',
    isPopular: true
  }
];

const TABS = [
  { id: 'most_viewed', label: 'Most Viewed' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'latest', label: 'Latest' }
];

interface HomePageProps {
  onBarberClick: (barber: BarberShop) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onBarberClick }) => {
  const [activeFilter, setActiveFilter] = useState('most_viewed');

  return (
    <div className="flex flex-col min-h-full bg-white relative">

      {/* --- Header Section --- */}
      <div className="px-7 pt-12 pb-4 flex justify-between items-center lg:pt-10">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-[#2F2F2F] font-montserrat font-semibold text-[26px]">Hi,</span>
            <span className="text-[#2F2F2F] font-montserrat font-bold text-[26px]"> </span>
            <span className="text-[#2F2F2F] font-montserrat font-semibold text-[26px]">David 👋</span>
          </div>
          <h2 className="text-[#888888] font-inter font-medium text-[18px] tracking-wide mt-1">
            Explore Barbershops
          </h2>
        </div>

        {/* User Avatar - Rotated per design */}
        <div className="w-[50px] h-[50px] bg-[#2F2F2F] rounded-full overflow-hidden relative shadow-lg cursor-pointer transition-transform hover:scale-105">
          <img
            src="https://placehold.co/150"
            alt="User"
            className="w-full h-full object-cover transform rotate-0"
          />
        </div>
      </div>

      {/* --- Search Section --- */}
      <div className="px-7 mt-6 md:max-w-md">
        <div className="relative w-full h-[58px] rounded-[20px] border-[1.5px] border-[#D2D2D2] flex items-center px-5 bg-white shadow-sm hover:border-gray-400 transition-colors">
          <Search className="text-[#888888] w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Search places"
            className="w-full h-full outline-none text-[#2F2F2F] placeholder-[#888888] font-roboto font-medium text-[16px] bg-transparent"
          />
          {/* Vertical Separator */}
          <div className="h-6 w-[1.5px] bg-[#D2D2D2] mx-3"></div>
          {/* Filter Icon Simulation */}
          <button className="p-1">
            <SlidersHorizontal className="text-[#888888] w-6 h-6 transform rotate-90" />
          </button>
        </div>
      </div>

      {/* --- Popular Places Title --- */}
      <div className="px-7 mt-8 flex justify-between items-end">
        <h2 className="text-[#2F2F2F] font-poppins font-semibold text-[20px]">
          Popular places
        </h2>
        <button className="text-[#888888] font-roboto font-semibold text-[14px] mb-1 hover:text-black transition-colors">
          View all
        </button>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="px-7 mt-6 flex gap-4 overflow-x-auto no-scrollbar pb-2 md:overflow-visible md:flex-wrap">
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

      {/* --- Responsive Content Area (Carousel on Mobile, Grid on Tablet/Desktop) --- */}
      <div className="pl-7 mt-8 pb-10 flex overflow-x-auto snap-x mandatory no-scrollbar pr-7 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:pl-7 md:pr-7 md:pb-12 md:overflow-visible">
        {MOCK_BARBERS.map((barber) => (
          <div key={barber.id} className="flex-shrink-0 mr-6 md:mr-0 snap-center md:w-full">
            <BarberCard
              data={barber}
              onClick={() => onBarberClick(barber)}
            />
          </div>
        ))}
        {/* Spacer for end of list on mobile */}
        <div className="w-1 flex-shrink-0 md:hidden"></div>
      </div>

      {/* Decorative Glow Effects */}
      <div className="absolute top-[500px] left-[50px] w-[200px] h-[200px] bg-blue-400 opacity-20 blur-[80px] rounded-full pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute top-[600px] right-[50px] w-[200px] h-[200px] bg-purple-400 opacity-20 blur-[80px] rounded-full pointer-events-none z-0 mix-blend-multiply"></div>

    </div>
  );
};

export default HomePage;