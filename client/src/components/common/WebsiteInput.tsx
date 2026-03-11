import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle, XCircle } from 'lucide-react';

interface WebsiteInputProps {
    value: string;
    onChange: (url: string, isValid: boolean) => void;
    placeholder?: string;
    hasError?: boolean;
    className?: string;
}

const isValidUrl = (url: string): boolean => {
    try {
        const u = new URL(url);
        return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.');
    } catch {
        return false;
    }
};

const normalize = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    // Already has protocol
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    // Has www. but no protocol
    if (trimmed.startsWith('www.')) return `https://${trimmed}`;
    // Plain domain
    if (trimmed.includes('.')) return `https://${trimmed}`;
    return trimmed;
};

const WebsiteInput: React.FC<WebsiteInputProps> = ({
    value,
    onChange,
    placeholder = 'Din hemsida (t.ex. www.min-salong.se)',
    hasError = false,
    className,
}) => {
    const [raw, setRaw] = useState(value || '');
    const [touched, setTouched] = useState(!!value);

    const normalized = normalize(raw);
    const isEmpty = raw.trim() === '';
    const isValid = isEmpty || isValidUrl(normalized);

    useEffect(() => {
        onChange(normalized, isEmpty || isValid);
    }, [normalized]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRaw(e.target.value);
        setTouched(true);
    };

    const handleBlur = () => {
        if (raw && !raw.startsWith('http')) {
            const norm = normalize(raw);
            if (norm !== raw) setRaw(norm);
        }
        setTouched(true);
    };

    const borderClass = hasError
        ? 'border-red-400'
        : touched && raw
            ? isValid ? 'border-green-400' : 'border-orange-400'
            : 'border-gray-200';

    return (
        <div className={`relative w-full ${className ?? ''}`}>
            <div className={`flex items-center border rounded-xl bg-[#FCFCFC] px-4 transition-colors focus-within:border-black ${borderClass}`}>
                <Globe size={16} className={`shrink-0 mr-2 ${touched && raw && isValid ? 'text-green-500' : 'text-gray-400'}`} />
                <input
                    type="url"
                    value={raw}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="flex-1 h-[48px] bg-transparent outline-none font-inter text-[15px] text-black/80 placeholder:text-black/30"
                />
                {touched && raw && (
                    isValid
                        ? <CheckCircle size={16} className="text-green-500 shrink-0" />
                        : <XCircle size={16} className="text-orange-400 shrink-0" />
                )}
            </div>
            {touched && raw && !isValid && (
                <p className="text-[11px] text-orange-500 mt-1 ml-1 font-inter">
                    Ogiltig URL — skriv t.ex. "www.min-salong.se"
                </p>
            )}
            {touched && raw && isValid && normalized !== raw && (
                <p className="text-[11px] text-green-500 mt-1 ml-1 font-inter">
                    Sparas som: {normalized}
                </p>
            )}
        </div>
    );
};

export default WebsiteInput;
