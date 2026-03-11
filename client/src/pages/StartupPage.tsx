import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import BarberImage1 from '../assets/BarberImage1.png';
import BarberImage2 from '../assets/BarberImage2.png';
import BarberImage3 from '../assets/BarberImage3.png';

interface StartupPageProps {
  onFinish: () => void;
  onRegister: () => void;
}

const ImageGroup = () => (
  <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="relative w-[430px] h-[550px] shrink-0">
    {/* --- Image 1 (Left) - Crew Cut --- */}
    <motion.div variants={{ hidden: { opacity: 0, y: 40, x: -15, rotate: -6 }, visible: { opacity: 1, y: 0, x: 0, rotate: -3, transition: { type: 'spring', stiffness: 220, damping: 22 } } }} style={{ left: -132, top: 124 }} className="absolute w-[210px] h-[420px] origin-top-left bg-[#F8F8F8] rounded-[32px] overflow-hidden border border-[#E5E5E5] shadow-lg">
      <img src={BarberImage1} alt="Crew Cut" className="w-full h-full object-cover" />
      <div className="absolute bottom-0 w-full h-[105px] bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute left-[38px] bottom-[26px] px-[36px] py-[15px] bg-white/15 backdrop-blur-md shadow-md rounded-[37px] flex items-center justify-center border border-white/20">
        <span className="text-white font-inter font-medium text-[16px] whitespace-nowrap drop-shadow-md">Crew Cut</span>
      </div>
    </motion.div>

    {/* --- Image 3 (Right) - Buzz Cut --- */}
    <motion.div variants={{ hidden: { opacity: 0, y: 40, x: 15, rotate: 6 }, visible: { opacity: 1, y: 0, x: 0, rotate: 3, transition: { type: 'spring', stiffness: 220, damping: 22 } } }} style={{ left: 361, top: 113 }} className="absolute w-[210px] h-[420px] origin-top-left bg-[#F8F8F8] rounded-[32px] overflow-hidden border border-[#E5E5E5] shadow-lg">
      <img src={BarberImage3} alt="Buzz Cut" className="w-full h-full object-cover" />
      <div className="absolute bottom-0 w-full h-[105px] bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute left-[20px] bottom-[26px] px-[36px] py-[15px] bg-white/15 backdrop-blur-md shadow-md rounded-[37px] flex items-center justify-center border border-white/20">
        <span className="text-white font-inter font-medium text-[16px] whitespace-nowrap drop-shadow-md">Buzz Cut</span>
      </div>
    </motion.div>

    {/* --- Image 2 (Center) - Classic Haircut --- */}
    <motion.div variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 22 } } }} style={{ left: 115, top: 108 }} className="absolute w-[210px] h-[420px] bg-[#F8F8F8] rounded-[32px] overflow-hidden border border-[#E5E5E5] z-10 shadow-xl">
      <img src={BarberImage2} alt="Classic Haircut" className="w-full h-full object-cover" />
      <div className="absolute bottom-0 w-full h-[94px] bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute left-[20px] bottom-[26px] px-[27px] py-[15px] bg-white/15 backdrop-blur-md shadow-md rounded-[37px] flex items-center justify-center border border-white/20">
        <span className="text-white font-inter font-medium text-[16px] whitespace-nowrap drop-shadow-md">Classic Haircut</span>
      </div>
    </motion.div>
  </motion.div>
);

const ContentGroup = ({ onRegister, onFinish }: any) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
  <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } } }} className="flex flex-col gap-10 z-20 w-full max-w-[430px] lg:max-w-[500px]">
    {/* Progress Bars */}
    <motion.div variants={itemVariants} className="flex gap-2">
      <div className="w-[54px] h-[5px] bg-black rounded-[2.5px]" />
      <div className="w-[27px] h-[5px] bg-[#E6EDFA] rounded-[2.5px]" />
      <div className="w-[27px] h-[5px] bg-[#E6EDFA] rounded-[2.5px]" />
    </motion.div>

    {/* Text Area */}
    <motion.div variants={itemVariants} className="flex flex-col gap-[18px]">
      <h1 className="font-inter font-bold text-[34px] lg:text-[48px] leading-tight m-0 p-0 text-[#222222]">
        Booka dina <br />
        Barber <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8A8A8E] to-[#C7C7CC]">Appointments</span> <br />
        Effortlessly
      </h1>
      <p className="font-inter font-medium text-[18px] text-[#222222]/65 leading-snug lg:max-w-[400px]">
        Hitta erfarna Barbers i din Närhet runt hela Sverige!
      </p>
    </motion.div>

    {/* Buttons */}
    <motion.div variants={itemVariants} className="flex items-center gap-[35px] lg:gap-6">
      {/* Register */}
      <motion.button
        whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={onRegister}
        className="flex-[2] lg:flex-none lg:w-[280px] h-[55px] lg:h-[60px] bg-black rounded-[20px] flex items-center justify-center hover:bg-[#1a1a1a] shadow-xl hover:shadow-2xl"
      >
        <span className="text-white font-inter font-medium text-[16px] tracking-wide">Börja Registrera dig</span>
      </motion.button>

      {/* Skip */}
      <motion.button
        whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={onFinish}
        className="w-[55px] h-[55px] lg:w-[60px] lg:h-[60px] bg-[#F6F6F6] border border-[#E6E6E6] rounded-[20px] flex items-center justify-center hover:bg-white hover:shadow-lg group"
        aria-label="Skip"
      >
        <ArrowRight size={24} className="text-black transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  </motion.div>
  );
};

const StartupPage: React.FC<StartupPageProps> = ({ onFinish, onRegister }) => {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col lg:flex-row overflow-x-hidden relative">

      {/* --- MOBILE / TABLET VIEW (< 1024px) --- */}
      {/* Keeps the EXACT Figma mobile dimensions in relative scaling */}
      <div className="flex lg:hidden relative w-full h-[100dvh] bg-white overflow-hidden justify-center items-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col">
          {/* Images bounded to top center to prevent breaking the flow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[430px] h-[500px] pointer-events-none scale-[0.80] sm:scale-[0.9] origin-top mt-4">
            <ImageGroup />
          </div>

          {/* Content pinned to bottom */}
          <div className="absolute bottom-[40px] left-[28px] right-[28px]">
            <ContentGroup onFinish={onFinish} onRegister={onRegister} />
          </div>
        </div>
      </div>

      {/* --- DESKTOP VIEW (>= 1024px) --- */}
      {/* Expands elegantly to a split view that uses the exact design theme */}
      <div className="hidden lg:flex w-full h-screen">
        {/* Left section - Images */}
        <div className="w-1/2 h-full bg-[#F8F8F8] flex items-center justify-center overflow-hidden">
          <div className="transform scale-[0.9] xl:scale-[1.0] transition-transform duration-500">
            <ImageGroup />
          </div>
        </div>

        {/* Right section - Content */}
        <div className="w-1/2 h-full bg-white flex flex-col justify-center px-16 lg:px-24">
          <ContentGroup onFinish={onFinish} onRegister={onRegister} />
        </div>
      </div>

    </div>
  );
};

export default StartupPage;