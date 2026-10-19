import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Coffee, ShoppingBag, Heart, User, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/databaseService';
import { calculateBookingCountdown } from '../../utils/countdown';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { favorites } = useFavorites();
  const { currentUser } = useAuth();
  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);

  // Check active bookings count for badge
  useEffect(() => {
    const updateCount = () => {
      const bookings = db.getBookings();
      const count = bookings.filter(b => {
        if (b.bookingStatus === 'cancelled' || b.bookingStatus === 'completed' || b.bookingStatus === 'expired') {
          return false;
        }
        const cd = calculateBookingCountdown(b.date, b.startTime, b.createdAt);
        return cd.status !== 'expired' && (b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending_payment');
      }).length;
      setActiveBookingsCount(count);
    };

    updateCount();
    const unsub = db.subscribe(updateCount);
    window.addEventListener('flexidesk_db_updated', updateCount);
    const interval = setInterval(updateCount, 2000);

    return () => {
      unsub();
      window.removeEventListener('flexidesk_db_updated', updateCount);
      clearInterval(interval);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      name: 'Trang chủ',
      path: '/',
      icon: Home,
    },
    {
      name: 'Khám phá',
      path: '/cafes',
      icon: Coffee,
    },
    {
      name: 'Đơn của tôi',
      path: '/account/bookings',
      icon: ShoppingBag,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
      badgeColor: 'bg-[#FF5C8D]',
    },
    {
      name: 'Yêu thích',
      path: '/cafes?favorites=true',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      name: currentUser ? (currentUser.role === 'partner' ? 'Chủ quán' : currentUser.role === 'admin' ? 'Admin' : 'Tài khoản') : 'Đăng nhập',
      path: currentUser ? (currentUser.role === 'partner' ? '/partner/dashboard' : currentUser.role === 'admin' ? '/admin/dashboard' : '/account/bookings') : '/login',
      icon: User,
      isSpecial: currentUser?.role === 'partner' || currentUser?.role === 'admin',
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#FFD9E2] shadow-[0_-4px_20px_rgba(46,26,18,0.08)] px-2 py-1.5 transition-all select-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative transition-all ${
                active
                  ? 'text-[#FF5C8D] font-extrabold scale-105'
                  : 'text-stone-500 hover:text-[#2E1A12] font-semibold'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? 'stroke-[2.5px] scale-110 text-[#FF5C8D]' : 'stroke-2'
                  }`}
                />

                {/* Notification Badge */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse ${
                      item.badgeColor || 'bg-[#FF5C8D]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.isSpecial && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight leading-none ${active ? 'font-black text-[#FF5C8D]' : 'font-medium'}`}>
                {item.name}
              </span>

              {/* Active Indicator Bar */}
              {active && (
                <span className="w-4 h-1 bg-[#FF5C8D] rounded-full mt-1"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
