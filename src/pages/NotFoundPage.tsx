import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-28 text-center max-w-lg mx-auto px-4">
      <span className="font-script text-3xl text-brand-coral block mb-2">
        Rất tiếc!
      </span>
      <h1 className="text-6xl font-black text-brand-espresso mb-3">404</h1>
      <h2 className="text-xl font-bold text-stone-800 mb-2">Trang Không Tồn Tại</h2>
      <p className="text-stone-500 text-sm mb-8 leading-relaxed">
        Địa chỉ bạn đang truy cập không tồn tại hoặc đã được chuyển sang đường dẫn khác.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-green text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
        <Link
          to="/cafes"
          className="inline-flex items-center gap-2 bg-cream-200 text-stone-800 font-bold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-cream-300"
        >
          <Search className="w-4 h-4" />
          <span>Tìm quán cà phê</span>
        </Link>
      </div>
    </div>
  );
};
