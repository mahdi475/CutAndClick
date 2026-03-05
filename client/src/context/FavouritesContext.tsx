import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface FavouritesContextType {
    favorites: string[]; // Array of barber IDs
    toggleFavorite: (barberId: string) => Promise<boolean>;
    isFavorite: (barberId: string) => boolean;
    refreshFavorites: () => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoggedIn } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);

    const refreshFavorites = useCallback(async () => {
        if (!isLoggedIn || !user?.token) {
            setFavorites([]);
            return;
        }

        try {
            const res = await fetch('/api/favourites', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Assumes API returns array of objects with barber_id
                setFavorites(data.map((fav: any) => fav.barber_id));
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    }, [isLoggedIn, user?.token]);

    useEffect(() => {
        refreshFavorites();
    }, [refreshFavorites]);

    const isFavorite = (barberId: string) => favorites.includes(barberId);

    const toggleFavorite = async (barberId: string): Promise<boolean> => {
        if (!isLoggedIn || !user?.token) return false;

        const wasFavorite = isFavorite(barberId);

        // Optimistic update
        setFavorites(prev =>
            wasFavorite ? prev.filter(id => id !== barberId) : [...prev, barberId]
        );

        try {
            const method = wasFavorite ? 'DELETE' : 'POST';
            const url = wasFavorite ? `/api/favourites/${barberId}` : '/api/favourites';
            const body = wasFavorite ? undefined : JSON.stringify({ barber_id: barberId });

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body
            });

            if (!res.ok) throw new Error('Failed to toggle favorite');
            return true;
        } catch (err) {
            // Revert on error
            setFavorites(prev =>
                wasFavorite ? [...prev, barberId] : prev.filter(id => id !== barberId)
            );
            return false;
        }
    };

    return (
        <FavouritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, refreshFavorites }}>
            {children}
        </FavouritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavouritesContext);
    if (!context) throw new Error('useFavorites must be used within FavouritesProvider');
    return context;
};
