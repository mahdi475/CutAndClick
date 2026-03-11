import React, { useState } from 'react';
import { User, Scissors, ChevronRight, ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, AuthUser } from '../context/AuthContext';
import AddressAutocomplete from '../components/common/AddressAutocomplete';
import PhoneInput from '../components/common/PhoneInput';
import WebsiteInput from '../components/common/WebsiteInput';
import RegisterImagePicker from '../components/common/RegisterImagePicker';
import LocationPickerMap from '../components/common/LocationPickerMap';
import { supabase } from '../supabase';

type Role = 'customer' | 'barber';

interface RegisterPageProps {
    onSuccess: (role: 'customer' | 'barber') => void;
    onBack: () => void;
}

interface FieldError {
    [key: string]: string;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onBack }) => {
    const { login } = useAuth();

    const [step, setStep] = useState<1 | 2>(1);
    const [role, setRole] = useState<Role>('customer');

    // Gemensamma fält
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Barber-specifika fält
    const [salonName, setSalonName] = useState('');
    const [salonAddress, setSalonAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [phoneValid, setPhoneValid] = useState(true);
    const [websiteValid, setWebsiteValid] = useState(true);

    const [errors, setErrors] = useState<FieldError>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validate = (): boolean => {
        const newErrors: FieldError = {};

        if (!username.trim()) newErrors.username = 'Namn är obligatoriskt';
        if (!email.trim()) newErrors.email = 'E-post är obligatorisk';
        else if (!email.includes('@')) newErrors.email = 'Ogiltig e-postadress';
        if (!password) newErrors.password = 'Lösenord är obligatoriskt';
        else if (password.length < 6) newErrors.password = 'Lösenordet måste vara minst 6 tecken';

        if (role === 'customer') {
            if (!location.trim()) newErrors.location = 'Stad är obligatorisk';
        } else {
            if (!salonName.trim()) newErrors.salonName = 'Salongens namn är obligatoriskt';
            if (!salonAddress.trim()) newErrors.salonAddress = 'Adress är obligatorisk';
            if (!city.trim()) newErrors.city = 'Stad är obligatorisk';
            if (!phoneValid) newErrors.phone = 'Ogiltigt telefonnummer';
            if (!websiteValid) newErrors.website = 'Ogiltig webbadress';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setServerError('');
        setLoading(true);

        try {
            const body: Record<string, string> = {
                username,
                email,
                password,
                role,
            };

            if (role === 'customer') {
                body.location = location;
            } else {
                body.location = city;
                body.salon_name = salonName;
                body.salon_address = salonAddress;
                body.city = city;
                body.phone = phone;
                if (website) body.website = website;
            }

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setServerError(data.error || 'Registrering misslyckades');
                setLoading(false);
                return;
            }

            // Spara session och user i AuthContext
            if (data.session?.access_token) {
                // Ensure we use the new session to upload profile pic
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });

                let uploadedPicUrl = '';
                if (profilePicFile) {
                    try {
                        const fileExt = profilePicFile.name.split('.').pop();
                        const fileName = `${data.user?.id || Date.now()}/profile.${fileExt}`;
                        const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(fileName, profilePicFile, { upsert: true });
                        
                        if (!uploadError) {
                            const { data: { publicUrl } } = supabase.storage
                                .from('avatars')
                                .getPublicUrl(fileName);
                            uploadedPicUrl = publicUrl;
                            
                            // Update db with the pic URL
                            await supabase.from('users').update({ profile_pic_url: uploadedPicUrl }).eq('id', data.user.id);
                        }
                    } catch (e) {
                         console.error('Kunde inte ladda upp profilbild:', e);
                    }
                }

                const userData: Omit<AuthUser, 'token'> = {
                    id: data.user?.id || '',
                    username,
                    role: (data.role as 'customer' | 'barber') || role,
                    location: role === 'customer' ? location : city,
                    profile_pic_url: uploadedPicUrl,
                    // Barber-specifika fält (platta på user-objektet)
                    ...(role === 'barber' && {
                        salon_name: salonName,
                        salon_address: salonAddress,
                        city,
                        phone: phone || undefined,
                        website: website || undefined,
                    }),
                };
                login(data.session.access_token, userData);
            }

            onSuccess(role);
        } catch (err) {
            setServerError('Kunde inte nå servern. Försök igen.');
            setLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'apple') => {
        setLoading(true);
        setServerError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) {
                setServerError(error.message);
                setLoading(false);
            }
        } catch (err) {
            setServerError('Något gick fel med inloggningen');
            setLoading(false);
        }
    };

    const inputClass = (field: string) =>
        `w-full bg-[#FCFCFC] rounded-[12px] border ${errors[field] ? 'border-red-400' : 'border-black/20'} px-4 py-3 font-inter text-[15px] text-black/80 placeholder:text-black/30 outline-none transition-colors focus:border-black`;

    // ----------------------------------------
    // Step 1: Rollval
    // ----------------------------------------
    if (step === 1) {
        return (
            <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
                {/* Top blob */}
                <div
                    className="absolute w-[441px] h-[431px] left-[-100px] md:left-0 -top-[134px] rotate-[21deg] origin-top-left rounded-[9999px] pointer-events-none z-0"
                    style={{ background: 'linear-gradient(180deg, black 0%, #606060 4%, #797979 21%, #CDCDCD 48%, #FCFCFC 75%, #FCFCFC 91%)' }}
                />

                <div className="relative z-10 w-full max-w-[380px]">
                    {/* Back button */}
                    <button onClick={onBack} className="flex items-center gap-1 text-black/50 hover:text-black mb-8 transition-colors">
                        <ChevronLeft size={18} />
                        <span className="font-inter text-sm">Tillbaka</span>
                    </button>

                    <h1 className="font-inter font-bold text-[28px] text-black mb-2">Skapa konto</h1>
                    <p className="text-black/50 font-inter text-sm mb-10">Vad beskriver dig bäst?</p>

                    <div className="flex flex-col gap-4">
                        {/* Kund-kort */}
                        <motion.button
                            whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => { setRole('customer'); setStep(2); }}
                            className="w-full flex items-center gap-5 px-6 py-5 rounded-[18px] border-2 border-black/10 hover:border-black hover:shadow-md transition-shadow bg-white group text-left"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-all flex items-center justify-center shrink-0">
                                <User size={22} className="text-black group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-left">
                                <p className="font-inter font-semibold text-[16px] text-black">Jag är Kund</p>
                                <p className="font-inter text-sm text-black/40">Boka tid hos dina favoritbarberer</p>
                            </div>
                            <ChevronRight size={18} className="text-black/30 ml-auto group-hover:text-black transition-colors" />
                        </motion.button>

                        {/* Barber-kort */}
                        <motion.button
                            whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => { setRole('barber'); setStep(2); }}
                            className="w-full flex items-center gap-5 px-6 py-5 rounded-[18px] border-2 border-black/10 hover:border-black hover:shadow-md transition-shadow bg-white group text-left"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-all flex items-center justify-center shrink-0">
                                <Scissors size={22} className="text-black group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-left">
                                <p className="font-inter font-semibold text-[16px] text-black">Jag är Barber</p>
                                <p className="font-inter text-sm text-black/40">Registrera din salong och hantera bokningar</p>
                            </div>
                            <ChevronRight size={18} className="text-black/30 ml-auto group-hover:text-black transition-colors" />
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------
    // Step 2: Formulär
    // ----------------------------------------
    return (
        <div className="w-full min-h-screen bg-white flex flex-col items-center py-12 px-6 relative overflow-hidden">
            {/* Top blob */}
            <div
                className="absolute w-[441px] h-[431px] left-[-100px] md:left-0 -top-[134px] rotate-[21deg] origin-top-left rounded-[9999px] pointer-events-none z-0"
                style={{ background: 'linear-gradient(180deg, black 0%, #606060 4%, #797979 21%, #CDCDCD 48%, #FCFCFC 75%, #FCFCFC 91%)' }}
            />

            <div className="relative z-10 w-full max-w-[380px]">
                {/* Back */}
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-black/50 hover:text-black mb-6 transition-colors mt-2">
                    <ChevronLeft size={18} />
                    <span className="font-inter text-sm">Byt roll</span>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                        {role === 'customer'
                            ? <User size={18} className="text-white" />
                            : <Scissors size={18} className="text-white" />
                        }
                    </div>
                    <div>
                        <h1 className="font-inter font-bold text-[22px] text-black leading-tight">
                            {role === 'customer' ? 'Skapa konto' : 'Registrera din salong'}
                        </h1>
                        <p className="text-black/40 font-inter text-xs">
                            {role === 'customer' ? 'Som kund' : 'Som barber'}
                        </p>
                    </div>
                </div>

                {/* Server error */}
                {serverError && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-inter">
                        {serverError}
                    </div>
                )}

                {/* Form */}
                <div className="flex flex-col gap-4 mb-6">
                    {/* Profilbild */}
                    <RegisterImagePicker 
                        onImageSelect={(file) => {
                            setProfilePicFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                        }} 
                        previewUrl={previewUrl}
                    />

                    {/* Namn */}
                    <div>
                        <input
                            type="text"
                            placeholder="Ditt namn"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={inputClass('username')}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.username}</p>}
                    </div>

                    {/* E-post */}
                    <div>
                        <input
                            type="email"
                            placeholder="E-post"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass('email')}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.email}</p>}
                    </div>

                    {/* Lösenord */}
                    <div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Lösenord (min 6 tecken)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass('password')} pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.password}</p>}
                    </div>

                    {/* Kund: Stad */}
                    {role === 'customer' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Din stad"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={inputClass('location')}
                            />
                            {errors.location && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.location}</p>}
                        </div>
                    )}

                    {/* Barber-specifika fält */}
                    {role === 'barber' && (
                        <>
                            {/* Salongens namn */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Salongens namn"
                                    value={salonName}
                                    onChange={(e) => setSalonName(e.target.value)}
                                    className={inputClass('salonName')}
                                />
                                {errors.salonName && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.salonName}</p>}
                            </div>

                            {/* Adress autocomplete — fullständig adress i ett fält */}
                            <div>
                                <AddressAutocomplete
                                    value={salonAddress}
                                    placeholder="Sök adress (t.ex. Drottninggatan 1, Stockholm)"
                                    hasError={!!errors.salonAddress}
                                    onSelect={({ fullAddress, city: c, postalCode: pc, validated }) => {
                                        setSalonAddress(fullAddress);
                                        setCity(c);
                                        setPostalCode(pc);
                                    }}
                                    onChange={val => setSalonAddress(val)}
                                />
                                {errors.salonAddress && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.salonAddress}</p>}
                            </div>

                            {/* Telefon */}
                            <div>
                                <PhoneInput
                                    value={phone}
                                    onChange={(e164, valid) => {
                                        setPhone(e164);
                                        setPhoneValid(valid);
                                    }}
                                    placeholder="Telefonnummer (valfritt)"
                                    hasError={!!errors.phone}
                                />
                            </div>

                            {/* Hemsida */}
                            <div>
                                <WebsiteInput
                                    value={website}
                                    onChange={(url, valid) => {
                                        setWebsite(url);
                                        setWebsiteValid(valid);
                                    }}
                                    placeholder="Hemsida (valfritt)"
                                    hasError={!!errors.website}
                                />
                            </div>

                            {/* Map Picker Barber */}
                            <LocationPickerMap 
                                initialAddress={salonAddress}
                                onAddressSelected={(addr, c) => {
                                    setSalonAddress(addr);
                                    if(c) setCity(c);
                                }}
                            />
                        </>
                    )}

                    {/* Kund Map Picker (optional, men om location krävs kan vi visa den) */}
                    {role === 'customer' && location && location.length > 2 && (
                         <LocationPickerMap 
                            initialAddress={location}
                            onAddressSelected={(_addr, c) => {
                                if(c) setLocation(c);
                            }}
                        />
                    )}
                </div>

                {/* Submit-knapp */}
                <motion.button
                    whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-[54px] bg-[#363636]/90 hover:bg-black rounded-[15px] flex items-center justify-center gap-3 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed mb-6"
                >
                    {loading ? (
                        <Loader2 size={20} className="text-white animate-spin" />
                    ) : (
                        <span className="text-white font-inter font-bold text-[16px]">
                            {role === 'customer' ? 'Skapa konto' : 'Registrera din salong'}
                        </span>
                    )}
                </motion.button>

                {/* Social Login (endast kunder) */}
                {role === 'customer' && (
                    <div className="flex flex-col gap-4 mb-8">
                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1 h-[1px] bg-gray-200" />
                            <span className="text-gray-400 font-inter text-[13px]">Eller fortsätt med</span>
                            <div className="flex-1 h-[1px] bg-gray-200" />
                        </div>

                        {/* Google */}
                        <motion.button
                            whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => handleOAuth('google')}
                            disabled={loading}
                            className="w-full h-[64px] bg-[#EAEAEA] rounded-none flex items-center shadow-sm hover:bg-gray-200 overflow-hidden group disabled:opacity-60"
                        >
                            <div className="w-[64px] h-[64px] bg-white flex items-center justify-center shrink-0 group-hover:bg-opacity-90 transition-colors">
                                <svg viewBox="0 0 24 24" className="w-6 h-6">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335" />
                                </svg>
                            </div>
                            <span className="flex-1 text-center text-black font-poppins font-medium text-[16px]">Sign up with Google</span>
                        </motion.button>

                        {/* Apple */}
                        <motion.button
                            whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => handleOAuth('apple')}
                            disabled={loading}
                            className="w-full h-[64px] bg-black rounded-none flex items-center shadow-sm hover:bg-zinc-800 overflow-hidden group disabled:opacity-60"
                        >
                            <div className="w-[64px] h-[64px] bg-white flex items-center justify-center shrink-0 group-hover:bg-opacity-90 transition-colors">
                                <svg viewBox="0 0 384 512" className="w-6 h-6 fill-black">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                                </svg>
                            </div>
                            <span className="flex-1 text-center text-white font-poppins font-medium text-[16px]">Sign up with Apple</span>
                        </motion.button>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-center text-[14px] font-inter">
                    <span className="text-black/50">Har du redan ett konto? </span>
                    <button onClick={onBack} className="text-black font-bold hover:underline ml-1">Logga in</button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
