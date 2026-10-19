import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Coffee, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLoginAs, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect
  const handleRedirectAfterLogin = (role: UserRole) => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'partner') {
      navigate('/partner/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      handleRedirectAfterLogin(res.user.role);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    quickLoginAs(role);
    handleRedirectAfterLogin(role);
  };

  return (
    <div className="py-14 max-w-md mx-auto px-4">
      {/* Brand logo header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5C8D] to-[#E83D70] flex items-center justify-center text-white shadow-soft">
            <svg viewBox="0 0 160 160" className="w-7 h-7 fill-white">
              <g transform="translate(-5, 14)">
                <path d="M 28 32 C 28 26.48 32.48 22 38 22 L 72 22 C 77.52 22 82 26.48 82 32 C 82 37.52 77.52 42 72 42 L 48 42 L 48 54 L 68 54 C 73.52 54 78 58.48 78 64 C 78 69.52 73.52 74 68 74 L 48 74 L 48 94 C 48 99.52 43.52 104 38 104 C 32.48 104 28 99.52 28 94 Z" />
                <path d="M 88 32 C 88 26.48 92.48 22 98 22 C 122.3 22 142 41.7 142 66 C 142 90.3 122.3 110 98 110 C 92.48 110 88 105.52 88 100 C 88 94.48 92.48 90 98 90 C 111.25 90 122 79.25 122 66 C 122 52.75 111.25 42 98 42 C 92.48 42 88 37.52 88 32 Z" />
              </g>
            </svg>
          </div>
        </Link>
        <h1 className="text-3xl font-extrabold text-brand-espresso tracking-tight">
          Đăng Nhập FlexiDesk
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Hệ thống phân quyền 3 vai trò: Khách hàng, Chủ quán và Quản trị viên
        </p>
      </div>

      {/* Quick 1-Click Demo Login Box */}
      <div className="bg-gradient-to-br from-brand-lightgreen to-emerald-50 rounded-3xl p-5 border border-brand-green/30 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-ping"></span>
          <span className="text-xs font-bold text-brand-darkgreen uppercase tracking-wider">
            Đăng Nhập Nhanh 1-Click (Demo)
          </span>
        </div>
        <p className="text-[11px] text-stone-600 mb-3.5">
          Nhấn trực tiếp vào vai trò bạn muốn trải nghiệm để tự động đăng nhập ngay:
        </p>

        <div className="grid grid-cols-1 gap-2 text-xs">
          {/* Customer */}
          <button
            type="button"
            onClick={() => handleQuickLogin('customer')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 transition-all font-semibold text-stone-800 shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="font-bold text-xs">Tài khoản Khách Hàng</div>
                <div className="text-[10px] text-stone-400">khachhang@gmail.com</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-brand-green transition-transform group-hover:translate-x-1" />
          </button>

          {/* Cafe Owner */}
          <button
            type="button"
            onClick={() => handleQuickLogin('partner')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 transition-all font-semibold text-stone-800 shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-brand-green flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="font-bold text-xs text-brand-darkgreen">Tài khoản Chủ Quán (POS & Menu)</div>
                <div className="text-[10px] text-stone-400">chuquan@theworkshophaven.vn</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-brand-green transition-transform group-hover:translate-x-1" />
          </button>

          {/* Admin */}
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 transition-all font-semibold text-stone-800 shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="font-bold text-xs text-amber-800">Tài khoản Quản Trị Viên (Admin)</div>
                <div className="text-[10px] text-stone-400">admin@flexidesk.vn</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-brand-green transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card">
        {errorMessage && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
              Email đăng nhập
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap-email@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-darkgreen text-white font-extrabold text-sm py-3.5 rounded-full shadow-md transition-all mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-brand-coral hover:underline">
            Đăng ký tài khoản mới ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
