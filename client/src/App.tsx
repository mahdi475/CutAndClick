import React, { useState } from 'react';
import { Home, Compass, Heart, User, History, LogOut } from 'lucide-react';
import HomePage from './pages/HomePage';
import BarberDetailPage from './pages/BarberDetailPage';
import StoreServicesPage from './pages/StoreServicesPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BookingPage from './pages/BookingPage';
import HistoryPage from './pages/HistoryPage';
import FavouritesPage from './pages/FavouritesPage';
import ProfilePage from './pages/ProfilePage';
import StartupPage from './pages/StartupPage';
import LoginPage from './pages/LoginPage';
import BookingConfirmedPage from './pages/BookingConfirmedPage';
import { BarberShop, Product, Service } from './types';

const App: React.FC = () => {
  // State for Startup/Onboarding and Login
  const [showStartup, setShowStartup] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'favourites' | 'profile'>('home');
  const [selectedBarber, setSelectedBarber] = useState<BarberShop | null>(null);
  const [viewingStoreServices, setViewingStoreServices] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | Service | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // --- Startup Handlers ---
  const handleStartupFinish = () => {
    setShowStartup(false);
    setShowLogin(false);
  };
  
  const handleRegister = () => {
    // Navigate from Startup to Login page
    setShowStartup(false);
    setShowLogin(true);
  };

  const handleLogin = () => {
    // Complete login, go to home
    setShowLogin(false);
  };

  const handleSignOut = () => {
    // Reset state and go back to startup
    setShowStartup(true);
    setShowLogin(false);
    setActiveTab('home');
    setSelectedBarber(null);
    setViewingStoreServices(false);
    setSelectedItem(null);
    setIsBooking(false);
    setIsBookingConfirmed(false);
  };

  // --- Main App Handlers ---
  const handleBarberClick = (barber: BarberShop) => {
    setSelectedBarber(barber);
    setViewingStoreServices(false);
    setSelectedItem(null);
    setIsBooking(false);
  };

  const handleBackToHome = () => {
    setSelectedBarber(null);
    setViewingStoreServices(false);
    setSelectedItem(null);
    setIsBooking(false);
    setIsBookingConfirmed(false);
    setActiveTab('home'); // Ensure tab resets to home
  };
  
  const handleSeeAllServices = () => {
    setViewingStoreServices(true);
  };

  const handleBackToBarber = () => {
    setViewingStoreServices(false);
  };

  const handleItemClick = (item: Product | Service) => {
    setSelectedItem(item);
  };

  const handleBackFromItem = () => {
    setSelectedItem(null);
    setIsBooking(false);
  };

  const handleBookNow = () => {
    setIsBooking(true);
  };

  const handleBackFromBooking = () => {
    setIsBooking(false);
  };

  const handleBookingConfirm = () => {
    setIsBooking(false);
    setIsBookingConfirmed(true);
  };

  const handleTabChange = (tab: 'home' | 'history' | 'favourites' | 'profile') => {
    // If clicking Home while on Home tab and deep in navigation, reset to root
    if (tab === 'home' && activeTab === 'home' && selectedBarber) {
        handleBackToHome();
        return;
    }

    setActiveTab(tab);
    // Reset navigation stack when changing tabs
    if (tab !== 'home' || selectedBarber) {
       if (tab !== 'home') {
         setSelectedBarber(null);
         setViewingStoreServices(false);
       }
       setSelectedItem(null);
       setIsBooking(false);
       setIsBookingConfirmed(false);
    }
  };

  // Helper to determine if bottom nav should be visible
  const shouldShowBottomNav = !showStartup && !showLogin && !selectedItem && !isBookingConfirmed;

  // Helper to render current content
  const renderContent = () => {
    // If startup is active, render it exclusively
    if (showStartup) {
      return <StartupPage onFinish={handleStartupFinish} onRegister={handleRegister} />;
    }

    if (showLogin) {
      return <LoginPage onLogin={handleLogin} onSignUp={handleLogin} />;
    }

    if (isBookingConfirmed) {
      return <BookingConfirmedPage onHome={handleBackToHome} />;
    }

    if (isBooking && selectedItem) {
        return <BookingPage item={selectedItem} onBack={handleBackFromBooking} onConfirm={handleBookingConfirm} />;
    }

    if (selectedItem) {
        return <ProductDetailPage item={selectedItem} onBack={handleBackFromItem} onBookNow={handleBookNow} />;
    }

    if (activeTab === 'home') {
        if (selectedBarber) {
            if (viewingStoreServices) {
                return <StoreServicesPage barber={selectedBarber} onBack={handleBackToBarber} onItemClick={handleItemClick} />;
            }
            return (
                <BarberDetailPage 
                    barber={selectedBarber} 
                    onBack={handleBackToHome} 
                    onSeeAllProducts={handleSeeAllServices}
                    onProductClick={handleItemClick}
                />
            );
        }
        return <HomePage onBarberClick={handleBarberClick} />;
    }

    if (activeTab === 'history') return <HistoryPage onBack={handleBackToHome} />;
    
    if (activeTab === 'favourites') return <FavouritesPage onItemClick={handleItemClick} onBack={handleBackToHome} />;
    
    if (activeTab === 'profile') return <ProfilePage onBack={handleBackToHome} onSignOut={handleSignOut} />;

    return null;
  };

  // Check if we are in a "Fullscreen" modal state (Startup/Login) to avoid rendering the outer layout structure
  const isFullScreenModal = showStartup || showLogin;

  if (isFullScreenModal) {
    return renderContent();
  }

  return (
    <div className="flex h-screen w-full bg-white lg:bg-gray-100 lg:p-8 font-sans overflow-hidden">
      
      {/* --- Desktop Sidebar (Hidden on Mobile/Tablet) --- */}
      <div className="hidden lg:flex flex-col w-64 h-full bg-white rounded-[30px] shadow-sm mr-6 p-6 justify-between flex-shrink-0">
         <div>
            <div className="mb-10 px-4">
               <h1 className="font-montserrat font-bold text-2xl text-[#2F2F2F]">Cut & Click</h1>
            </div>
            <nav className="flex flex-col gap-4">
                <button 
                  onClick={() => handleTabChange('home')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' && !selectedBarber && !selectedItem ? 'bg-black text-white' : 'text-[#848282] hover:bg-gray-100'}`}
                >
                   <Home size={24} />
                   <span className="font-inter font-medium text-[16px]">Home</span>
                </button>
                <button 
                  onClick={() => handleTabChange('history')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-black text-white' : 'text-[#848282] hover:bg-gray-100'}`}
                >
                   <History size={24} />
                   <span className="font-inter font-medium text-[16px]">History</span>
                </button>
                <button 
                  onClick={() => handleTabChange('favourites')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'favourites' ? 'bg-black text-white' : 'text-[#848282] hover:bg-gray-100'}`}
                >
                   <Heart size={24} />
                   <span className="font-inter font-medium text-[16px]">Favorites</span>
                </button>
                <button 
                  onClick={() => handleTabChange('profile')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-black text-white' : 'text-[#848282] hover:bg-gray-100'}`}
                >
                   <User size={24} />
                   <span className="font-inter font-medium text-[16px]">Profile</span>
                </button>
            </nav>
         </div>
         <button onClick={handleSignOut} className="flex items-center gap-4 px-4 py-3 text-[#FF4A4A] hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={24} />
            <span className="font-inter font-medium text-[16px]">Sign Out</span>
         </button>
      </div>

      {/* --- Main Content Wrapper --- */}
      {/* 
          Mobile/Tablet: w-full h-full (No margins, no rounding)
          Desktop: flex-1 (Takes remaining space), rounded corners, shadow
      */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white lg:rounded-[30px] lg:shadow-2xl">
        
        {/* Scrollable Content Area */}
        <div className={`h-full overflow-y-auto no-scrollbar ${shouldShowBottomNav ? 'pb-24 lg:pb-0' : ''}`}>
          {renderContent()}
        </div>

        {/* --- Mobile/Tablet Bottom Navigation (Hidden on Desktop) --- */}
        {shouldShowBottomNav && (
          <div className="absolute bottom-0 w-full h-[90px] bg-white border-t border-gray-100 flex justify-around items-center px-6 pb-2 z-50 lg:hidden">
            
            <button 
              onClick={() => handleTabChange('home')}
              className="flex flex-col items-center justify-center w-12 h-12 relative"
            >
              <Home 
                size={24} 
                color={activeTab === 'home' && !selectedBarber && !selectedItem ? '#2F2F2F' : '#848282'} 
                strokeWidth={activeTab === 'home' && !selectedBarber && !selectedItem ? 2.5 : 2}
              />
              {(activeTab === 'home' && !selectedBarber && !selectedItem) && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full"></div>
              )}
            </button>

            <button 
              onClick={() => handleTabChange('history')}
              className="flex flex-col items-center justify-center w-12 h-12 relative"
            >
              <History 
                size={24} 
                color={activeTab === 'history' ? '#2F2F2F' : '#848282'} 
                strokeWidth={activeTab === 'history' ? 2.5 : 2}
              />
              {activeTab === 'history' && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full"></div>
              )}
            </button>

            <button 
              onClick={() => handleTabChange('favourites')}
              className="flex flex-col items-center justify-center w-12 h-12 relative"
            >
              <Heart 
                size={24} 
                color={activeTab === 'favourites' ? '#2F2F2F' : '#848282'} 
                strokeWidth={activeTab === 'favourites' ? 2.5 : 2}
                className={activeTab === 'favourites' ? "fill-current" : ""}
              />
              {activeTab === 'favourites' && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full"></div>
              )}
            </button>

            <button 
              onClick={() => handleTabChange('profile')}
              className="flex flex-col items-center justify-center w-12 h-12 relative"
            >
              <User 
                size={24} 
                color={activeTab === 'profile' ? '#2F2F2F' : '#848282'} 
                strokeWidth={activeTab === 'profile' ? 2.5 : 2}
              />
              {activeTab === 'profile' && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full"></div>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;