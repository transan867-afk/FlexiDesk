import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (cafeId: string) => boolean;
  toggleFavorite: (cafeId: string, cafeName?: string) => boolean; // returns new favorited status
  notice: string | null;
}

const STORAGE_KEY = 'flexidesk_user_favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['cafe-1']; // default favorite cafe-1
    } catch {
      return ['cafe-1'];
    }
  });

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  const isFavorite = (cafeId: string) => favorites.includes(cafeId);

  const toggleFavorite = (cafeId: string, cafeName?: string): boolean => {
    const willBeFav = !favorites.includes(cafeId);
    setFavorites(prev => {
      if (prev.includes(cafeId)) {
        return prev.filter(id => id !== cafeId);
      } else {
        return [...prev, cafeId];
      }
    });

    const msg = willBeFav
      ? `Đã lưu "${cafeName || 'quán'}" vào danh sách yêu thích!`
      : `Đã bỏ lưu "${cafeName || 'quán'}" khỏi danh sách yêu thích.`;
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);

    return willBeFav;
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, notice }}>
      {children}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2.5 animate-bounce">
          <span className="text-brand-coral">♥</span>
          <span>{notice}</span>
        </div>
      )}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
