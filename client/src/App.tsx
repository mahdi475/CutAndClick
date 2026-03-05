import React, { useState, useCallback, useEffect } from 'react';
import { Home, Heart, User, History, LogOut, Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavouritesProvider } from './context/FavouritesContext';
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
import RegisterPage from './pages/RegisterPage';
import BookingConfirmedPage from './pages/BookingConfirmedPage';
import BarberDashboardPage from './pages/BarberDashboardPage';
import Toast from './components/ui/Toast';
import { BarberShop, Product, Service } from './types';

type Screen = 'startup' | 'login' | 'register' | 'app' | 'barberDashboard';

// ----------------------------------------
// Guest-only tabs that require login
// ----------------------------------------
const PROTECTED_TABS = ['history', 'favourites', 'profile'] as const;

// ----------------------------------------
// AppInner — inside AuthProvider
// ----------------------------------------
const AppInner: React.FC = () => {
  const { user, isGuest, setGuest, logout } = useAuth();

  const [screen, setScreen] = useState<Screen>('startup');

  // Keep track of whether we've handled the initial load redirection
  const initialLoadHandled = React.useRef(false);

  // Auto-route users when session is restored from localStorage, but ONLY on initial load
  useEffect(() => {
    if (user && user.role !== 'guest' && !initialLoadHandled.current) {
      initialLoadHandled.current = true;
      if (user.role === 'barber') {
        setScreen('barberDashboard');
      } else {
        setScreen('app');
      }
    } else if (user?.role === 'guest' && !initialLoadHandled.current) {
      initialLoadHandled.current = true;
      setScreen('app');
    }
  }, [user]);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);
  const hideToast = useCallback(() => setToastVisible(false), []);

  // Navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'favourites' | 'profile'>('home');
  const [selectedBarber, setSelectedBarber] = useState<BarberShop | null>(null);
  const [viewingStoreServices, setViewingStoreServices] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | Service | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<{ date: string; time: string } | null>(null);

  // --- Screen Handlers ---
  const handleStartupFinish = () => {
    setScreen('app');
    showToast('Välkommen som gäst');
  };

  const handleStartupRegister = () => setScreen('login');

  const handleLoginSuccess = (username: string, role: 'customer' | 'barber') => {
    // Navigate based on the passed role, since context 'user' is stale here
    if (role === 'barber') {
      setScreen('barberDashboard');
      showToast(`Välkommen tillbaka, ${username}!`);
    } else {
      setScreen('app');
      showToast(`Välkommen, ${username}!`);
    }
  };

  const handleRegisterSuccess = (role: 'customer' | 'barber') => {
    if (role === 'barber') {
      setScreen('barberDashboard');
      showToast('Välkommen! Salongen är redo');
    } else {
      setScreen('app');
      showToast('Kontot är skapat! Välkommen');
    }
  };

  const handleSignOut = () => {
    const token = user?.token;
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { /* ignore */ });
    }
    logout();
    setScreen('startup');
    setActiveTab('home');
    setSelectedBarber(null);
    setViewingStoreServices(false);
    setSelectedItem(null);
    setIsBooking(false);
    setIsBookingConfirmed(false);
  };

  // ----------------------------------------
  // Guest guard helpers
  // ----------------------------------------
  const requireLogin = (action: () => void, reason: string) => {
    if (isGuest) {
      showToast(reason);
      // Redirect to login after a short delay so toast is visible
      setTimeout(() => setScreen('login'), 1500);
      return false;
    }
    action();
    return true;
  };

  // --- Nav Handlers ---
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
    setActiveTab('home');
  };

  const handleSeeAllServices = () => setViewingStoreServices(true);
  const handleBackToBarber = () => setViewingStoreServices(false);
  const handleItemClick = (item: Product | Service) => setSelectedItem(item);
  const handleBackFromItem = () => { setSelectedItem(null); setIsBooking(false); };

  // Booking requires login
  const handleBookNow = () => {
    requireLogin(
      () => setIsBooking(true),
      'Logga in för att boka tid'
    );
  };

  const handleBackFromBooking = () => setIsBooking(false);
  const handleBookingConfirm = (details: { date: string; time: string }) => {
    setConfirmedBookingDetails(details);
    setIsBooking(false);
    setIsBookingConfirmed(true);
  };

  const handleTabChange = (tab: 'home' | 'history' | 'favourites' | 'profile') => {
    // Guest guard for protected tabs
    if (isGuest && PROTECTED_TABS.includes(tab as any)) {
      const labels: Record<string, string> = {
        history: 'din bokningshistorik',
        favourites: 'dina favoriter',
        profile: 'din profil',
      };
      showToast(`Logga in för att se ${labels[tab]}`);
      setTimeout(() => setScreen('login'), 1500);
      return;
    }

    if (tab === 'home' && activeTab === 'home' && selectedBarber) {
      handleBackToHome();
      return;
    }
    setActiveTab(tab);
    if (tab !== 'home') {
      setSelectedBarber(null);
      setViewingStoreServices(false);
    }
    setSelectedItem(null);
    setIsBooking(false);
    setIsBookingConfirmed(false);
  };

  const shouldShowBottomNav = screen === 'app' && !selectedItem && !isBookingConfirmed;

  // ----------------------------------------
  // Screen: Startup
  // ----------------------------------------
  if (screen === 'startup') {
    return (
      <>
        <StartupPage onFinish={handleStartupFinish} onRegister={handleStartupRegister} />
        <Toast message={toastMessage} visible={toastVisible} onClose={hideToast} />
      </>
    );
  }

  // ----------------------------------------
  // Screen: Login
  // ----------------------------------------
  if (screen === 'login') {
    return (
      <>
        <LoginPage
          onLogin={handleLoginSuccess}
          onSignUp={() => setScreen('register')}
          onShowToast={showToast}
        />
        <Toast message={toastMessage} visible={toastVisible} onClose={hideToast} />
      </>
    );
  }

  // ----------------------------------------
  // Screen: Register
  // ----------------------------------------
  if (screen === 'register') {
    return (
      <>
        <RegisterPage
          onSuccess={handleRegisterSuccess}
          onBack={() => setScreen('login')}
        />
        <Toast message={toastMessage} visible={toastVisible} onClose={hideToast} />
      </>
    );
  }

  // ----------------------------------------
  // Screen: Barber Dashboard (placeholder)
  // ----------------------------------------
  if (screen === 'barberDashboard') {
    return (
      <>
        <BarberDashboardPage onSignOut={handleSignOut} />
        <Toast message={toastMessage} visible={toastVisible} onClose={hideToast} />
      </>
    );
  }

  // ----------------------------------------
  // Screen: Main App
  // ----------------------------------------
  const renderContent = () => {
    if (isBookingConfirmed) return <BookingConfirmedPage onHome={handleBackToHome} details={confirmedBookingDetails} item={selectedItem} barber={selectedBarber} />;
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

  // Tab active helpers
  const isTabActive = (tab: string) => activeTab === tab && !selectedBarber && !selectedItem;

  return (
    <div className="flex h-screen w-full bg-white lg:bg-gray-100 lg:p-8 font-sans overflow-hidden">

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-full bg-white rounded-[30px] shadow-sm mr-6 p-6 justify-between flex-shrink-0">
        <div>
          <div className="mb-10 px-4 flex items-center gap-4">
            <div
              onClick={() => handleTabChange('profile')}
              className="w-[50px] h-[50px] bg-[#2F2F2F] rounded-full overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center shrink-0 border border-gray-100"
            >
              {user?.profile_pic_url ? (
                <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-inter font-bold text-[18px]">
                  {(user?.username || 'G').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-montserrat font-bold text-xl text-[#2F2F2F] truncate">Cut & Click</h1>
              <p className="text-xs text-black/40 font-inter mt-0.5 truncate uppercase tracking-wider font-bold">
                {isGuest ? 'Gäst' : user?.username}
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {/* Home — always accessible */}
            <button
              onClick={() => handleTabChange('home')}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isTabActive('home') ? 'bg-black text-white' : 'text-[#848282] hover:bg-gray-100'}`}
            >
              <Home size={22} /><span className="font-inter font-medium text-[15px]">Home</span>
            </button>

            {/* Protected tabs — show lock icon for guests */}
            {(['history', 'favourites', 'profile'] as const).map(tab => {
              const icons = { history: History, favourites: Heart, profile: User };
              const labels = { history: 'History', favourites: 'Favorites', profile: 'Profile' };
              const Icon = icons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isTabActive(tab) ? 'bg-black text-white' : 'text-[#848282] hover:bg-gray-100'}`}
                >
                  <Icon size={22} />
                  <span className="font-inter font-medium text-[15px]">{labels[tab]}</span>
                  {isGuest && <Lock size={12} className="ml-auto opacity-40" />}
                </button>
              );
            })}
          </nav>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-4 py-3 text-[#FF4A4A] hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={22} />
          <span className="font-inter font-medium text-[15px]">{isGuest ? 'Avsluta gäst-session' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white lg:rounded-[30px] lg:shadow-2xl">
        <div className={`h-full overflow-y-auto no-scrollbar ${shouldShowBottomNav ? 'pb-24 lg:pb-0' : ''}`}>
          {renderContent()}
        </div>

        {/* Mobile Bottom Nav */}
        {shouldShowBottomNav && (
          <div className="absolute bottom-0 w-full h-[90px] bg-white border-t border-gray-100 flex justify-around items-center px-6 pb-2 z-50 lg:hidden">
            {/* Home */}
            <button onClick={() => handleTabChange('home')} className="flex flex-col items-center justify-center w-12 h-12 relative">
              <Home size={24} color={activeTab === 'home' && !selectedBarber && !selectedItem ? '#2F2F2F' : '#848282'} strokeWidth={activeTab === 'home' && !selectedBarber && !selectedItem ? 2.5 : 2} />
              {(activeTab === 'home' && !selectedBarber && !selectedItem) && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full" />}
            </button>
            {/* History */}
            <button onClick={() => handleTabChange('history')} className="flex flex-col items-center justify-center w-12 h-12 relative">
              <History size={24} color={activeTab === 'history' ? '#2F2F2F' : '#848282'} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
              {activeTab === 'history' && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full" />}
              {isGuest && <Lock size={8} className="absolute top-0 right-0 text-black/30" />}
            </button>
            {/* Favourites */}
            <button onClick={() => handleTabChange('favourites')} className="flex flex-col items-center justify-center w-12 h-12 relative">
              <Heart size={24} color={activeTab === 'favourites' ? '#2F2F2F' : '#848282'} strokeWidth={activeTab === 'favourites' ? 2.5 : 2} />
              {activeTab === 'favourites' && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full" />}
              {isGuest && <Lock size={8} className="absolute top-0 right-0 text-black/30" />}
            </button>
            {/* Profile */}
            <button onClick={() => handleTabChange('profile')} className="flex flex-col items-center justify-center w-12 h-12 relative">
              {user?.profile_pic_url ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${activeTab === 'profile' ? 'border-black' : 'border-gray-300'}`}>
                  <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <User size={24} color={activeTab === 'profile' ? '#2F2F2F' : '#848282'} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              )}
              {activeTab === 'profile' && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FF4A4A] rounded-full" />}
              {isGuest && <Lock size={8} className="absolute top-0 right-0 text-black/30" />}
            </button>
          </div>
        )}
      </div>

      <Toast message={toastMessage} visible={toastVisible} onClose={hideToast} />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <FavouritesProvider>
      <AppInner />
    </FavouritesProvider>
  </AuthProvider>
);

export default App;