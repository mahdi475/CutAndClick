import React, { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegisterImagePickerProps {
    onImageSelect: (file: File) => void;
    previewUrl: string | null;
}

const RegisterImagePicker: React.FC<RegisterImagePickerProps> = ({ onImageSelect, previewUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('Filen är för stor. Max 2MB tillåtet.');
            return;
        }

        onImageSelect(file);
    };

    return (
        <div className="flex flex-col items-center justify-center mb-6">
            <div 
                className="relative group cursor-pointer w-[120px] h-[120px]" 
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-[120px] h-[120px] rounded-full overflow-hidden bg-[#F6F6F6] flex items-center justify-center border-2 border-dashed border-black/20 group-hover:border-black/40 transition-all relative shadow-sm"
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={40} className="text-black/30" />
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200">
                        <Camera className="text-white mb-1" size={24} />
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Ladda upp</span>
                    </div>
                </motion.div>
                
                {/* Plus button detail */}
                {!previewUrl && (
                    <div className="absolute bottom-0 right-0 w-[40px] h-[40px] bg-black rounded-full flex items-center justify-center border-[3px] border-white shadow-md">
                        <span className="text-white text-xl font-light mb-0.5">+</span>
                    </div>
                )}
            </div>
            {!previewUrl && (
                <p className="mt-3 font-inter text-[13px] text-black/50">Välj profilbild (valfritt)</p>
            )}
        </div>
    );
};

export default RegisterImagePicker;
