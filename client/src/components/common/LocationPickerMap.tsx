import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerMapProps {
    onAddressSelected: (address: string, city: string) => void;
    initialAddress?: string;
}

// Center map to selected coords or reverse geocode when clicked
const MapEvents = ({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelected(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const CenterUpdater = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { animate: true });
        }
    }, [center, map]);
    return null;
};

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ onAddressSelected, initialAddress }) => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(false);
    const [addressText, setAddressText] = useState('Klicka på kartan för att välja plats');
    const lastGeocodedAddress = useRef<string>('');

    // Default to Stockholm center
    const defaultCenter: [number, number] = [59.3293, 18.0686];

    // Attempt to geocode initial address if provided
    useEffect(() => {
        if (initialAddress && initialAddress.length > 5 && initialAddress !== lastGeocodedAddress.current) {
            const geocodeMsg = async () => {
                try {
                    setLoading(true);
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(initialAddress)}`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        setPosition([lat, lon]);
                        const newAddrText = data[0].display_name.split(',')[0];
                        setAddressText(newAddrText);
                        lastGeocodedAddress.current = initialAddress;
                    }
                } catch {
                    // silent ignore
                } finally {
                    setLoading(false);
                }
            };
            // delay slightly so it doesn't spam nominatim on every keystroke
            const to = setTimeout(geocodeMsg, 1500);
            return () => clearTimeout(to);
        }
    }, [initialAddress]);

    const handleLocationSelected = async (lat: number, lng: number) => {
        setPosition([lat, lng]);
        setLoading(true);
        setAddressText('Hämtar adress...');
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.address) {
                const road = data.address.road || data.address.pedestrian || '';
                const house = data.address.house_number || '';
                const city = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
                
                let combinedAddress = road;
                if (house) combinedAddress += ` ${house}`;
                
                const displayTitle = combinedAddress || data.display_name.split(',')[0];
                
                setAddressText(displayTitle);
                lastGeocodedAddress.current = displayTitle;
                
                // Om vi hittade stad och adress så uppdaterar vi fälten i formuläret
                onAddressSelected(displayTitle, city);
            } else {
                setAddressText('Kunde inte hämta exakt adress');
            }
        } catch (error) {
            setAddressText('Fel vid hämtning');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col mt-2">
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="font-inter text-[13px] text-black/60 font-medium uppercase tracking-wider">
                    Välj plats (Klicka på kartan)
                </span>
                {loading && <Loader2 size={14} className="animate-spin text-black/40" />}
            </div>
            
            <div className="w-full h-[180px] rounded-[18px] overflow-hidden border border-black/10 relative shadow-inner z-0">
                <MapContainer 
                    center={position || defaultCenter} 
                    zoom={13} 
                    scrollWheelZoom={false}
                    className="w-full h-full z-0 relative"
                    style={{ zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CenterUpdater center={position} />
                    <MapEvents onLocationSelected={handleLocationSelected} />
                    {position && (
                        <Marker position={position} />
                    )}
                </MapContainer>
                
                <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md rounded-[12px] px-4 py-2 border border-black/5 shadow-sm">
                        <p className="font-inter font-medium text-[13px] text-black/80 truncate">
                            📍 {addressText}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerMap;
