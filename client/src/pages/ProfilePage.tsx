import React from 'react';
import { Settings, CreditCard, Bell, User, LogOut, Edit2, ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
    onBack: () => void;
    onSignOut: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onSignOut }) => {
    return (
        <div className="flex flex-col min-h-full bg-white relative pb-24 px-7 pt-10 md:px-10">

            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    onClick={onBack}
                    className="w-[45px] h-[45px] bg-white rounded-[16px] border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="text-[#222222]" size={20} strokeWidth={2.5} />
                </button>
                <h1 className="text-[#333333] font-inter font-bold text-[25px]">Profil</h1>
            </div>

            <div className="md:flex md:gap-12 md:items-start">

                {/* Left Column (Desktop): Profile & Stats */}
                <div className="md:flex-1 md:max-w-md">
                    {/* Profile Info */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <img
                                src="https://placehold.co/200"
                                alt="Profile"
                                className="w-[114px] h-[114px] rounded-full object-cover border-[2px] border-black"
                            />
                            <button className="absolute bottom-0 right-0 w-[38px] h-[38px] bg-black rounded-[8px] flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-gray-800">
                                <Edit2 size={18} className="text-white" />
                            </button>
                        </div>
                        <h2 className="text-black font-roboto font-medium text-[30px] leading-tight text-center">Cristiano Ronaldo</h2>
                        <p className="text-[#A7A7A7] font-roboto font-medium text-[22px] text-center mt-1">Cristiano@gmail.com</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-4 mb-8">
                        {/* Total Bookings */}
                        <div className="flex-1 bg-[#FBFBFB] rounded-[30px] shadow-[0px_9px_27.7px_1px_rgba(0,0,0,0.15)] p-4 flex flex-col items-center justify-center h-[99px]">
                            <span className="text-[#979797] font-roboto font-medium text-[14px] text-center mb-1">Totala Bookningar</span>
                            <span className="text-black font-roboto font-medium text-[32px] leading-none">12</span>
                        </div>
                        {/* Account Points */}
                        <div className="flex-1 bg-[#FBFBFB] rounded-[30px] shadow-[0px_9px_27.7px_1px_rgba(0,0,0,0.15)] p-4 flex flex-col items-center justify-center h-[99px]">
                            <span className="text-[#979797] font-roboto font-medium text-[14px] text-center mb-1">Konto Poäng</span>
                            <span className="text-black font-roboto font-medium text-[32px] leading-none">450</span>
                        </div>
                    </div>
                </div>

                {/* Right Column (Desktop): Settings */}
                <div className="md:flex-1">
                    {/* Settings Section */}
                    <h3 className="text-[#888888] font-inter font-bold text-[17px] mb-4 pl-2">Inställningar</h3>
                    <div className="bg-[#FBFBFB] rounded-[30px] shadow-[0px_9px_27.7px_1px_rgba(0,0,0,0.15)] p-6 flex flex-col gap-6 mb-8">

                        {/* Personal Info */}
                        <div className="flex items-center gap-4 cursor-pointer hover:opacity-70 transition-opacity">
                            <div className="w-[29px] h-[29px] bg-[#503DFF] rounded-[6px] flex items-center justify-center shrink-0">
                                <User size={16} className="text-white" />
                            </div>
                            <span className="text-black font-inter font-bold text-[14px]">Personlig information</span>
                        </div>
                        <div className="h-[1px] bg-[#E1E1E1] w-full" />

                        {/* Payment Methods */}
                        <div className="flex items-center gap-4 cursor-pointer hover:opacity-70 transition-opacity">
                            <div className="w-[29px] h-[29px] bg-[#FF9B9B] rounded-[6px] flex items-center justify-center shrink-0">
                                <CreditCard size={16} className="text-white" />
                            </div>
                            <span className="text-black font-inter font-bold text-[14px]">Payment metoder</span>
                        </div>
                        <div className="h-[1px] bg-[#E1E1E1] w-full" />

                        {/* Notifications */}
                        <div className="flex items-center gap-4 cursor-pointer hover:opacity-70 transition-opacity">
                            <div className="w-[29px] h-[29px] bg-[#FFD793] rounded-[6px] flex items-center justify-center shrink-0">
                                <Bell size={16} className="text-white" />
                            </div>
                            <span className="text-black font-inter font-bold text-[14px]">Notifications hantering</span>
                        </div>
                        <div className="h-[1px] bg-[#E1E1E1] w-full" />

                        {/* Profile Settings */}
                        <div className="flex items-center gap-4 cursor-pointer hover:opacity-70 transition-opacity">
                            <div className="w-[29px] h-[29px] bg-[#D9D9D9] rounded-[6px] flex items-center justify-center shrink-0">
                                <Settings size={16} className="text-black" />
                            </div>
                            <span className="text-black font-inter font-bold text-[14px]">User profil inställningar</span>
                        </div>

                    </div>

                    {/* Sign Out Button */}
                    <button
                        onClick={onSignOut}
                        className="w-full h-[61px] bg-[#FF0000]/10 rounded-[22px] flex items-center justify-center gap-3 active:bg-[#FF0000]/20 transition-colors mb-4 hover:bg-[#FF0000]/15"
                    >
                        <LogOut size={24} className="text-[#FF0000]" />
                        <span className="text-[#FF0000] font-inter font-bold text-[20px]">SIGN OUT</span>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ProfilePage;