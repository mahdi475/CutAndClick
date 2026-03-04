import React, { useState } from 'react';
import { User, Scissors, ChevronRight, ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth, AuthUser } from '../context/AuthContext';

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

    // Barber-specifika fält
    const [salonName, setSalonName] = useState('');
    const [salonAddress, setSalonAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

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
                const userData: Omit<AuthUser, 'token'> = {
                    id: data.session.user?.id || '',
                    username,
                    role: (data.role as 'customer' | 'barber') || role,
                    location: role === 'customer' ? location : city,
                    // Barber-specifika fält (platta på user-objektet)
                    ...(role === 'barber' && {
                        salon_name: salonName,
                        salon_address: salonAddress,
                        city,
                        phone: phone || undefined,
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
                        <button
                            onClick={() => { setRole('customer'); setStep(2); }}
                            className="w-full flex items-center gap-5 px-6 py-5 rounded-[18px] border-2 border-black/10 hover:border-black hover:shadow-md transition-all active:scale-[0.98] bg-white group"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-all flex items-center justify-center shrink-0">
                                <User size={22} className="text-black group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-left">
                                <p className="font-inter font-semibold text-[16px] text-black">Jag är Kund</p>
                                <p className="font-inter text-sm text-black/40">Boka tid hos dina favoritbarberer</p>
                            </div>
                            <ChevronRight size={18} className="text-black/30 ml-auto group-hover:text-black transition-colors" />
                        </button>

                        {/* Barber-kort */}
                        <button
                            onClick={() => { setRole('barber'); setStep(2); }}
                            className="w-full flex items-center gap-5 px-6 py-5 rounded-[18px] border-2 border-black/10 hover:border-black hover:shadow-md transition-all active:scale-[0.98] bg-white group"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-all flex items-center justify-center shrink-0">
                                <Scissors size={22} className="text-black group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-left">
                                <p className="font-inter font-semibold text-[16px] text-black">Jag är Barber</p>
                                <p className="font-inter text-sm text-black/40">Registrera din salong och hantera bokningar</p>
                            </div>
                            <ChevronRight size={18} className="text-black/30 ml-auto group-hover:text-black transition-colors" />
                        </button>
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
                            <div>
                                <input
                                    type="text"
                                    placeholder="Gatuadress"
                                    value={salonAddress}
                                    onChange={(e) => setSalonAddress(e.target.value)}
                                    className={inputClass('salonAddress')}
                                />
                                {errors.salonAddress && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.salonAddress}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Stad"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className={inputClass('city')}
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1 ml-1 font-inter">{errors.city}</p>}
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Telefonnummer (valfritt)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={inputClass('phone')}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Submit-knapp */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-[54px] bg-[#363636]/90 hover:bg-black rounded-[15px] flex items-center justify-center gap-3 transition-colors active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-not-allowed mb-6"
                >
                    {loading ? (
                        <Loader2 size={20} className="text-white animate-spin" />
                    ) : (
                        <span className="text-white font-inter font-bold text-[16px]">
                            {role === 'customer' ? 'Skapa konto' : 'Registrera din salong'}
                        </span>
                    )}
                </button>

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
