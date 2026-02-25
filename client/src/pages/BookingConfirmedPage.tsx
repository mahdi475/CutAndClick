import React from 'react';
import { Check, Calendar, Clock, MapPin } from 'lucide-react';

interface BookingConfirmedPageProps {
  onHome: () => void;
}

const BookingConfirmedPage: React.FC<BookingConfirmedPageProps> = ({ onHome }) => {
  return (
    <div className="flex flex-col h-full bg-white relative px-7 pt-20 pb-10">

      {/* --- Success Animation/Icon --- */}
      <div className="flex flex-col items-center justify-center mb-12">
        <div className="w-[100px] h-[100px] bg-[#00B84A]/10 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
          <div className="w-[60px] h-[60px] bg-[#00B84A] rounded-full flex items-center justify-center shadow-lg shadow-[#00B84A]/30">
            <Check size={32} className="text-white" strokeWidth={4} />
          </div>
        </div>
        <h1 className="text-[#333333] font-inter font-bold text-[30px] text-center leading-tight">
          Bokning <br /> Bekräftad!
        </h1>
        <p className="text-[#888888] font-inter font-medium text-[16px] mt-3 text-center max-w-[250px]">
          Din tid är reserverad. Vi har skickat en bekräftelse till din email.
        </p>
      </div>

      {/* --- Booking Receipt Card --- */}
      <div className="w-full bg-[#FBFBFB] rounded-[30px] p-6 shadow-[0px_9px_28px_rgba(0,0,0,0.05)] mb-auto relative overflow-hidden border border-[#F0F0F0]">

        {/* Decorative Top Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[4px] bg-[#E5E5E5] rounded-b-full"></div>

        <div className="flex flex-col gap-6 mt-2">

          {/* Barber Info */}
          <div className="flex items-start gap-4 border-b border-[#EAEAEA] pb-5">
            <img
              src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200"
              alt="Barber"
              className="w-[50px] h-[50px] rounded-[15px] object-cover"
            />
            <div>
              <h3 className="text-[#333333] font-roboto font-bold text-[18px]">Ferrari Cutzz</h3>
              <p className="text-[#888888] font-roboto text-[14px]">Avenyn, Göteborg</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-[#333333]">
                <Calendar size={14} />
              </div>
              <div>
                <span className="block text-[12px] text-[#AAAAAA] font-inter uppercase tracking-wide">Datum</span>
                <span className="block text-[15px] text-[#333333] font-inter font-medium">2 November 2022</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-[#333333]">
                <Clock size={14} />
              </div>
              <div>
                <span className="block text-[12px] text-[#AAAAAA] font-inter uppercase tracking-wide">Tid</span>
                <span className="block text-[15px] text-[#333333] font-inter font-medium">10:30 - 12:30</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center text-[#333333]">
                <MapPin size={14} />
              </div>
              <div>
                <span className="block text-[12px] text-[#AAAAAA] font-inter uppercase tracking-wide">Service</span>
                <span className="block text-[15px] text-[#333333] font-inter font-medium">Herrklippning</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- Action Button --- */}
      <button
        onClick={onHome}
        className="w-full h-[65px] bg-black rounded-[20px] flex items-center justify-center shadow-[0px_10px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-transform"
      >
        <span className="text-white font-inter font-bold text-[18px]">Tillbaka till Hem</span>
      </button>

    </div>
  );
};

export default BookingConfirmedPage;