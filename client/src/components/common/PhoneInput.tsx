import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, XCircle } from 'lucide-react';

interface Country {
    code: string;
    flag: string;
    name: string;
    dial: string;
    pattern: RegExp; // For local part after dial code
}

const COUNTRIES: Country[] = [
    { code: 'SE', flag: '🇸🇪', name: 'Sverige', dial: '+46', pattern: /^[0-9]{7,9}$/ },
    { code: 'NO', flag: '🇳🇴', name: 'Norge', dial: '+47', pattern: /^[0-9]{8}$/ },
    { code: 'DK', flag: '🇩🇰', name: 'Danmark', dial: '+45', pattern: /^[0-9]{8}$/ },
    { code: 'FI', flag: '🇫🇮', name: 'Finland', dial: '+358', pattern: /^[0-9]{7,10}$/ },
    { code: 'GB', flag: '🇬🇧', name: 'UK', dial: '+44', pattern: /^[0-9]{10}$/ },
    { code: 'US', flag: '🇺🇸', name: 'USA', dial: '+1', pattern: /^[0-9]{10}$/ },
    { code: 'DE', flag: '🇩🇪', name: 'Tyskland', dial: '+49', pattern: /^[0-9]{7,12}$/ },
    { code: 'FR', flag: '🇫🇷', name: 'Frankrike', dial: '+33', pattern: /^[0-9]{9}$/ },
    { code: 'ES', flag: '🇪🇸', name: 'Spanien', dial: '+34', pattern: /^[0-9]{9}$/ },
    { code: 'PL', flag: '🇵🇱', name: 'Polen', dial: '+48', pattern: /^[0-9]{9}$/ },
    { code: 'TR', flag: '🇹🇷', name: 'Turkiet', dial: '+90', pattern: /^[0-9]{10}$/ },
    { code: 'SO', flag: '🇸🇴', name: 'Somalia', dial: '+252', pattern: /^[0-9]{7,9}$/ },
    { code: 'ER', flag: '🇪🇷', name: 'Eritrea', dial: '+291', pattern: /^[0-9]{7}$/ },
    { code: 'ET', flag: '🇪🇹', name: 'Etiopien', dial: '+251', pattern: /^[0-9]{9}$/ },
    { code: 'SY', flag: '🇸🇾', name: 'Syrien', dial: '+963', pattern: /^[0-9]{9}$/ },
    { code: 'IQ', flag: '🇮🇶', name: 'Irak', dial: '+964', pattern: /^[0-9]{10}$/ },
    { code: 'IR', flag: '🇮🇷', name: 'Iran', dial: '+98', pattern: /^[0-9]{10}$/ },
];

interface PhoneInputProps {
    value: string; // E.164 format: +46701234567
    onChange: (e164: string, isValid: boolean) => void;
    placeholder?: string;
    hasError?: boolean;
    className?: string;
}

// Normalize local number: strip spaces, dashes, leading 0
const normalize = (raw: string) => raw.replace(/[\s\-().]/g, '').replace(/^0/, '');

const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChange,
    placeholder = 'Telefonnummer',
    hasError = false,
    className,
}) => {
    // Parse initial value
    const detectCountry = (v: string): Country => {
        const match = COUNTRIES.find(c => v.startsWith(c.dial));
        return match ?? COUNTRIES[0]; // Default SE
    };

    const [country, setCountry] = useState<Country>(() => {
        return value ? detectCountry(value) : COUNTRIES[0];
    });
    const [local, setLocal] = useState(() => {
        if (value && value.startsWith(country.dial)) {
            return value.slice(country.dial.length);
        }
        return '';
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [touched, setTouched] = useState(false);

    const normalized = normalize(local);
    const isValid = normalized.length > 0 && country.pattern.test(normalized);
    const e164 = isValid ? `${country.dial}${normalized}` : '';

    useEffect(() => {
        onChange(e164, isValid);
    }, [e164, isValid]);

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocal(e.target.value);
        setTouched(true);
    };

    const handleCountrySelect = (c: Country) => {
        setCountry(c);
        setShowDropdown(false);
        setLocal('');
    };

    const borderClass = hasError
        ? 'border-red-400'
        : touched && local
            ? isValid ? 'border-green-400' : 'border-orange-400'
            : 'border-gray-200';

    return (
        <div className={`relative w-full ${className ?? ''}`}>
            <div className={`flex items-center border rounded-xl bg-[#FCFCFC] transition-colors focus-within:border-black ${borderClass}`}>
                {/* Country selector */}
                <button
                    type="button"
                    onClick={() => setShowDropdown(d => !d)}
                    className="flex items-center gap-1 pl-3 pr-2 py-3 shrink-0 border-r border-gray-100 hover:bg-gray-50 rounded-l-xl transition-colors"
                >
                    <span className="text-[18px]">{country.flag}</span>
                    <span className="font-inter text-[13px] text-gray-500">{country.dial}</span>
                    <span className="text-gray-300 text-[10px]">▼</span>
                </button>

                <Phone size={14} className="ml-3 text-gray-400 shrink-0" />

                <input
                    type="tel"
                    value={local}
                    onChange={handleLocalChange}
                    onBlur={() => setTouched(true)}
                    placeholder={placeholder}
                    className="flex-1 h-[48px] bg-transparent outline-none font-inter text-[15px] text-black/80 placeholder:text-black/30 px-3"
                />

                {touched && local && (
                    isValid
                        ? <CheckCircle size={16} className="text-green-500 mr-3 shrink-0" />
                        : <XCircle size={16} className="text-orange-400 mr-3 shrink-0" />
                )}
            </div>

            {/* Validation hint */}
            {touched && local && !isValid && (
                <p className="text-[11px] text-orange-500 mt-1 ml-1 font-inter">
                    Ogiltigt nummer för {country.name}
                </p>
            )}
            {touched && local && isValid && (
                <p className="text-[11px] text-green-500 mt-1 ml-1 font-inter">
                    {e164}
                </p>
            )}

            {/* Country dropdown */}
            {showDropdown && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    {COUNTRIES.map(c => (
                        <li key={c.code}>
                            <button
                                type="button"
                                onMouseDown={() => handleCountrySelect(c)}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                            >
                                <span className="text-[18px]">{c.flag}</span>
                                <span className="font-inter text-[14px] text-black flex-1">{c.name}</span>
                                <span className="font-inter text-[13px] text-gray-400">{c.dial}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PhoneInput;
