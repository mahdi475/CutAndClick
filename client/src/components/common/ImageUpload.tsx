import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Camera, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase';

interface ImageUploadProps {
    onUploadSuccess: (url: string) => void;
    folderPath: string; // e.g., auth.uid()
    currentImageUrl?: string;
    initials?: string;
    size?: 'sm' | 'md' | 'lg';
    fixedFileName?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onUploadSuccess,
    folderPath,
    currentImageUrl,
    initials,
    size = 'md',
    fixedFileName
}) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: 'w-[48px] h-[48px] text-[14px]',
        md: 'w-[100px] h-[100px] text-[30px]',
        lg: 'w-[140px] h-[140px] text-[40px]'
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Validering
        if (file.size > 2 * 1024 * 1024) {
            alert('Filen är för stor. Max 2MB tillåtet.');
            return;
        }

        // 2. Förhandsgranskning (lokal)
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        try {
            setUploading(true);

            // BRAINROT DEBUGGING
            const { data: { session } } = await supabase.auth.getSession();
            console.log('--- STORAGE DEBUG ---');
            console.log('Jalla, vi kollar session för:', folderPath);

            if (!session) {
                console.warn('KEFF! Ingen session i Supabase. Logga in igen brush.');
            }

            // 3. Filnamn och sökväg
            const fileExt = file.name.split('.').pop();
            const fileName = fixedFileName || `${Date.now()}.${fileExt}`;
            const filePath = `${folderPath}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: !!fixedFileName // Skriv över om vi har ett fast namn
                });

            if (uploadError) {
                console.error('Aina vaktar storage:', uploadError.message);
                throw uploadError;
            }

            // 4. Hämta publik URL + cache buster (viktigt så webbläsaren fattar att bilden är ny)
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const finalUrl = fixedFileName ? `${publicUrl}?t=${Date.now()}` : publicUrl;
            console.log('Brrrr! Bilden är uppe:', finalUrl);

            onUploadSuccess(finalUrl);
        } catch (error: any) {
            console.error('Error uploading image:', error.message);
            alert('Kunde inte ladda upp bilden. Brush, kolla din koppling.');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const displayUrl = previewUrl || currentImageUrl;

    return (
        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
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
                className={`${sizeClasses[size]} rounded-full overflow-hidden bg-black flex items-center justify-center border-2 border-black relative transition-all`}
            >
                {displayUrl ? (
                    <img
                        src={displayUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-white font-inter font-bold">{initials || <User size={size === 'sm' ? 20 : 40} />}</span>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200">
                    {uploading ? (
                        <Loader2 className="text-white animate-spin" size={24} />
                    ) : (
                        <>
                            <Camera className="text-white mb-1" size={24} />
                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Byt bild</span>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Hint for mobile if not hovered? Maybe not needed for premium clean feel */}
        </div>
    );
};

export default ImageUpload;
