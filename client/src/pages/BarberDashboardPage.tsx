import React, { useState } from 'react';
import { Home, Scissors, ShoppingBag, Calendar, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BarberHomePage from './barber/BarberHomePage';
import BarberServicesPage from './barber/BarberServicesPage';
import BarberProductsPage from './barber/BarberProductsPage';
import BarberSchedulePage from './barber/BarberSchedulePage';
import BarberBookingsPage from './barber/BarberBookingsPage';
import BarberSettingsPage from './barber/BarberSettingsPage';

type BarberTab = 'home' | 'services' | 'products' | 'schedule' | 'bookings' | 'settings';

const TABS: { id: BarberTab; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Hem' },
    { id: 'services', icon: Scissors, label: 'Tjänster' },
    { id: 'products', icon: ShoppingBag, label: 'Produkter' },
    { id: 'schedule', icon: Calendar, label: 'Schema' },
    { id: 'bookings', icon: Calendar, label: 'Bokningar' },
    { id: 'settings', icon: Settings, label: 'Inställningar' },
];

interface BarberDashboardProps {
    onSignOut: () => void;
}

const BarberDashboardPage: React.FC<BarberDashboardProps> = ({ onSignOut }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<BarberTab>('home');

    const renderTab = () => {
        switch (activeTab) {
            case 'home': return <BarberHomePage user={user} onAddService={() => setActiveTab('services')} onSignOut={onSignOut} />;
            case 'services': return <BarberServicesPage user={user} />;
            case 'products': return <BarberProductsPage user={user} />;
            case 'schedule': return <BarberSchedulePage user={user} />;
            case 'bookings': return <BarberBookingsPage user={user} />;
            case 'settings': return <BarberSettingsPage user={user} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#F8F8F8] overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {renderTab()}
            </div>

            {/* Bottom Nav */}
            <div className="bg-white border-t border-gray-100 flex items-stretch px-2 pb-safe shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all ${active ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-black/5' : ''}`}>
                                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                            </div>
                            <span className={`text-[10px] font-inter font-medium tracking-wide ${active ? 'text-black' : 'text-gray-400'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BarberDashboardPage;
