import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useCart } from '../context/CartContext';
import { BookingSummary } from '../components/booking/BookingSummary';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { formatDateVN } from '../utils/formatters';

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cafe,
    table,
    date,
    startTime,
    customerInfo,
    updateCustomerInfo,
    validateForCheckout,
  } = useBooking();

  const [formErrors, setFormErrors] = useState<string[]>([]);

  if (!cafe || !table) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Chưa có thông tin đặt chỗ</h2>
        <p className="text-stone-500 mb-6">
          Vui lòng chọn quán cà phê và vị trí bàn làm việc trước khi xác nhận đơn.
        </p>
        <Link
          to="/cafes"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-bold px-6 py-3 rounded-full shadow-pink-200 shadow-md transition-all"
        >
          <span>Khám phá các quán ngay</span>
        </Link>
      </div>
    );
  }

  const handleProceed = () => {
    const { isValid, errors } = validateForCheckout();
    if (!isValid) {
      setFormErrors(errors);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    setFormErrors([]);
    navigate('/checkout');
  };

  return (
    <div className="py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
      
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FFD9E2] text-xs font-bold text-[#2E1A12] hover:bg-[#FCECEF] hover:text-[#FF5C8D] transition-all shadow-xs"
        >
          <ChevronLeft className="w-4 h-4 text-[#FF5C8D]" />
          <span>Quay lại chỉnh sửa chọn bàn & món nước</span>
        </button>
      </div>

      <div className="mb-8">
        <span className="font-script text-2xl text-[#FF5C8D] block mb-1">
          Kiểm tra thông tin
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2E1A12] tracking-tight">
          Xác Nhận Chi Tiết Đặt Chỗ
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Vui lòng rà soát lại thông tin thời gian, bàn ngồi và nhập thông tin liên hệ để nhận mã check-in.
        </p>
      </div>

      {formErrors.length > 0 && (
        <div className="mb-8 bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-2xl text-xs sm:text-sm">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Vui lòng hoàn thiện các thông tin sau:
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {formErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Booking Details & Customer Info Form */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Cafe & Table Review Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFD9E2]/80 shadow-card">
            <h3 className="text-lg font-extrabold text-[#2E1A12] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF5C8D]" />
              <span>1. Không Gian & Bàn Làm Việc Đã Chọn</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2]/70">
              <img
                src={cafe.heroImage}
                alt={cafe.name}
                className="w-full sm:w-36 h-28 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-1.5">
                <h4 className="font-extrabold text-base text-[#2E1A12]">{cafe.name}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5C8D] shrink-0" />
                  {cafe.address}, {cafe.district}
                </p>

                <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Vị trí bàn</span>
                    <span className="font-black text-[#FF5C8D]">{table.name} ({table.code})</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Khu vực</span>
                    <span className="font-semibold text-[#2E1A12]">{table.zone}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Sức chứa</span>
                    <span className="font-semibold text-[#2E1A12]">{table.capacity} chỗ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time slot pills */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2]/70">
                <Calendar className="w-4 h-4 text-[#FF5C8D]" />
                <div>
                  <span className="text-stone-400 block text-[10px] font-bold">Ngày sử dụng</span>
                  <span className="font-bold text-[#2E1A12]">{formatDateVN(date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2]/70">
                <Clock className="w-4 h-4 text-[#FF5C8D]" />
                <div>
                  <span className="text-stone-400 block text-[10px] font-bold">Giờ check-in</span>
                  <span className="font-bold text-[#2E1A12]">Từ {startTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FEF0C7] border border-amber-200">
                <ShieldCheck className="w-4 h-4 text-[#FF6433]" />
                <div>
                  <span className="text-[#9A3412] block text-[10px] font-bold">Thời lượng sử dụng</span>
                  <span className="font-bold text-[#9A3412]">Không giới hạn</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Input Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFD9E2]/80 shadow-card">
            <h3 className="text-lg font-extrabold text-[#2E1A12] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF5C8D]" />
              <span>2. Thông Tin Khách Hàng (Nhận Mã QR Check-in)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-1.5">
                  Họ và tên <span className="text-[#FF5C8D]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => updateCustomerInfo({ name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm text-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-1.5">
                  Số điện thoại liên hệ <span className="text-[#FF5C8D]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
                    placeholder="0901 234 567"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm text-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-1.5">
                  Email nhận vé điện tử (Tùy chọn)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => updateCustomerInfo({ email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm text-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-1.5">
                  Ghi chú cho quán cà phê
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={2}
                    value={customerInfo.notes}
                    onChange={(e) => updateCustomerInfo({ notes: e.target.value })}
                    placeholder="Ví dụ: Cần mượn cáp chuyển HDMI, hoặc chuẩn bị nước lọc thêm..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm text-[#2E1A12] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Policy & Terms Box */}
          <div className="bg-[#FFF9EE] rounded-3xl p-6 border border-[#FFD9E2] text-xs text-[#2E1A12] space-y-2">
            <h4 className="font-extrabold text-sm text-[#2E1A12] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF5C8D]" />
              Chính Sách Giữ Chỗ & Hoàn Cọc
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li><strong>Thời gian giữ chỗ:</strong> Quán sẽ giữ bàn đúng trong 15 phút sau khung giờ bạn đăng ký. Nếu đến trễ hơn, vui lòng gọi điện thoại báo trước.</li>
              <li><strong>Chính sách hủy đơn:</strong> Hủy trước 2 tiếng so với giờ bắt đầu sẽ được hoàn lại 100% số tiền đã cọc.</li>
              <li><strong>Thanh toán tại quán:</strong> 90% số tiền còn lại sẽ được thanh toán trực tiếp tại quầy thu ngân khi bạn check-in hoặc khi rời quán.</li>
            </ul>
          </div>

        </div>

        {/* Right Column: Sticky Summary & Final Step Button */}
        <div className="lg:col-span-4">
          <BookingSummary
            hideCheckoutButton={false}
            onProceedToCheckout={handleProceed}
          />
        </div>

      </div>

    </div>
  );
};
