import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Step 1: Nominatim autocomplete (OpenStreetMap) — free, no key, works well for Sweden
// Step 2: After selection, validate address via Nominatim structured search
//         to confirm the exact house number exists before saving.

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const UA = 'CutAndClick/1.0 (barbershop booking app)';

interface NominatimResult {
    place_id: number;
    display_name: string;
    address: {
        road?: string;
        house_number?: string;
        postcode?: string;
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        country?: string;
    };
}

export interface AddressResult {
    fullAddress: string;   // "Drottninggatan 1, 111 51 Stockholm"
    address: string;       // "Drottninggatan 1"
    city: string;          // "Stockholm"
    postalCode: string;    // "111 51"
    validated: boolean;    // true = house number confirmed by validation step
}

interface AddressAutocompleteProps {
    value: string;
    onSelect: (result: AddressResult) => void;
    onChange?: (val: string) => void;
    placeholder?: string;
    className?: string;
    hasError?: boolean;
}

const extractCity = (a: NominatimResult['address']): string =>
    a.city || a.town || a.village || a.municipality || a.county || '';

const buildLabel = (r: NominatimResult): { primary: string; secondary: string } => {
    const a = r.address;
    const street = [a.road, a.house_number].filter(Boolean).join(' ');
    const city = extractCity(a);
    const postcode = a.postcode || '';
    return {
        primary: street || r.display_name.split(',')[0],
        secondary: [postcode, city].filter(Boolean).join(' '),
    };
};

const buildFullAddress = (r: NominatimResult): AddressResult => {
    const a = r.address;
    const street = [a.road, a.house_number].filter(Boolean).join(' ');
    const city = extractCity(a);
    const postalCode = a.postcode || '';
    const parts = [street, postalCode && city ? `${postalCode} ${city}` : city]
        .filter(Boolean);
    return {
        fullAddress: parts.join(', '),
        address: street,
        city,
        postalCode,
        validated: false,
    };
};

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onSelect,
    onChange,
    placeholder = 'Sök adress…',
    className,
    hasError = false,
}) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validated, setValidated] = useState<boolean | null>(value ? true : null);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, []);

    // ----------------------------------------------------------------
    // Step 1 — Autocomplete search
    // ----------------------------------------------------------------
    const search = useCallback(async (q: string) => {
        if (q.length < 3) { setSuggestions([]); setLoading(false); return; }
        setLoading(true);
        try {
            const url = new URL(`${NOMINATIM_BASE}/search`);
            url.searchParams.set('q', q);
            url.searchParams.set('format', 'json');
            url.searchParams.set('addressdetails', '1');
            url.searchParams.set('countrycodes', 'se');   // Sweden only
            url.searchParams.set('limit', '6');
            url.searchParams.set('accept-language', 'sv');

            const res = await fetch(url.toString(), {
                headers: { 'User-Agent': UA, 'Accept-Language': 'sv' },
            });
            const data: NominatimResult[] = await res.json();

            // Prefer results with a road+house_number, fall back to all
            const withHouseNum = data.filter(r => r.address.road && r.address.house_number);
            const results = withHouseNum.length > 0 ? withHouseNum : data;

            setSuggestions(results);
            setOpen(results.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ----------------------------------------------------------------
    // Step 2 — Validate selected address (confirm house number exists)
    // ----------------------------------------------------------------
    const validate = useCallback(async (result: AddressResult): Promise<boolean> => {
        if (!result.address) return true; // No street, skip
        const { address: street, city, postalCode } = result;

        // Split street into road + housenumber
        const match = street.match(/^(.+?)\s+(\d+\w*)$/);
        if (!match) return true; // No housenumber to validate

        const [, road, housenumber] = match;

        try {
            const url = new URL(`${NOMINATIM_BASE}/search`);
            url.searchParams.set('format', 'json');
            url.searchParams.set('addressdetails', '1');
            url.searchParams.set('street', `${housenumber} ${road}`);
            url.searchParams.set('city', city);
            if (postalCode) url.searchParams.set('postalcode', postalCode);
            url.searchParams.set('countrycodes', 'se');
            url.searchParams.set('limit', '1');

            const res = await fetch(url.toString(), {
                headers: { 'User-Agent': UA, 'Accept-Language': 'sv' },
            });
            const data: NominatimResult[] = await res.json();

            // Valid if nominatim can find this exact address
            return data.length > 0 && !!data[0].address.house_number;
        } catch {
            return true; // On network error, don't block user
        }
    }, []);

    // ----------------------------------------------------------------
    // Handlers
    // ----------------------------------------------------------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setValidated(null);
        onChange?.(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(val), 400);
    };

    const handleSelect = async (r: NominatimResult) => {
        const result = buildFullAddress(r);
        setQuery(result.fullAddress);
        setSuggestions([]);
        setOpen(false);

        // Immediate callback with unvalidated result so UI is fast
        onSelect({ ...result, validated: false });

        // Validate in background
        setValidating(true);
        const ok = await validate(result);
        setValidated(ok);
        setValidating(false);

        // Update parent with validation status
        onSelect({ ...result, validated: ok });
    };

    // ----------------------------------------------------------------
    // Styling
    // ----------------------------------------------------------------
    const borderClass = hasError
        ? 'border-red-400'
        : validated === true
            ? 'border-green-400'
            : validated === false
                ? 'border-orange-400'
                : 'border-gray-200';

    const statusIcon = () => {
        if (loading || validating) return <Loader2 size={15} className="text-gray-400 animate-spin shrink-0 ml-2" />;
        if (validated === true) return <CheckCircle size={15} className="text-green-500 shrink-0 ml-2" />;
        if (validated === false) return <AlertCircle size={15} className="text-orange-400 shrink-0 ml-2" />;
        return null;
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className ?? ''}`}>
            {/* Input */}
            <div className={`flex items-center border rounded-xl bg-[#FCFCFC] px-4 transition-colors focus-within:border-black ${borderClass}`}>
                <MapPin size={15} className={`shrink-0 mr-2 ${validated === true ? 'text-green-500' : 'text-gray-400'}`} />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="flex-1 h-[48px] bg-transparent outline-none font-inter text-[15px] text-black/80 placeholder:text-black/30"
                />
                {statusIcon()}
            </div>

            {/* Validation hint */}
            {validated === false && !validating && (
                <p className="text-[11px] text-orange-500 mt-1 ml-1 font-inter">
                    Kunde inte verifiera husnumret — kontrollera adressen
                </p>
            )}
            {validated === true && !validating && (
                <p className="text-[11px] text-green-500 mt-1 ml-1 font-inter">
                    ✓ Adress verifierad
                </p>
            )}

            {/* Dropdown */}
            {open && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                    {suggestions.map((r) => {
                        const { primary, secondary } = buildLabel(r);
                        return (
                            <li key={r.place_id} className="border-b border-gray-50 last:border-0">
                                <button
                                    type="button"
                                    onMouseDown={() => handleSelect(r)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
                                >
                                    <MapPin size={13} className="text-gray-300 mt-0.5 shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-inter font-medium text-[14px] text-black truncate">
                                            {primary}
                                        </span>
                                        {secondary && (
                                            <span className="font-inter text-[12px] text-gray-400 mt-0.5">
                                                {secondary}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default AddressAutocomplete;
