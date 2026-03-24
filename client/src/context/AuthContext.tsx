// global auth-state — user, token, login/logout/guest
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';

// typer
export interface AuthUser {
    id: string;
    username: string;
    role: 'customer' | 'barber' | 'guest';
    token: string | null;
    location?: string;
    profile_pic_url?: string;
    // barber-grejer
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
    isLoggedIn: boolean;    // riktigt inloggad med token
    isGuest: boolean;       // gäst-läge
    isBarber: boolean;      // inloggad barber
    login: (token: string, userData: Omit<AuthUser, 'token'>) => void;
    updateUser: (data: Partial<AuthUser>) => void;
    logout: () => void;
    setGuest: () => void;
}


const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    // återställ session vid load
    useEffect(() => {
        const savedUser = localStorage.getItem('cut_click_user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
            } catch {
                localStorage.removeItem('cut_click_user');
            }
        } else if (localStorage.getItem('cut_click_guest') === 'true') {
            setUser({ id: '', username: 'Gäst', role: 'guest', token: null });
        }

        // lyssna på oauth-logins
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.access_token) {
                // kolla om vi redan har usern
                const stored = localStorage.getItem('cut_click_user');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (parsed.token === session.access_token) return;
                    } catch { }
                }

                // synka med backend
                try {
                    const res = await fetch('/api/auth/oauth-sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    });
                    const d = await res.json();
                    if (res.ok && d.user) {
                        login(session.access_token, d.user);
                    }
                } catch (err) {
                    console.error('Kunde inte synka OAuth-login:', err);
                }
            } else if (event === 'SIGNED_OUT') {
                if (!localStorage.getItem('cut_click_guest')) {
                    setUser(null);
                    localStorage.removeItem('cut_click_user');
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const login = (token: string, userData: Omit<AuthUser, 'token'>) => {
        const fullUser: AuthUser = { ...userData, token };
        setUser(fullUser);
        localStorage.setItem('cut_click_user', JSON.stringify(fullUser));
        localStorage.removeItem('cut_click_guest');
    };

    const updateUser = (data: Partial<AuthUser>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('cut_click_user', JSON.stringify(updatedUser));
    };

    const setGuest = () => {
        const guestUser: AuthUser = { id: '', username: 'Gäst', role: 'guest', token: null };
        setUser(guestUser);
        localStorage.setItem('cut_click_guest', 'true');
        localStorage.removeItem('cut_click_user');
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('cut_click_user');
        localStorage.removeItem('cut_click_guest');
        localStorage.removeItem('cut_click_token');
    };

    const isGuest = user?.role === 'guest';
    const isLoggedIn = !!user && !!user.token && user.role !== 'guest';
    const isBarber = user?.role === 'barber' && !!user.token;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isGuest, isBarber, login, updateUser, logout, setGuest }}>
            {children}
        </AuthContext.Provider>
    );
};

// hook
export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth måste användas inuti AuthProvider');
    return ctx;
};
