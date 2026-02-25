import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { Product, Service } from '../types';

interface BookingPageProps {
  item: Product | Service;
  onBack: () => void;
  onConfirm: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ item, onBack, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<number>(2); // Defaulting to the 2nd based on design
  const [selectedTime, setSelectedTime] = useState<string | null>('10:30');

  const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  
  // Generating a mock calendar grid for visual similarity
  // Starting from prev month days to fill the grid
  const CALENDAR_DAYS = [
    { day: 31, status: 'inactive' }, // Prev month
    { day: 1, status: 'default' },
    { day: 2, status: 'selected' },
    { day: 3, status: 'default' },
    { day: 4, status: 'default' },
    { day: 5, status: 'default' },
    { day: 6, status: 'default' },
    { day: 7, status: 'default' },
    { day: 8, status: 'default' },
    { day: 9, status: 'default' },
    { day: 10, status: 'default' },
    { day: 11, status: 'default' },
    { day: 12, status: 'default' },
    { day: 13, status: 'default' },
    { day: 14, status: 'default' },
    { day: 15, status: 'default' },
    { day: 16, status: 'default' },
    { day: 17, status: 'default' },
    { day: 18, status: 'default' },
    { day: 19, status: 'default' },
    { day: 20, status: 'default' },
    { day: 21, status: 'default' },
    { day: 22, status: 'default' },
    { day: 23, status: 'default' },
    { day: 24, status: 'default' },
    { day: 25, status: 'default' },
    { day: 26, status: 'default' },
    { day: 27, status: 'default' },
    { day: 28, status: 'default' },
    { day: 29, status: 'default' },
    { day: 30, status: 'default' },
    { day: 31, status: 'default' },
    { day: 1, status: 'inactive' },
    { day: 2, status: 'inactive' },
    { day: 3, status: 'inactive' },
  ];

  const TIME_SLOTS = ['10:30', '12:30', '13:30'];

  return (
    <div className="flex flex-col min-h-full bg-white pb-32 pt-8">
      
      {/* Back Button (Added for navigation safety) */}
      <div className="px-5 mb-2">
        <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full"
        >
            <ArrowLeft size={20} className="text-[#333333]" />
        </button>
      </div>

      {/* --- Calendar Card --- */}
      <div className="px-5">
        <div className="w-full bg-white rounded-[20px] shadow-[0px_12px_24px_rgba(0,0,0,0.07)] border border-[#E5E5EF] p-4 pb-6">
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <ChevronLeft size={20} className="text-[#9291A5]" />
                <span className="text-[#615E83] font-inter font-bold text-[18px]">November 2022</span>
                <ChevronRight size={20} className="text-[#9291A5]" />
            </div>

            {/* Days Row */}
            <div className="grid grid-cols-7 mb-4">
                {DAYS.map((d) => (
                    <div key={d} className="text-center text-[#9291A5] font-inter font-medium text-[16px]">
                        {d}
                    </div>
                ))}
            </div>

            {/* Separator */}
            <div className="h-[1px] bg-[#F2F1FF] w-full mb-4"></div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-y-4 justify-items-center">
                {CALENDAR_DAYS.map((d, index) => {
                   const isSelected = selectedDate === d.day && d.status !== 'inactive';
                   return (
                    <div key={index} className="relative w-[30px] h-[30px] flex items-center justify-center cursor-pointer" onClick={() => d.status !== 'inactive' && setSelectedDate(d.day)}>
                        {isSelected && (
                            <div className="absolute inset-0 bg-[#4A3AFF] rounded-full shadow-md"></div>
                        )}
                        <span className={`relative z-10 text-[16px] font-inter font-normal ${
                            isSelected ? 'text-white' : 
                            d.status === 'inactive' ? 'text-[#9291A5]' : 'text-[#1D1C2B]'
                        }`}>
                            {d.day}
                        </span>
                    </div>
                   );
                })}
            </div>
        </div>
      </div>

      {/* --- Time Slots --- */}
      <div className="px-8 mt-8 flex gap-5 overflow-x-auto no-scrollbar">
         {TIME_SLOTS.map((time) => (
             <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`
                    w-[113px] h-[75px] rounded-[17px] border border-black flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${selectedTime === time ? 'bg-black text-white shadow-lg' : 'bg-white text-black shadow-[4px_4px_4px_rgba(0,0,0,0.25)]'}
                `}
             >
                 <span className="font-inter font-bold text-[18px]">{time}</span>
             </button>
         ))}
      </div>

      {/* --- Service Summary --- */}
      <div className="px-8 mt-10">
          <h2 className="text-black font-inter font-medium text-[24px] mb-2">{item.title}</h2>
          <p className="text-black font-inter font-light text-[17px]">2 Timmar</p>
          
          <div className="mt-8 flex justify-between items-baseline border-t border-gray-100 pt-4">
              <span className="text-black font-inter font-bold text-[24px]">Totalt</span>
              <span className="text-black font-inter font-medium text-[24px]">Fr. {item.price}$</span>
          </div>
      </div>

      {/* --- Disclaimer --- */}
      <div className="px-11 mt-8 mb-24">
          <p className="text-black font-inter font-light text-[10px] text-center leading-tight opacity-70">
            Genom att klicka på "Slutför bokning" bekräftar du köp från Cute HairCut i Lund och godkänner Bokadirekts allmänna villkor
          </p>
      </div>

      {/* --- Bottom Action Bar --- */}
      <div className="absolute bottom-6 left-0 w-full px-9 z-50">
          <button 
            onClick={onConfirm}
            className="w-full h-[75px] bg-black rounded-[20px] flex items-center justify-between px-2 pl-4 pr-6 shadow-[0px_13px_26px_-2px_rgba(0,0,0,0.12)] active:scale-95 transition-transform"
          >
              
              {/* Icon Box */}
              <div className="w-[51px] h-[51px] bg-white rounded-[15px] flex items-center justify-center">
                  <ArrowRight size={24} className="text-black" strokeWidth={2.5} />
              </div>

              {/* Text */}
              <span className="text-white font-poppins font-medium text-[19px]">Book this Service</span>

              {/* Price */}
              <span className="text-white font-poppins font-medium text-[19px]">{item.price}$</span>

          </button>
      </div>

    </div>
  );
};

export default BookingPage;