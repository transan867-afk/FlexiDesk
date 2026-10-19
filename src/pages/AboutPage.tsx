import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ShieldCheck, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-script text-3xl text-[#FF5C8D] block mb-2">
          Về chúng tôi
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2E1A12] tracking-tight">
          Sứ Mệnh Của FlexiDesk
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed">
          Xóa tan nỗi lo tìm chỗ ngồi làm việc khi cần chạy deadline. Chúng tôi kết nối bạn với những quán cà phê có không gian yên tĩnh, Wi-Fi mạnh và nguồn điện dồi dào nhất.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-3xl border border-[#FFD9E2]/80 hover:border-[#FF5C8D]/40 shadow-xs hover:shadow-card transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center mb-5 font-bold shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-[#2E1A12] mb-2">Dành Cho Khách Hàng</h3>
          <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
            Xem trước không gian, đo độ ồn, kiểm tra tốc độ Wi-Fi và chọn đúng vị trí bàn mong muốn. Đặt cọc linh hoạt 10%, đến là có bàn sẵn.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#FFD9E2]/80 hover:border-[#FF5C8D]/40 shadow-xs hover:shadow-card transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF9EE] text-[#FF6433] flex items-center justify-center mb-5 font-bold shadow-2xs border border-[#FFD9E2]">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-[#2E1A12] mb-2">Dành Cho Chủ Quán</h3>
          <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
            Tối ưu công suất ghế trống trong những khung giờ thấp điểm (sáng và đầu giờ chiều). Tăng doanh thu từ dịch vụ giữ chỗ và đặt trước menu.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#FFD9E2]/80 hover:border-[#FF5C8D]/40 shadow-xs hover:shadow-card transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#DDE8FA] text-[#1E3A8A] flex items-center justify-center mb-5 font-bold shadow-2xs border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-[#2E1A12] mb-2">Kiểm Duyệt Chất Lượng</h3>
          <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
            100% quán trên nền tảng được đội ngũ FlexiDesk trực tiếp kiểm tra tốc độ cáp quang, số lượng ổ cắm điện tại bàn và ghế ngồi công thái học.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#FFF9EE] rounded-[36px] p-8 sm:p-12 border border-[#FFD9E2] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold text-[#2E1A12] mb-2">
            Sẵn Sàng Trải Nghiệm Buổi Làm Việc Mới?
          </h3>
          <p className="text-stone-600 text-sm">
            Chọn một quán cà phê phù hợp và đặt bàn giữ chỗ ngay hôm nay.
          </p>
        </div>

        <Link
          to="/cafes"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-bold text-sm px-8 py-4 rounded-full shadow-soft shrink-0 transition-transform hover:scale-105"
        >
          <span>Khám phá các quán</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
