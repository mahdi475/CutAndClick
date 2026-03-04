import React from 'react';
import { Check, Calendar, Clock, Scissors } from 'lucide-react';
import { Product, Service, BarberShop } from '../types';

interface BookingConfirmedPageProps {
  onHome: () => void;
  details?: { date: string; time: string } | null;
  item?: Product | Service | null;
  barber?: BarberShop | null;
}

const MONTHS_SV = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december'
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_SV[d.getMonth()]} ${d.getFullYear()}`;
}

const BookingConfirmedPage: React.FC<BookingConfirmedPageProps> = ({
  onHome, details, item, barber
}) => {
  return (
    <div className="flex flex-col min-h-full bg-white relative px-7 pt-16 pb-10">

      {/* Success icon */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="w-[100px] h-[100px] bg-[#00B84A]/10 rounded-full flex items-center justify-center mb-6">
          <div className="w-[60px] h-[60px] bg-[#00B84A] rounded-full flex items-center justify-center shadow-lg shadow-[#00B84A]/30 animate-bounce">
            <Check size={30} className="text-white" strokeWidth={3.5} />
          </div>
        </div>
        <h1 className="text-[#333333] font-inter font-bold text-[28px] text-center leading-tight">
          Bokning<br />Bekräftad!
        </h1>
        <p className="text-[#888888] font-inter font-medium text-[15px] mt-3 text-center max-w-[260px]">
          Din tid är reserverad. Vi har skickat en bekräftelse till din email.
        </p>
      </div>

      {/* Receipt card */}
      <div className="w-full bg-[#FAFAFA] rounded-[28px] p-6 shadow-[0px_6px_24px_rgba(0,0,0,0.06)] mb-8 border border-[#F0F0F0] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50px] h-[3px] bg-[#E5E5E5] rounded-b-full" />

        <div className="flex flex-col gap-5 mt-2">

          {/* Barber info */}
          {barber && (
            <div className="flex items-center gap-4 border-b border-[#F0F0F0] pb-5">
              <div className="w-[50px] h-[50px] rounded-[14px] overflow-hidden bg-gray-200 flex-shrink-0">
                <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-[#333] font-roboto font-bold text-[17px]">{barber.name}</h3>
                <p className="text-[#888] font-roboto text-[13px]">{barber.address}, {barber.city}</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="flex flex-col gap-4">
            {details?.date && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center">
                  <Calendar size={14} className="text-[#333]" />
                </div>
                <div>
                  <span className="block text-[11px] text-[#AAAAAA] font-inter uppercase tracking-wide">Datum</span>
                  <span className="block text-[15px] text-[#333] font-inter font-semibold">{formatDate(details.date)}</span>
                </div>
              </div>
            )}

            {details?.time && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center">
                  <Clock size={14} className="text-[#333]" />
                </div>
                <div>
                  <span className="block text-[11px] text-[#AAAAAA] font-inter uppercase tracking-wide">Tid</span>
                  <span className="block text-[15px] text-[#333] font-inter font-semibold">{details.time}</span>
                </div>
              </div>
            )}

            {item && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center">
                  <Scissors size={14} className="text-[#333]" />
                </div>
                <div>
                  <span className="block text-[11px] text-[#AAAAAA] font-inter uppercase tracking-wide">Tjänst</span>
                  <span className="block text-[15px] text-[#333] font-inter font-semibold">{item.title} — {item.price} kr</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onHome}
        className="w-full h-[62px] bg-black rounded-[18px] flex items-center justify-center shadow-xl active:scale-95 transition-transform hover:bg-gray-800"
      >
        <span className="text-white font-inter font-bold text-[17px]">Tillbaka till Hem</span>
      </button>
    </div>
  );
};

export default BookingConfirmedPage;