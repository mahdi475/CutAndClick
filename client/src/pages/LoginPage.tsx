import React from 'react';
import { Lock, LogIn } from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
    onSignUp?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
    return (
        <div className="w-full min-h-screen relative bg-white overflow-hidden flex flex-col items-center justify-center py-10">

            {/* --- Top Gradient Blob --- */}
            <div
                className="absolute w-[441px] h-[431px] left-[-100px] md:left-0 -top-[134px] rotate-[21deg] origin-top-left rounded-[9999px] pointer-events-none z-0"
                style={{
                    background: 'linear-gradient(180deg, black 0%, #606060 4%, #797979 21%, #CDCDCD 48%, #FCFCFC 75%, #FCFCFC 91%)'
                }}
            />

            {/* --- Main Content Container --- */}
            <div className="relative z-10 w-full max-w-[380px] px-6 flex flex-col">

                {/* --- Title --- */}
                <div className="mb-8">
                    <h1 className="text-black/90 font-inter font-bold text-[32px]">Login</h1>
                    <p className="text-gray-500 mt-2">Welcome back to Cut & Click</p>
                </div>

                {/* --- Form Inputs --- */}
                <div className="flex flex-col gap-5 mb-8">
                    {/* Email */}
                    <div className="w-full h-[65px] bg-[#FCFCFC] rounded-[15px] border border-black/50 flex items-center px-6 transition-colors focus-within:border-black">
                        <div className="w-[24px] flex justify-center mr-3">
                            {/* Placeholder for user icon */}
                            <div className="w-5 h-5 rounded-full border border-black/30 bg-gray-100"></div>
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full bg-transparent outline-none text-black/70 font-inter font-light text-[15px] placeholder:text-black/40"
                        />
                    </div>

                    {/* Password */}
                    <div className="w-full h-[65px] bg-[#FCFCFC] rounded-[15px] border border-black/50 flex items-center px-6 transition-colors focus-within:border-black">
                        <div className="w-[24px] flex justify-center mr-3">
                            <Lock size={18} className="text-black/50" />
                        </div>
                        <input
                            type="password"
                            placeholder="password"
                            className="w-full bg-transparent outline-none text-black/70 font-inter font-light text-[15px] placeholder:text-black/40"
                        />
                    </div>
                </div>

                {/* --- Login Button --- */}
                <div className="flex justify-end mb-12">
                    <button
                        onClick={onLogin}
                        className="w-[120px] h-[54px] bg-[#363636]/90 rounded-[15px] flex items-center justify-between px-5 hover:bg-black transition-colors active:scale-95 shadow-md"
                    >
                        <span className="text-white font-inter font-bold text-[18px]">login</span>
                        <div>
                            <LogIn size={18} className="text-white" />
                        </div>
                    </button>
                </div>

                {/* --- Social Login Buttons --- */}
                <div className="flex flex-col gap-4 mb-8">
                    {/* Google */}
                    <button className="w-full h-[64px] bg-[#EAEAEA] rounded-none flex items-center shadow-sm active:scale-[0.98] transition-all hover:bg-gray-200 overflow-hidden group">
                        {/* Icon Box */}
                        <div className="w-[64px] h-[64px] bg-white flex items-center justify-center shrink-0 group-hover:bg-opacity-90 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335" />
                            </svg>
                        </div>
                        <span className="flex-1 text-center text-black font-poppins font-medium text-[16px]">Login with Google</span>
                    </button>

                    {/* Apple */}
                    <button className="w-full h-[64px] bg-black rounded-none flex items-center shadow-sm active:scale-[0.98] transition-all hover:bg-zinc-800 overflow-hidden group">
                        {/* Icon Box */}
                        <div className="w-[64px] h-[64px] bg-white flex items-center justify-center shrink-0 group-hover:bg-opacity-90 transition-colors">
                            <svg viewBox="0 0 384 512" className="w-6 h-6 fill-black">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                            </svg>
                        </div>
                        <span className="flex-1 text-center text-white font-poppins font-medium text-[16px]">Login with Apple</span>
                    </button>
                </div>

                {/* --- Footer Link --- */}
                <div className="flex justify-center text-[14px] font-poppins">
                    <span className="text-black font-normal">Don't have an account? </span>
                    <span className="w-1"> </span>
                    <button onClick={onSignUp} className="text-black font-bold hover:underline">Sign Up</button>
                </div>

            </div>

        </div>
    );
};

export default LoginPage;