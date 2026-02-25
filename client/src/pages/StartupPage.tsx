import React from 'react';
import { ArrowRight } from 'lucide-react';

interface StartupPageProps {
  onFinish: () => void;
  onRegister: () => void;
}

const StartupPage: React.FC<StartupPageProps> = ({ onFinish, onRegister }) => {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col lg:flex-row overflow-x-hidden">

      {/* --- Left Section (Images) --- */}
      {/* Mobile: Top section, min-height to fit images. Desktop: Left half, full height. */}
      {/* Used min-h-[500px] on mobile to ensure images aren't cut off if screen is short */}
      <div className="relative w-full min-h-[500px] lg:h-screen lg:w-1/2 bg-[#F8F8F8] flex items-center justify-center overflow-hidden">

        {/* Container for images - Scaled for responsiveness */}
        {/* We use a fixed size container reference and scale it to fit the parent visually */}
        <div className="relative w-[340px] h-[450px] md:w-[430px] md:h-[550px] transform scale-[0.85] sm:scale-100 lg:scale-[0.9] xl:scale-100 transition-transform duration-500 mt-10 lg:mt-0">

          {/* --- Image 1 (Left) - Crew Cut --- */}
          <div className="absolute w-[210px] h-[420px] left-[-20px] lg:left-[-40px] top-[40px] rotate-[-6deg] origin-bottom-right bg-[#F8F8F8] rounded-[32px] overflow-hidden border border-[#E5E5E5] z-0 shadow-lg transition-all duration-500 hover:rotate-[-8deg] hover:z-20 hover:scale-105">
            <img
              src="https://placehold.co/400x800"
              alt="Crew Cut"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
            <div className="absolute left-0 right-0 bottom-[40px] px-4 flex justify-center">
              <div className="px-5 py-3 bg-white/20 backdrop-blur-md rounded-[30px] shadow-sm border border-white/20">
                <span className="text-white font-inter font-medium text-[14px] drop-shadow-sm whitespace-nowrap">Crew Cut</span>
              </div>
            </div>
          </div>

          {/* --- Image 3 (Right) - Buzz Cut --- */}
          <div className="absolute w-[210px] h-[420px] right-[-20px] lg:right-[-40px] top-[40px] rotate-[6deg] origin-bottom-left bg-[#F8F8F8] rounded-[32px] overflow-hidden border border-[#E5E5E5] z-0 shadow-lg transition-all duration-500 hover:rotate-[8deg] hover:z-20 hover:scale-105">
            <img
              src="https://placehold.co/400x800"
              alt="Buzz Cut"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
            <div className="absolute left-0 right-0 bottom-[40px] px-4 flex justify-center">
              <div className="px-5 py-3 bg-white/20 backdrop-blur-md rounded-[30px] shadow-sm border border-white/20">
                <span className="text-white font-inter font-medium text-[14px] drop-shadow-sm whitespace-nowrap">Buzz Cut</span>
              </div>
            </div>
          </div>

          {/* --- Image 2 (Center/Main) - Classic --- */}
          <div className="absolute w-[210px] h-[420px] left-1/2 top-[0px] -translate-x-1/2 bg-[#F8F8F8] rounded-[32px] overflow-hidden border border-[#E5E5E5] z-10 shadow-2xl transition-transform duration-500 hover:scale-[1.03]">
            <img
              src="https://placehold.co/400x800"
              alt="Classic Haircut"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full h-[120px] bg-gradient-to-t from-black/90 to-transparent" />
            <div className="absolute left-0 right-0 bottom-[40px] px-4 flex justify-center">
              <div className="w-full py-[15px] bg-white/20 backdrop-blur-md rounded-[30px] shadow-lg flex items-center justify-center border border-white/20">
                <span className="text-white font-inter font-medium text-[16px] drop-shadow-md whitespace-nowrap">Classic Haircut</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Section (Content) --- */}
      {/* Mobile: Bottom section, rounded top overlap. Desktop: Right half. */}
      {/* Negative margin on mobile to pull it up slightly over the gray bg if desired, or just stack. Stacking is cleaner here. */}
      <div className="relative w-full flex-1 flex flex-col justify-center px-8 py-12 lg:px-24 bg-white z-20 lg:h-screen lg:py-0 rounded-t-[40px] lg:rounded-none -mt-10 lg:mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:shadow-none">
        <div className="max-w-[500px] mx-auto lg:mx-0 w-full flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* Progress Bars */}
          <div className="flex gap-2 mb-8 self-center lg:self-start">
            <div className="w-[54px] h-[5px] bg-black rounded-full" />
            <div className="w-[27px] h-[5px] bg-[#E6EDFA] rounded-full" />
            <div className="w-[27px] h-[5px] bg-[#E6EDFA] rounded-full" />
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-6 mb-10">
            <h1 className="font-inter font-bold text-[34px] md:text-[42px] lg:text-[48px] leading-[1.1] text-[#222222] tracking-tight">
              Booka dina <br />
              Barber <span className="text-black">Appointments</span> <br />
              Effortlessly
            </h1>
            <p className="font-inter font-medium text-[16px] md:text-[18px] text-[#222222]/65 leading-relaxed max-w-[320px] lg:max-w-[400px]">
              Hitta erfarna Barbers i din Närhet runt hela Sverige!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 lg:gap-6 w-full justify-center lg:justify-start">
            {/* Register Button */}
            <button
              onClick={onRegister}
              className="flex-1 max-w-[280px] h-[60px] bg-black rounded-[20px] flex items-center justify-center active:scale-95 transition-all hover:bg-[#1a1a1a] shadow-xl hover:shadow-2xl"
            >
              <span className="text-white font-inter font-medium text-[16px] tracking-wide">Börja Registrera dig</span>
            </button>

            {/* Skip Button */}
            <button
              onClick={onFinish}
              className="group w-[60px] h-[60px] bg-[#F6F6F6] rounded-[20px] border border-[#E6E6E6] flex items-center justify-center active:scale-95 transition-all hover:bg-white hover:shadow-lg"
              aria-label="Skip"
            >
              <ArrowRight size={26} className="text-black transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StartupPage;