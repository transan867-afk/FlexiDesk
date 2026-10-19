import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { DISTRICTS } from '../data/cafesData';
import { User, Mail, Lock, Phone, Store, MapPin, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Business partner fields
  const [cafeName, setCafeName] = useState('');
  const [cafeAddress, setCafeAddress] = useState('');
  const [district, setDistrict] = useState('Quận 1');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (role === 'partner' && !cafeName.trim()) {
      setErrorMessage('Vui lòng nhập tên quán cà phê của bạn.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      name,
      email,
      password,
      phone,
      role,
      cafeName: role === 'partner' ? cafeName : undefined,
      cafeAddress: role === 'partner' ? cafeAddress : undefined,
      district: role === 'partner' ? district : undefined,
    });
    setIsLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'partner') {
        navigate('/partner/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="py-12 max-w-xl mx-auto px-4">
      
      {/* Header */}
      <div className="text-center mb-8">
        <span className="font-script text-2xl text-brand-coral block mb-1">
          Tạo tài khoản mới
        </span>
        <h1 className="text-3xl font-extrabold text-brand-espresso tracking-tight">
          Đăng Ký Thành Viên FlexiDesk
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Trở thành khách hàng đặt chỗ hoặc đăng ký kinh doanh quán cà phê trên nền tảng
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card">
        
        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-cream-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'customer'
                ? 'bg-white text-brand-espresso shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>Khách Hàng Đặt Chỗ</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('partner')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'partner'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Chủ Quán Kinh Doanh</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Họ và tên <span className="text-brand-coral">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Lê Thị Mai"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-cream-50 border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Số điện thoại <span className="text-brand-coral">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-cream-50 border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Email đăng ký <span className="text-brand-coral">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-cream-50 border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Mật khẩu <span className="text-brand-coral">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-cream-50 border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
            </div>
          </div>

          {/* Business Specific Section if Partner */}
          {role === 'partner' && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-4 bg-brand-lightgreen/40 p-4 rounded-2xl border border-brand-green/20">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-darkgreen uppercase tracking-wider">
                <Store className="w-4 h-4 text-brand-green" />
                <span>Thông Tin Quán Cà Phê Của Bạn</span>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Tên quán cà phê <span className="text-brand-coral">*</span>
                </label>
                <input
                  type="text"
                  required={role === 'partner'}
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  placeholder="Ví dụ: Kaffeine Studio & Co-working"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Địa chỉ số nhà & tên đường
                  </label>
                  <input
                    type="text"
                    value={cafeAddress}
                    onChange={(e) => setCafeAddress(e.target.value)}
                    placeholder="Ví dụ: 88 Nguyễn Đình Chiểu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:ring-2 focus:ring-brand-green outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Khu vực quận / huyện
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm font-semibold focus:ring-2 focus:ring-brand-green outline-none"
                  >
                    {DISTRICTS.filter(d => d !== 'Tất cả khu vực').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-coral hover:bg-[#e04545] text-white font-extrabold text-sm py-3.5 rounded-full shadow-coral-glow transition-all mt-4"
          >
            <span>{isLoading ? 'Đang khởi tạo tài khoản...' : (role === 'partner' ? 'Đăng Ký Kinh Doanh Ngay' : 'Đăng Ký Tài Khoản')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-brand-green hover:underline">
            Đăng nhập tại đây
          </Link>
        </div>
      </div>

    </div>
  );
};
