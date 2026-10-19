import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Coffee, User as UserIcon, ShieldCheck, Store, LogOut, ChevronDown, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { currentUser, logout, quickLoginAs } = useAuth();
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Khám phá Quán', path: '/cafes' },
    { name: 'Gói Hội Viên', path: '/pricing', highlight: true },
    { name: 'Đơn của tôi', path: '/account/bookings' },
    { name: 'Về FlexiDesk', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100/80 transition-all shadow-xs">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Left section: Back button (on subpages) + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FFF9EE] hover:bg-[#FCECEF] text-[#FF5C8D] hover:text-[#E83D70] font-extrabold text-xs border border-[#FFD9E2] transition-all shadow-2xs group"
                title="Quay lại trang trước"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
            )}

            {/* Brand Logo matching Image 1 Pink & Beige vibe */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF5C8D] to-[#E83D70] flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
                <svg viewBox="0 0 160 160" className="w-7 h-7 fill-white">
                  <g transform="translate(-5, 14)">
                    <path d="M 28 32 C 28 26.48 32.48 22 38 22 L 72 22 C 77.52 22 82 26.48 82 32 C 82 37.52 77.52 42 72 42 L 48 42 L 48 54 L 68 54 C 73.52 54 78 58.48 78 64 C 78 69.52 73.52 74 68 74 L 48 74 L 48 94 C 48 99.52 43.52 104 38 104 C 32.48 104 28 99.52 28 94 Z" />
                    <path d="M 88 32 C 88 26.48 92.48 22 98 22 C 122.3 22 142 41.7 142 66 C 142 90.3 122.3 110 98 110 C 92.48 110 88 105.52 88 100 C 88 94.48 92.48 90 98 90 C 111.25 90 122 79.25 122 66 C 122 52.75 111.25 42 98 42 C 92.48 42 88 37.52 88 32 Z" />
                  </g>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-[#2E1A12] flex items-center gap-1">
                  Flexi<span className="text-[#FF5C8D]">Desk</span>
                </span>
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">
                  Coffee & Workspaces
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-150 py-1 relative ${
                  isActive(link.path)
                    ? 'text-[#FF5C8D] font-bold'
                    : 'text-[#4A3830] hover:text-[#FF5C8D]'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5C8D] rounded-full"></span>
                )}
              </Link>
            ))}

            {/* Role specific quick buttons in desktop nav */}
            {currentUser?.role === 'partner' && (
              <Link
                to="/partner/dashboard"
                className="bg-[#FFF9EE] hover:bg-[#FCECEF] text-[#2E1A12] hover:text-[#FF5C8D] px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors border border-[#FFD9E2]"
              >
                <Store className="w-3.5 h-3.5 text-[#FF5C8D]" />
                <span>Quản Lý Quán (POS)</span>
              </Link>
            )}

            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="bg-[#FFF9EE] hover:bg-[#FCECEF] text-[#2E1A12] hover:text-[#FF5C8D] px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors border border-[#FFD9E2]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5C8D]" />
                <span>Bảng Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Pro Membership Pill */}
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white text-xs font-black px-4 py-2 rounded-full shadow-xs transition-all transform hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 fill-pink-200" />
              <span>Gói Pro 79k</span>
            </Link>

            {/* Search Button */}
            <Link
              to="/cafes"
              className="p-2.5 text-stone-600 hover:text-[#FF5C8D] hover:bg-pink-50 rounded-full transition-colors"
              title="Tìm kiếm quán"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Saved / Favorites Heart Button */}
            <Link
              to="/cafes?favorites=true"
              className="relative p-2.5 text-stone-600 hover:text-rose-500 hover:bg-pink-50 rounded-full transition-colors"
              title="Quán yêu thích của bạn"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-[#FF5C8D] fill-[#FF5C8D]' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5C8D] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/booking"
              className="relative p-2.5 text-stone-600 hover:text-[#FF5C8D] hover:bg-pink-50 rounded-full transition-colors"
              title="Đồ uống đã chọn"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5C8D] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-full border border-stone-200 bg-cream-50 hover:bg-cream-100 transition-all text-xs font-bold"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="max-w-[100px] truncate text-stone-800">{currentUser.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                    currentUser.role === 'admin' ? 'bg-[#FEF0C7] text-[#B54708]' :
                    currentUser.role === 'partner' ? 'bg-[#FF5C8D] text-white' : 'bg-[#DDE8FA] text-[#1E3A8A]'
                  }`}>
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'partner' ? 'Chủ quán' : 'Khách'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#FFD9E2]/60 py-2 text-xs z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <div className="font-extrabold text-[#2E1A12]">{currentUser.name}</div>
                      <div className="text-[11px] text-stone-400">{currentUser.email}</div>
                    </div>

                    {/* Role Specific Actions */}
                    {currentUser.role === 'partner' && (
                      <Link
                        to="/partner/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[#2E1A12] hover:text-[#FF5C8D] font-bold hover:bg-[#FCECEF]"
                      >
                        <Store className="w-4 h-4 text-[#FF5C8D]" />
                        <span>Dashboard Quản Lý Quán</span>
                      </Link>
                    )}

                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[#2E1A12] hover:text-[#FF5C8D] font-bold hover:bg-[#FCECEF]"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#FF5C8D]" />
                        <span>Bảng Quản Trị Hệ Thống</span>
                      </Link>
                    )}

                    <Link
                      to="/account/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-stone-700 hover:bg-cream-50"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400" />
                      <span>Đơn đặt chỗ & Lịch sử chi tiêu</span>
                    </Link>

                    <Link
                      to="/cafes?favorites=true"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                      <span>Quán yêu thích ({favorites.length})</span>
                    </Link>

                    <Link
                      to="/pricing"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 font-bold"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Gói hội viên Pro & Team</span>
                    </Link>

                    {/* 1-Click Role Switcher inside dropdown for convenience */}
                    <div className="px-4 py-2 border-t border-stone-100 text-[10px] text-stone-400 uppercase font-bold">
                      Đổi nhanh vai trò (Demo)
                    </div>
                    <button
                      onClick={() => { quickLoginAs('customer'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-1.5 text-stone-600 hover:bg-cream-50 flex items-center justify-between"
                    >
                      <span>Khách hàng</span>
                      {currentUser.role === 'customer' && <span className="text-brand-green font-bold">✓</span>}
                    </button>
                    <button
                      onClick={() => { quickLoginAs('partner'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-1.5 text-stone-600 hover:bg-cream-50 flex items-center justify-between"
                    >
                      <span>Chủ quán (POS)</span>
                      {currentUser.role === 'partner' && <span className="text-brand-green font-bold">✓</span>}
                    </button>
                    <button
                      onClick={() => { quickLoginAs('admin'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-1.5 text-stone-600 hover:bg-cream-50 flex items-center justify-between"
                    >
                      <span>Admin sàn</span>
                      {currentUser.role === 'admin' && <span className="text-brand-green font-bold">✓</span>}
                    </button>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 font-bold hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-stone-700 hover:text-brand-green px-3 py-2 rounded-full hover:bg-cream-100 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-brand-lightgreen text-brand-darkgreen hover:bg-brand-green hover:text-white px-4 py-2 rounded-full transition-all border border-brand-green/30"
                >
                  Đăng Ký Đối Tác
                </Link>
              </div>
            )}

            {/* Antix Style Pill Button */}
            <Link
              to="/cafes"
              className="inline-flex items-center gap-2 bg-brand-coral hover:bg-[#e04545] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-coral-glow transition-all transform hover:-translate-y-0.5"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Đặt chỗ</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/booking"
              className="relative p-2 text-stone-700"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute 0 right-0 bg-brand-coral text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-cream-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/98 backdrop-blur-md border-b border-[#FFD9E2] px-4 pt-3 pb-6 space-y-3 animate-fadeIn shadow-xl">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                isActive(link.path)
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                  : 'text-[#2E1A12] hover:bg-[#FFF9EE]'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {currentUser?.role === 'partner' && (
            <Link
              to="/partner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-2xl text-xs font-black bg-[#FFF9EE] text-[#FF5C8D] border border-[#FFD9E2]"
            >
              ☕ Vào Dashboard Quản Lý Quán (POS) →
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-2xl text-xs font-black bg-[#FEF0C7] text-[#B54708] border border-amber-200"
            >
              👑 Vào Bảng Quản Trị Hệ Thống (Admin) →
            </Link>
          )}

          <div className="pt-2 border-t border-stone-100 space-y-2.5">
            {currentUser ? (
              <div className="p-3 bg-[#FFF9EE] rounded-2xl border border-[#FFD9E2]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="font-extrabold text-xs text-[#2E1A12]">{currentUser.name}</div>
                      <span className="text-[10px] font-black uppercase text-[#FF5C8D] bg-white px-2 py-0.5 rounded-full border border-[#FFD9E2]">
                        {currentUser.role === 'admin' ? 'Admin sàn' : currentUser.role === 'partner' ? 'Chủ quán' : 'Khách hàng'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Đăng xuất
                  </button>
                </div>

                {/* Quick Role Switcher for Mobile */}
                <div className="pt-2 border-t border-[#FFD9E2]/60 flex items-center justify-between text-[11px] font-bold text-stone-500">
                  <span>Đổi vai trò:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { quickLoginAs('customer'); setMobileMenuOpen(false); }}
                      className={`px-2 py-0.5 rounded-lg ${currentUser.role === 'customer' ? 'bg-[#FF5C8D] text-white' : 'bg-white text-stone-600'}`}
                    >
                      Khách
                    </button>
                    <button
                      onClick={() => { quickLoginAs('partner'); setMobileMenuOpen(false); }}
                      className={`px-2 py-0.5 rounded-lg ${currentUser.role === 'partner' ? 'bg-[#FF5C8D] text-white' : 'bg-white text-stone-600'}`}
                    >
                      Chủ quán
                    </button>
                    <button
                      onClick={() => { quickLoginAs('admin'); setMobileMenuOpen(false); }}
                      className={`px-2 py-0.5 rounded-lg ${currentUser.role === 'admin' ? 'bg-[#FF5C8D] text-white' : 'bg-white text-stone-600'}`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-[#FFD9E2] text-xs font-bold text-[#2E1A12] bg-[#FFF9EE]"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white text-xs font-bold shadow-xs"
                >
                  Đăng Ký
                </Link>
              </div>
            )}

            <Link
              to="/cafes"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white font-extrabold text-xs py-3 rounded-full shadow-md"
            >
              <Coffee className="w-4 h-4" />
              <span>Khám phá & Đặt chỗ ngay</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
