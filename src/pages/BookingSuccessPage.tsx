import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { formatVND, formatDateVN } from '../utils/formatters';
import { calculateBookingCountdown, BookingCountdownState } from '../utils/countdown';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  Download,
  Share2,
  Coffee,
  ShieldCheck,
  Home,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';

export const BookingSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const booking = id ? bookingService.getBookingById(id) : undefined;

  const [countdown, setCountdown] = useState<BookingCountdownState>(() =>
    booking
      ? calculateBookingCountdown(booking.date, booking.startTime, booking.createdAt)
      : calculateBookingCountdown('', '')
  );

  useEffect(() => {
    if (!booking) return;
    const timer = setInterval(() => {
      setCountdown(calculateBookingCountdown(booking.date, booking.startTime, booking.createdAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [booking?.date, booking?.startTime, booking?.createdAt]);

  useEffect(() => {
    // Fire celebratory confetti on page mount in brand palette colors
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF5C8D', '#E83D70', '#FFAEC0', '#FEF0C7', '#2E1A12']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  if (!booking) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h2 className="text-2xl font-black text-[#2E1A12] mb-2">Không tìm thấy mã đặt chỗ</h2>
        <p className="text-stone-500 mb-6">Mã đặt chỗ này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold px-7 py-3 rounded-full shadow-md transition-all"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-pink-100/50 via-[#FFF9EE]/70 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Top Success Badge */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FFF0F4] via-[#FCECEF] to-[#FFE4EC] text-[#FF5C8D] border-2 border-[#FFD9E2] flex items-center justify-center mx-auto mb-4 shadow-[0_12px_28px_rgba(255,92,141,0.22)] animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-[#FF5C8D]" />
        </div>
        <span className="font-script text-2xl text-[#FF5C8D] block mb-1">
          Hoàn tất đặt chỗ
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#2E1A12] tracking-tight">
          Đặt Chỗ Thành Công!
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-2">
          Quán cà phê đã tiếp nhận thông tin và sẵn sàng giữ bàn cho bạn.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full border border-[#FFD9E2] shadow-xs">
          <span className="text-xs text-[#8C7A70] font-bold uppercase tracking-wider">Mã đặt chỗ:</span>
          <span className="text-base font-black text-[#FF5C8D] tracking-wider">{booking.id}</span>
        </div>
      </div>

      {/* Live Countdown & Table Hold Notice Card */}
      <div className="mb-8 bg-gradient-to-r from-[#FFF9EE] via-[#FFF0F4] to-[#FFF9EE] border-2 border-[#FFD9E2] rounded-3xl p-5 sm:p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5C8D] uppercase tracking-wider mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C8D] animate-ping"></span>
              <Clock className="w-3.5 h-3.5" />
              <span>
                {countdown.status === 'expired'
                  ? 'Đã hết thời gian giữ bàn (15 phút)'
                  : countdown.status === 'upcoming'
                  ? `Sắp đến giờ check-in (${booking.startTime})`
                  : 'Đếm ngược thời gian giữ bàn (15 phút)'}
              </span>
            </div>
            <h3 className="text-xl font-black text-[#2E1A12]">
              {countdown.status === 'expired'
                ? 'Đã Quá 15 Phút – Bàn Đã Được Giải Phóng'
                : countdown.status === 'upcoming'
                ? `Giữ Chỗ 15 Phút (Tính Từ ${booking.startTime})`
                : 'Thời Gian Giữ Bàn Còn Lại'}
            </h3>
            <p className="text-xs text-stone-600 mt-1 max-w-md leading-relaxed">
              {countdown.status === 'expired'
                ? 'Đơn đặt chỗ đã quá hạn 15 phút sau giờ check-in bạn đã chọn nên hệ thống đã tự động giải phóng bàn cho khách khác.'
                : countdown.status === 'upcoming'
                ? `Quán cam kết giữ chỗ đúng 15 phút kể từ giờ check-in bạn chọn (${booking.startTime} đến trước ${countdown.holdTimeEndFormatted}). Vui lòng đưa mã check-in cho nhân viên khi đến quán.`
                : `Quán cam kết giữ chỗ đúng 15 phút sau giờ check-in (đến trước ${countdown.holdTimeEndFormatted}). Vui lòng đưa mã check-in cho nhân viên khi đến quán.`}
            </p>
          </div>

          {/* Digital Clock Boxes: 15 Phút Đếm Ngược */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <div className="flex flex-col items-center bg-white px-3.5 py-2.5 rounded-2xl border-2 border-[#FFD9E2] shadow-sm min-w-[62px]">
              <span className="text-2xl sm:text-3xl font-black text-[#FF5C8D] font-mono leading-none">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-stone-400 uppercase mt-1">Phút</span>
            </div>
            <span className="text-2xl font-black text-[#FF5C8D]">:</span>
            <div className="flex flex-col items-center bg-white px-3.5 py-2.5 rounded-2xl border-2 border-[#FFD9E2] shadow-sm min-w-[62px]">
              <span className="text-2xl sm:text-3xl font-black text-[#FF5C8D] font-mono leading-none">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-stone-400 uppercase mt-1">Giây</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-[36px] overflow-hidden border-2 border-[#FFD9E2] shadow-card mb-8">
        
        {/* Ticket Header: Dark Espresso #2E1A12 with Rose Pink and Warm Cream accents */}
        <div className="bg-gradient-to-r from-[#2E1A12] via-[#3B2218] to-[#2E1A12] p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#FFD9E2]/30 relative overflow-hidden">
          {/* Ambient soft glow on header */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5C8D]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner">
              <Coffee className="w-6 h-6 text-[#FFD9E2]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#FFD9E2] font-black">
                Vé Giữ Chỗ Điện Tử
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {booking.cafeName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <span className="bg-white/15 text-stone-100 text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/20">
              {booking.paymentMethod === 'deposit_10_percent' ? 'Đã Cọc 10%' : 'Đã Trả Trước 100%'}
            </span>
            <span className="bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs border border-white/20">
              <BookmarkCheck className="w-3.5 h-3.5" /> Đã Xác Nhận
            </span>
          </div>
        </div>

        {/* Ticket Body: Details & QR Code */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Details (8 cols) */}
          <div className="md:col-span-8 space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2]/70">
                <span className="text-[#8C7A70] block text-[10px] font-bold uppercase tracking-wider">Thời gian check-in</span>
                <span className="font-black text-sm text-[#2E1A12] mt-0.5 block">
                  Từ {booking.startTime}
                </span>
                <span className="text-[#FF5C8D] font-bold text-[11px] block mt-0.5">
                  ⏱️ Giữ bàn 15 phút (đến trước {countdown.holdTimeEndFormatted})
                </span>
                <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">
                  ✓ Không giới hạn thời gian làm việc
                </span>
                <span className="text-stone-500 font-medium text-[11px] block">{formatDateVN(booking.date)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2]/70">
                <span className="text-[#8C7A70] block text-[10px] font-bold uppercase tracking-wider">Chỗ ngồi đã chọn</span>
                <span className="font-black text-sm text-[#FF5C8D] mt-0.5 block">
                  {booking.tableName}
                </span>
                <span className="text-stone-600 font-medium text-[11px]">{booking.tableZone}</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 p-4 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2]/70">
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-[#FF5C8D] shrink-0" />
                <span className="font-medium text-[#2E1A12]">{booking.cafeAddress}</span>
              </div>
              <div className="flex justify-between text-stone-700 pt-1.5 border-t border-[#FFD9E2]/40">
                <span>Khách hàng: <strong className="text-[#2E1A12]">{booking.customerInfo.name}</strong></span>
                <span>SĐT: <strong className="text-[#2E1A12]">{booking.customerInfo.phone}</strong></span>
              </div>
            </div>

            {/* Drinks List if any */}
            {booking.cartItems && booking.cartItems.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-black text-[#8C7A70] uppercase tracking-wider mb-2">
                  Đồ uống & món đã đặt trước ({booking.cartItems.length})
                </h4>
                <div className="space-y-1.5 text-xs">
                  {booking.cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-[#FFD9E2]/40">
                      <span className="text-[#2E1A12] font-medium">{item.quantity}x {item.menuItem.name} ({item.selectedSize || 'Tiêu chuẩn'})</span>
                      <span className="font-black text-[#2E1A12]">{formatVND(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#FFD9E2] text-xs space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Tổng giá trị đơn:</span>
                <span className="font-bold text-[#2E1A12]">{formatVND(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[#FF5C8D] font-black text-sm">
                <span>Số tiền đã thanh toán ({booking.paymentGateway?.toUpperCase()}):</span>
                <span>{formatVND(booking.depositAmount)}</span>
              </div>
              {booking.remainingAtCafe > 0 && (
                <div className="flex justify-between text-[#FF6433] font-bold pt-1.5 border-t border-dashed border-[#FFD9E2]">
                  <span>Còn lại thanh toán tại quán khi check-in:</span>
                  <span>{formatVND(booking.remainingAtCafe)}</span>
                </div>
              )}
            </div>

          </div>

          {/* Right QR Code (4 cols) with Site Palette #2E1A12 & #FF5C8D */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-[#FFF9EE] rounded-3xl border border-[#FFD9E2] text-center">
            
            {/* Real SVG QR code representation */}
            <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-sm border border-[#FFD9E2] flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-[#2E1A12]">
                {/* 3 corner markers */}
                <rect x="5" y="5" width="28" height="28" fill="#2E1A12" rx="4" />
                <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="13" width="12" height="12" fill="#FF5C8D" rx="2" />

                <rect x="67" y="5" width="28" height="28" fill="#2E1A12" rx="4" />
                <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="75" y="13" width="12" height="12" fill="#FF5C8D" rx="2" />

                <rect x="5" y="67" width="28" height="28" fill="#2E1A12" rx="4" />
                <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="75" width="12" height="12" fill="#FF5C8D" rx="2" />

                {/* Decorative QR matrix pattern */}
                <rect x="40" y="8" width="6" height="6" />
                <rect x="52" y="8" width="6" height="6" />
                <rect x="40" y="20" width="6" height="6" />
                <rect x="48" y="26" width="6" height="6" />
                <rect x="8" y="42" width="6" height="6" />
                <rect x="20" y="42" width="6" height="6" />
                <rect x="14" y="52" width="6" height="6" />
                <rect x="42" y="42" width="16" height="16" fill="#FF5C8D" rx="3" />
                <rect x="45" y="45" width="10" height="10" fill="white" rx="2" />
                <rect x="47" y="47" width="6" height="6" fill="#2E1A12" />
                <rect x="65" y="42" width="6" height="6" />
                <rect x="78" y="48" width="6" height="6" />
                <rect x="88" y="42" width="6" height="6" />
                <rect x="40" y="68" width="6" height="6" />
                <rect x="52" y="74" width="6" height="6" />
                <rect x="44" y="85" width="6" height="6" />
                <rect x="68" y="68" width="6" height="6" />
                <rect x="82" y="74" width="6" height="6" />
                <rect x="74" y="86" width="6" height="6" />
                <rect x="86" y="86" width="6" height="6" />
              </svg>
            </div>

            <span className="text-[11px] font-black text-[#2E1A12] mt-3 block uppercase tracking-wider">
              MÃ CHECK-IN TẠI QUÁN
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 leading-tight block">
              Đưa mã này cho nhân viên quầy thu ngân khi bạn đến quán
            </span>
          </div>

        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FFF9EE] text-[#2E1A12] font-extrabold text-sm px-6 py-3.5 rounded-full border border-[#FFD9E2] shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#FF5C8D]" />
          <span>Tải / In Vé Đặt Chỗ</span>
        </button>

        <Link
          to="/account/bookings"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-sm px-7 py-3.5 rounded-full shadow-[0_8px_20px_rgba(255,92,141,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Xem Danh Sách Đơn Đặt Của Tôi</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFF9EE] hover:bg-[#FFF0F4] text-[#2E1A12] font-bold text-sm px-6 py-3.5 rounded-full border border-[#FFD9E2] transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#FF5C8D]" />
          <span>Về Trang Chủ</span>
        </Link>
      </div>

    </div>
  );
};
