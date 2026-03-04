import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ----------------------------------------
// Types
// ----------------------------------------
export interface AuthUser {
    id: string;
    username: string;
    role: 'customer' | 'barber' | 'guest';
    token: string | null;
    location?: string;
    profile_pic_url?: string;
    // Barber-specifikt (platta fält för enkel access)
    salon_name?: string;
    salon_address?: string;
    city?: string;
    phone?: string;
    bio?: string;
    cover_image?: string;
    rating?: number;
    total_reviews?: number;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoggedIn: boolean;    // Riktigt inloggad med token
    isGuest: boolean;       // Gäst-läge (ingen token)
    isBarber: boolean;      // Inloggad barber
    login: (token: string, userData: Omit<AuthUser, 'token'>) => void;
    logout: () => void;
    setGuest: () => void;
}

// ----------------------------------------
// Context
// ----------------------------------------
const AuthContext = createContext<AuthContextType | null>(null);

// ----------------------------------------
// Provider
// ----------------------------------------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    // Återställ session vid sidladdning
    useEffect(() => {
        const savedUser = localStorage.getItem('cut_click_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('cut_click_user');
            }
        } else if (localStorage.getItem('cut_click_guest') === 'true') {
            setUser({ id: '', username: 'Gäst', role: 'guest', token: null });
        }
    }, []);

    const login = (token: string, userData: Omit<AuthUser, 'token'>) => {
        const fullUser: AuthUser = { ...userData, token };
        setUser(fullUser);
        localStorage.setItem('cut_click_user', JSON.stringify(fullUser));
        localStorage.removeItem('cut_click_guest');
    };

    const setGuest = () => {
        const guestUser: AuthUser = { id: '', username: 'Gäst', role: 'guest', token: null };
        setUser(guestUser);
        localStorage.setItem('cut_click_guest', 'true');
        localStorage.removeItem('cut_click_user');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cut_click_user');
        localStorage.removeItem('cut_click_guest');
        localStorage.removeItem('cut_click_token');
    };

    const isGuest = user?.role === 'guest';
    const isLoggedIn = !!user && !!user.token && user.role !== 'guest';
    const isBarber = user?.role === 'barber' && !!user.token;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isGuest, isBarber, login, logout, setGuest }}>
            {children}
        </AuthContext.Provider>
    );
};

// ----------------------------------------
// Hook
// ----------------------------------------
export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth måste användas inuti AuthProvider');
    return ctx;
};
