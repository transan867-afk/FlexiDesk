import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-white border-t border-[#FFD9E2]/80 pt-16 pb-12 mt-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
        
        {/* Antix-style Newsletter Section */}
        <div className="bg-[#FFF9EE] rounded-3xl p-8 sm:p-12 mb-16 relative overflow-hidden border border-[#FFD9E2]">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[#FF5C8D] font-bold text-sm tracking-wider uppercase mb-2 block">
              Ưu đãi & Cập nhật mới
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2E1A12] mb-3">
              Đồng hành cùng FlexiDesk mỗi ngày!
            </h3>
            <p className="text-stone-600 text-sm sm:text-base mb-6">
              Nhận ngay mã voucher giảm 20.000đ và danh sách các quán cà phê làm việc mới nhất được kiểm duyệt chất lượng Wi-Fi & độ ồn.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 bg-white text-[#FF5C8D] font-semibold py-3.5 px-6 rounded-full shadow-xs max-w-md border border-[#FFD9E2]">
                <CheckCircle className="w-5 h-5 text-[#FF5C8D]" />
                <span>Cảm ơn bạn! Chúng tôi đã gửi mã ưu đãi vào hộp thư.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  required
                  className="flex-1 px-5 py-3.5 rounded-full bg-white text-stone-800 text-sm border border-[#FFD9E2] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-bold text-sm px-6 py-3.5 rounded-full transition-all shadow-pink-200 shadow-md cursor-pointer"
                >
                  <span>Đăng ký</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Decorative background shape */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#FF5C8D]/10 pointer-events-none blur-2xl"></div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] flex items-center justify-center text-white shadow-xs">
                <svg viewBox="0 0 160 160" className="w-6 h-6 fill-white">
                  <g transform="translate(-5, 14)">
                    <path d="M 28 32 C 28 26.48 32.48 22 38 22 L 72 22 C 77.52 22 82 26.48 82 32 C 82 37.52 77.52 42 72 42 L 48 42 L 48 54 L 68 54 C 73.52 54 78 58.48 78 64 C 78 69.52 73.52 74 68 74 L 48 74 L 48 94 C 48 99.52 43.52 104 38 104 C 32.48 104 28 99.52 28 94 Z" />
                    <path d="M 88 32 C 88 26.48 92.48 22 98 22 C 122.3 22 142 41.7 142 66 C 142 90.3 122.3 110 98 110 C 92.48 110 88 105.52 88 100 C 88 94.48 92.48 90 98 90 C 111.25 90 122 79.25 122 66 C 122 52.75 111.25 42 98 42 C 92.48 42 88 37.52 88 32 Z" />
                  </g>
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#2E1A12]">
                Flexi<span className="text-[#FF5C8D]">Desk</span>
              </span>
            </Link>
            <p className="text-stone-500 text-sm leading-relaxed">
              Nền tảng kết nối người làm việc từ xa, freelancer và các nhóm sáng tạo với không gian cà phê chất lượng cao, giữ chỗ trước & order đồ uống tiện lợi.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-[#FF5C8D]" />
              <span>MVP Demo Project – Môn Khởi Nghiệp</span>
            </div>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="font-bold text-[#2E1A12] mb-4 text-sm uppercase tracking-wider">
              Khách hàng
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-600">
              <li><Link to="/cafes" className="hover:text-[#FF5C8D] transition-colors">Tìm kiếm quán cà phê</Link></li>
              <li><Link to="/cafes" className="hover:text-[#FF5C8D] transition-colors">Quán có phòng họp nhóm</Link></li>
              <li><Link to="/cafes" className="hover:text-[#FF5C8D] transition-colors">Quán yên tĩnh tuyệt đối</Link></li>
              <li><Link to="/account/bookings" className="hover:text-[#FF5C8D] transition-colors">Quản lý lịch đặt chỗ</Link></li>
              <li><Link to="/pricing" className="hover:text-[#FF5C8D] transition-colors">Gói hội viên Pro & Team</Link></li>
            </ul>
          </div>

          {/* Business / Future Portal */}
          <div>
            <h4 className="font-bold text-[#2E1A12] mb-4 text-sm uppercase tracking-wider">
              Dành Cho Quán Cà Phê
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-600">
              <li>
                <Link to="/partner/dashboard" className="text-[#2E1A12] font-semibold hover:text-[#FF5C8D] flex items-center gap-1">
                  <span>Dashboard Quản Lý & POS</span>
                  <span className="text-[10px] bg-[#FCECEF] text-[#FF5C8D] px-2 py-0.5 rounded-full font-bold">Trực tiếp</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-[#2E1A12] font-semibold hover:text-[#FF5C8D] flex items-center gap-1">
                  <span>Cổng Quản Trị Hệ Thống</span>
                  <span className="text-[10px] bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2] px-2 py-0.5 rounded-full font-bold">Admin</span>
                </Link>
              </li>
              <li><span className="text-stone-500">Quy chuẩn không gian & Wi-Fi</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[#2E1A12] mb-4 text-sm uppercase tracking-wider">
              Liên Hệ & Trợ Giúp
            </h4>
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF5C8D] shrink-0" />
                <span>Hotline: 1900 8899 (8:00 - 21:00)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF5C8D] shrink-0" />
                <span>support@flexidesk.vn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#FFD9E2] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 FlexiDesk Platform. Bản quyền thuộc dự án MVP Khởi nghiệp.</p>
          <p className="flex items-center gap-1">
            Thiết kế theo phong cách Vibe Coding với <Heart className="w-3.5 h-3.5 text-[#FF5C8D] fill-[#FF5C8D]" /> và React + Vite
          </p>
        </div>

      </div>
    </footer>
  );
};
