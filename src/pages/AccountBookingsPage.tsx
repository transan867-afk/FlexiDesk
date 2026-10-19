import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookingOrder } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';
import { calculateBookingCountdown, BookingCountdownState } from '../utils/countdown';
import { db } from '../services/databaseService';
import { bookingService } from '../services/bookingService';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Coffee,
  Sparkles,
  Receipt,
  QrCode,
  X,
  Trash2,
  BarChart3,
  Download,
  Eye,
  Timer,
  Compass,
  Check,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

/* =========================================================================
   1. LIVE COUNTDOWN BADGE (Hiển thị thời gian giữ bàn 15p thời gian thực)
   ========================================================================= */
const BookingItemCountdown: React.FC<{ date: string; startTime: string; createdAt?: string }> = ({
  date,
  startTime,
  createdAt,
}) => {
  const [cd, setCd] = useState<BookingCountdownState>(() =>
    calculateBookingCountdown(date, startTime, createdAt)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCd(calculateBookingCountdown(date, startTime, createdAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [date, startTime, createdAt]);

  if (cd.status === 'holding') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
        <Timer className="w-3.5 h-3.5" />
        <span>⚡ Đang giữ bàn: còn {cd.formatted} (đến {cd.holdTimeEndFormatted})</span>
      </span>
    );
  }

  if (cd.status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0F4] text-[#FF5C8D] border border-[#FFD9E2]">
        <Clock className="w-3.5 h-3.5 text-[#FF5C8D]" />
        <span>⏱️ Giờ hẹn: {startTime} • Giữ 15p (đến {cd.holdTimeEndFormatted})</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-[#FFF9EE] px-2.5 py-0.5 rounded-full border border-[#FFD9E2]">
      <Clock className="w-3 h-3 text-[#FF5C8D]" />
      <span>Thời gian giữ bàn: 15 phút sau giờ hẹn</span>
    </span>
  );
};

/* =========================================================================
   2. HERO CARD: ĐƠN ĐẶT HIỆN TẠI (VỊ TRÍ DỄ THẤY - HIGH VISIBILITY)
   ========================================================================= */
const CurrentActiveBookingCard: React.FC<{
  booking: BookingOrder;
  onOpenQr: (b: BookingOrder) => void;
  onReceipt: (b: BookingOrder) => void;
  onCancel: (id: string) => void;
}> = ({ booking, onOpenQr, onReceipt, onCancel }) => {
  const [cd, setCd] = useState<BookingCountdownState>(() =>
    calculateBookingCountdown(booking.date, booking.startTime, booking.createdAt)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCd(calculateBookingCountdown(booking.date, booking.startTime, booking.createdAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [booking.date, booking.startTime, booking.createdAt]);

  const cafe = db.getCafeById(booking.cafeId);
  const heroImg = cafe?.heroImage || booking.cafeHeroImage;

  return (
    <div className="bg-gradient-to-r from-[#FFF9EE] via-[#FFF0F4] to-[#FFF9EE] border-2 border-[#FFD9E2] hover:border-[#FF5C8D]/60 rounded-3xl p-6 sm:p-7 shadow-card relative overflow-hidden transition-all">
      {/* Soft Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5C8D]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#FFD9E2]/70 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Đang Hoạt Động
          </span>
          <span className="text-xs font-black text-[#FF5C8D] bg-white px-3 py-1 rounded-full border border-[#FFD9E2] shadow-2xs">
            Mã đơn: {booking.id}
          </span>
        </div>

        <div>
          {cd.status === 'holding' ? (
            <span className="bg-amber-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 animate-pulse">
              <Timer className="w-4 h-4" />
              <span>Đang trong 15 phút giữ bàn (đến trước {cd.holdTimeEndFormatted})</span>
            </span>
          ) : (
            <span className="bg-white text-[#2E1A12] border border-[#FFD9E2] text-xs font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-4 h-4 text-[#FF5C8D]" />
              <span>Sắp đến giờ check-in: <strong>{booking.startTime}</strong> (giữ đến {cd.holdTimeEndFormatted})</span>
            </span>
          )}
        </div>
      </div>

      {/* Body: Left Info, Center Details, Right Countdown & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left: Cafe Image & Identity (5 cols) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <img
            src={heroImg}
            alt={booking.cafeName}
            className="w-full sm:w-36 h-28 sm:h-32 rounded-2xl object-cover shrink-0 shadow-md border-2 border-white"
          />
          <div className="space-y-1.5 min-w-0">
            <span className="text-[11px] font-black text-[#FF5C8D] uppercase tracking-wider">
              {booking.paymentMethod === 'deposit_10_percent' ? 'Đã Cọc 10%' : 'Đã Trả Trước 100%'}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#2E1A12] tracking-tight leading-snug">
              {booking.cafeName}
            </h3>
            <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#FF5C8D] shrink-0" />
              <span>{booking.cafeAddress}</span>
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5">
              <span className="bg-white px-2.5 py-1 rounded-xl border border-[#FFD9E2] text-xs font-extrabold text-[#2E1A12]">
                🪑 {booking.tableName}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-xl border border-[#FFD9E2] text-xs font-bold text-stone-600">
                Khu: {booking.tableZone || 'Tiêu chuẩn'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Check-in Time & Drinks (3 cols) */}
        <div className="lg:col-span-3 bg-white/80 p-3.5 rounded-2xl border border-[#FFD9E2]/80 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-extrabold text-[#2E1A12]">
            <Calendar className="w-4 h-4 text-[#FF5C8D]" />
            <span>Check-in: <strong>{booking.startTime}</strong> • {formatDateVN(booking.date)}</span>
          </div>
          <div className="text-[11px] text-stone-600">
            {booking.cartItems && booking.cartItems.length > 0 ? (
              <span className="flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-[#FF6433] shrink-0" />
                <span className="truncate">{booking.cartItems.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</span>
              </span>
            ) : (
              <span className="text-stone-400 italic">Chưa kèm món nước gọi trước</span>
            )}
          </div>
          <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-500">Đã thanh toán:</span>
            <span className="font-black text-[#FF5C8D]">{formatVND(booking.depositAmount || booking.totalAmount)}</span>
          </div>
        </div>

        {/* Right: Digital 15-Min Countdown & QR Check-in CTA (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-between gap-3.5">
          {/* Digital Timer */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center bg-white px-3.5 py-2 rounded-2xl border-2 border-[#FFD9E2] shadow-xs min-w-[58px]">
              <span className="text-2xl font-black text-[#FF5C8D] font-mono leading-none">
                {String(cd.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-stone-400 uppercase mt-0.5">Phút</span>
            </div>
            <span className="text-xl font-black text-[#FF5C8D]">:</span>
            <div className="flex flex-col items-center bg-white px-3.5 py-2 rounded-2xl border-2 border-[#FFD9E2] shadow-xs min-w-[58px]">
              <span className="text-2xl font-black text-[#FF5C8D] font-mono leading-none">
                {String(cd.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold text-stone-400 uppercase mt-0.5">Giây</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 text-center lg:text-right">
            Quán giữ bàn đúng <strong>15 phút</strong> sau giờ check-in (đến trước <strong>{cd.holdTimeEndFormatted}</strong>).
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full justify-center lg:justify-end">
            <button
              onClick={() => onOpenQr(booking)}
              className="bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Mã QR Check-in</span>
            </button>

            <button
              onClick={() => onReceipt(booking)}
              className="bg-white hover:bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2] font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-2xs"
              title="Xem biên nhận"
            >
              <Receipt className="w-4 h-4" />
            </button>

            <button
              onClick={() => onCancel(booking.id)}
              className="text-stone-400 hover:text-rose-600 text-[11px] font-bold px-2 py-1 transition-colors"
            >
              Hủy bàn
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* =========================================================================
   3. MAIN COMPONENT: ACCOUNT BOOKINGS PAGE
   ========================================================================= */
export const AccountBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [countdownTick, setCountdownTick] = useState<number>(0);
  const [historyTab, setHistoryTab] = useState<'all' | 'completed' | 'expired' | 'cancelled'>('all');
  const [activeQrModalBooking, setActiveQrModalBooking] = useState<BookingOrder | null>(null);
  const [receiptModalBooking, setReceiptModalBooking] = useState<BookingOrder | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadBookings = () => {
    const list = bookingService.getAllBookings();
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();

    // 1-second live countdown ticker and real-time auto-release detection
    const timer = setInterval(() => {
      setCountdownTick(t => t + 1);
      const newlyExpired = db.checkAndAutoReleaseExpiredBookings();
      if (newlyExpired.length > 0) {
        loadBookings();
      }
    }, 1000);

    const handleUpdate = () => loadBookings();
    window.addEventListener('flexidesk_db_updated', handleUpdate);
    const unsub = db.subscribe(loadBookings);

    return () => {
      clearInterval(timer);
      window.removeEventListener('flexidesk_db_updated', handleUpdate);
      unsub();
    };
  }, []);

  const handleCancel = (bookingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn đặt chỗ này? (Chỗ ngồi sẽ được giải phóng ngay cho khách khác)')) {
      const ok = bookingService.cancelBooking(bookingId);
      if (ok) {
        setActionNotice('Đã hủy đặt chỗ thành công và giải phóng bàn về trạng thái Trống.');
        loadBookings();
        setTimeout(() => setActionNotice(null), 4000);
      }
    }
  };

  const handleDelete = (bookingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn đặt chỗ này khỏi lịch sử vĩnh viễn?')) {
      const ok = bookingService.deleteBooking(bookingId);
      if (ok) {
        setActionNotice('Đã xóa đơn đặt chỗ khỏi lịch sử thành công.');
        loadBookings();
        setTimeout(() => setActionNotice(null), 4000);
      }
    }
  };

  /* ====================== CLASSIFICATION ====================== */
  // 1. ĐƠN ĐẶT HIỆN TẠI: Đang hoạt động, chưa quá hạn 15p, chưa completed, chưa cancelled
  const activeBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.bookingStatus === 'cancelled' || b.bookingStatus === 'completed' || b.bookingStatus === 'expired') {
        return false;
      }
      const cd = calculateBookingCountdown(b.date, b.startTime, b.createdAt);
      if (cd.status === 'expired') {
        return false;
      }
      return b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending_payment';
    });
  }, [bookings, countdownTick]);

  // 2. MỤC LỊCH SỬ & THỐNG KÊ: Tự động gom toàn bộ đơn đã hết thời gian (expired), đã hoàn tất hoặc đã hủy
  const historyBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.bookingStatus === 'completed' || b.bookingStatus === 'cancelled' || b.bookingStatus === 'expired') {
        return true;
      }
      const cd = calculateBookingCountdown(b.date, b.startTime, b.createdAt);
      return cd.status === 'expired';
    });
  }, [bookings, countdownTick]);

  // Filtered list for History section
  const filteredHistoryBookings = useMemo(() => {
    return historyBookings.filter(b => {
      const cd = calculateBookingCountdown(b.date, b.startTime, b.createdAt);
      const isExpired = b.bookingStatus === 'expired' || cd.status === 'expired';

      if (historyTab === 'all') return true;
      if (historyTab === 'completed') return b.bookingStatus === 'completed';
      if (historyTab === 'expired') return isExpired && b.bookingStatus !== 'completed' && b.bookingStatus !== 'cancelled';
      if (historyTab === 'cancelled') return b.bookingStatus === 'cancelled';
      return true;
    });
  }, [historyBookings, historyTab, countdownTick]);

  /* ====================== ANALYTICS COMPUTATIONS ====================== */
  const nonCancelledBookings = useMemo(() => {
    return bookings.filter(b => b.bookingStatus !== 'cancelled');
  }, [bookings]);

  const totalSpent = useMemo(() => {
    return nonCancelledBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  }, [nonCancelledBookings]);

  const totalDrinksCount = useMemo(() => {
    return nonCancelledBookings.reduce((sum, b) => {
      const itemsCount = (b.cartItems || []).reduce((s, i) => s + i.quantity, 0);
      return sum + itemsCount;
    }, 0);
  }, [nonCancelledBookings]);

  const flexiPoints = useMemo(() => {
    return Math.floor(totalSpent / 1000); // 1.000 đ = 1 điểm
  }, [totalSpent]);

  const cafeBreakdown = useMemo(() => {
    const map = new Map<string, { cafeName: string; cafeHeroImage: string; count: number; spent: number }>();
    nonCancelledBookings.forEach(b => {
      const cafe = db.getCafeById(b.cafeId);
      const hero = cafe?.heroImage || b.cafeHeroImage;
      const existing = map.get(b.cafeId) || { cafeName: b.cafeName, cafeHeroImage: hero, count: 0, spent: 0 };
      existing.cafeHeroImage = hero;
      existing.count += 1;
      existing.spent += b.totalAmount;
      map.set(b.cafeId, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [nonCancelledBookings]);

  const expiredCount = useMemo(() => {
    return historyBookings.filter(b => {
      const cd = calculateBookingCountdown(b.date, b.startTime, b.createdAt);
      return (b.bookingStatus === 'expired' || cd.status === 'expired') && b.bookingStatus !== 'completed' && b.bookingStatus !== 'cancelled';
    }).length;
  }, [historyBookings, countdownTick]);

  const completedCount = useMemo(() => {
    return historyBookings.filter(b => b.bookingStatus === 'completed').length;
  }, [historyBookings]);

  const cancelledCount = useMemo(() => {
    return historyBookings.filter(b => b.bookingStatus === 'cancelled').length;
  }, [historyBookings]);

  return (
    <div className="py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-script text-2xl text-[#FF5C8D] block mb-1">
            Đơn hàng của tôi
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2E1A12] tracking-tight">
            Quản Lý Đơn Đặt & Lịch Sử
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Theo dõi đơn đặt bàn hiện tại, mã QR check-in và toàn bộ lịch sử chi tiêu, tích điểm FlexiPoints.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 bg-[#FFF9EE] p-2 rounded-2xl border border-[#FFD9E2] text-xs font-bold shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-[#2E1A12] text-white">
            {activeBookings.length} Đơn Hiện Tại
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white text-stone-600 border border-[#FFD9E2]">
            {historyBookings.length} Trong Lịch Sử
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-[#FCECEF] border border-[#FFD9E2] text-[#2E1A12] p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#FF5C8D]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* =========================================================================
          PHẦN 1: ĐƠN ĐẶT HIỆN TẠI (VỊ TRÍ DỄ THẤY - HIGH VISIBILITY SECTION)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl sm:text-2xl font-black text-[#2E1A12] tracking-tight flex items-center gap-2">
              <span>Đơn Đặt Chỗ Hiện Tại</span>
              <span className="text-xs bg-[#FF5C8D] text-white font-extrabold px-2.5 py-0.5 rounded-full">
                {activeBookings.length} đang diễn ra
              </span>
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Tự động đếm ngược 15 phút sau giờ check-in & bảo lưu chỗ ngồi tại quán
          </span>
        </div>

        {activeBookings.length > 0 ? (
          <div className="space-y-4">
            {activeBookings.map(b => (
              <CurrentActiveBookingCard
                key={b.id}
                booking={b}
                onOpenQr={setActiveQrModalBooking}
                onReceipt={setReceiptModalBooking}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-[#FFD9E2] text-center max-w-2xl mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F4] text-[#FF5C8D] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#2E1A12] mb-1">
              Bạn Chưa Có Đơn Đặt Bàn Nào Đang Diễn Ra
            </h3>
            <p className="text-xs text-stone-500 mb-5 max-w-md mx-auto leading-relaxed">
              Các đơn đặt đã hết thời gian giữ bàn (15 phút sau giờ check-in) hoặc đã check-in thành công đã được <strong>tự động chuyển vào mục Lịch Sử & Thống Kê</strong> bên dưới.
            </p>
            <Link
              to="/cafes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-black text-xs px-6 py-3 rounded-full shadow-md transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Khám Phá Quán Cà Phê & Đặt Bàn Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* =========================================================================
          PHẦN 2: MỤC LỊCH SỬ & THỐNG KÊ (TỰ ĐỘNG ĐẨY ĐƠN HẾT THỜI GIAN VÀO ĐÂY)
          ========================================================================= */}
      <section className="space-y-6 pt-4 border-t-2 border-[#FFD9E2]/60">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF5C8D] bg-[#FCECEF] px-3 py-1 rounded-full border border-[#FFD9E2] flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Lưu Trữ Tự Động
              </span>
              <span className="text-xs bg-[#FFF9EE] text-stone-600 font-bold px-2.5 py-1 rounded-full border border-[#FFD9E2]">
                Đơn hết hạn & hoàn tất
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2E1A12] tracking-tight">
              Mục Lịch Sử & Thống Kê Chi Tiêu
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Những đơn đặt đã hết thời gian giữ bàn (15 phút), đã hoàn tất hoặc đã hủy được tự động đẩy vào đây.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold">Tổng đơn lưu trữ:</span>
            <span className="text-base font-black text-[#FF5C8D] bg-[#FFF9EE] px-3 py-1 rounded-xl border border-[#FFD9E2]">
              {historyBookings.length} đơn
            </span>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Tổng Chi Tiêu</span>
              <div className="w-8 h-8 rounded-xl bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#FF5C8D]">
              {formatVND(totalSpent)}
            </div>
            <span className="text-[10px] text-[#FF5C8D] font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Toàn bộ lượt đặt trong hệ thống
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Lượt Sử Dụng Chỗ</span>
              <div className="w-8 h-8 rounded-xl bg-[#DDE8FA] text-[#1E3A8A] flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#2E1A12]">
              {bookings.length} lượt
            </div>
            <span className="text-[10px] text-stone-500 font-semibold mt-1 block">
              {completedCount} hoàn tất • {expiredCount} hết hạn 15p
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Món Nước Đã Dùng</span>
              <div className="w-8 h-8 rounded-xl bg-[#FEF0C7] text-[#FF6433] flex items-center justify-center font-bold">
                <Coffee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#2E1A12]">
              {totalDrinksCount} món
            </div>
            <span className="text-[10px] text-[#FF6433] font-semibold mt-1 block">
              Pha chế phục vụ tại quán
            </span>
          </div>

          <div className="bg-[#FFF9EE] p-5 rounded-3xl border border-[#FFD9E2] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#FF5C8D] uppercase tracking-wider">FlexiPoints Tích Lũy</span>
              <div className="w-8 h-8 rounded-xl bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 fill-[#FF5C8D] text-[#FF5C8D]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#FF5C8D]">
              {flexiPoints.toLocaleString('vi-VN')} điểm
            </div>
            <Link to="/pricing" className="text-[10px] text-[#FF5C8D] hover:underline font-bold mt-1 inline-flex items-center gap-1">
              Đổi ưu đãi hội viên Pro →
            </Link>
          </div>
        </div>

        {/* Top Quán Quen Thường Ghé */}
        {cafeBreakdown.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFD9E2]/80 shadow-xs">
            <h3 className="font-extrabold text-base text-[#2E1A12] mb-1 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#FF5C8D]" />
              <span>Quán Cà Phê Bạn Đã Ghé Thăm Nhiều Nhất</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">Thống kê tần suất và chi tiêu tại các không gian làm việc</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cafeBreakdown.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#FFF9EE]/60 border border-[#FFD9E2] flex items-center gap-3">
                  <img src={item.cafeHeroImage} alt={item.cafeName} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#2E1A12] truncate">{item.cafeName}</div>
                    <div className="text-[11px] text-[#FF5C8D] font-semibold mt-0.5">{item.count} lần ghé</div>
                    <div className="text-[11px] text-stone-500 font-bold">{formatVND(item.spent)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs & History Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFD9E2]/80 shadow-card space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-black text-lg text-[#2E1A12] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#FF5C8D]" />
                <span>Danh Sách Đơn Đặt Trong Lịch Sử ({historyBookings.length} đơn)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Bao gồm các đơn hoàn tất, đơn hết hạn 15 phút giữ bàn (tự động giải phóng) và đơn hủy
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
              <button
                onClick={() => setHistoryTab('all')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  historyTab === 'all'
                    ? 'bg-[#2E1A12] text-white shadow-xs'
                    : 'bg-[#FFF9EE] text-stone-600 hover:bg-[#FCECEF] border border-[#FFD9E2]'
                }`}
              >
                Tất cả ({historyBookings.length})
              </button>
              <button
                onClick={() => setHistoryTab('completed')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  historyTab === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#FFF9EE] text-stone-600 hover:bg-[#FCECEF] border border-[#FFD9E2]'
                }`}
              >
                Đã hoàn tất ({completedCount})
              </button>
              <button
                onClick={() => setHistoryTab('expired')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  historyTab === 'expired'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[#FFF9EE] text-stone-600 hover:bg-[#FCECEF] border border-[#FFD9E2]'
                }`}
              >
                Hết 15p giữ bàn ({expiredCount})
              </button>
              <button
                onClick={() => setHistoryTab('cancelled')}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  historyTab === 'cancelled'
                    ? 'bg-stone-700 text-white shadow-xs'
                    : 'bg-[#FFF9EE] text-stone-600 hover:bg-[#FCECEF] border border-[#FFD9E2]'
                }`}
              >
                Đã hủy ({cancelledCount})
              </button>
            </div>
          </div>

          {/* Mobile Card List (Visible only on mobile md:hidden) */}
          {filteredHistoryBookings.length > 0 && (
            <div className="block md:hidden space-y-3">
              {filteredHistoryBookings.map(order => {
                const cd = calculateBookingCountdown(order.date, order.startTime, order.createdAt);
                const isExpired = order.bookingStatus === 'expired' || cd.status === 'expired';

                return (
                  <div key={order.id} className="p-4 rounded-2xl bg-[#FFF9EE]/70 border border-[#FFD9E2] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#FF5C8D] font-mono">{order.id}</span>
                      {order.bookingStatus === 'completed' ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã hoàn tất</span>
                        </span>
                      ) : order.bookingStatus === 'cancelled' ? (
                        <span className="bg-stone-100 text-stone-500 border border-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Đã hủy</span>
                        </span>
                      ) : isExpired ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Hết 15p (Giải phóng)</span>
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Đã lưu trữ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#2E1A12]">{order.cafeName}</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {formatDateVN(order.date)} • <strong className="text-[#2E1A12]">{order.startTime}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#FF5C8D] block">{formatVND(order.totalAmount)}</span>
                        <span className="bg-white text-[#2E1A12] border border-[#FFD9E2] font-bold text-[10px] px-2 py-0.5 rounded-md inline-block mt-1">
                          🪑 {order.tableName}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#FFD9E2]/50 flex items-center justify-between">
                      <button
                        onClick={() => setReceiptModalBooking(order)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5C8D] hover:underline"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Xem biên nhận</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/cafe/${order.cafeId}`}
                          className="text-stone-500 hover:text-[#FF5C8D] p-1.5 rounded-lg bg-white border border-[#FFD9E2]/60 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Đặt lại</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                          title="Xóa đơn khỏi lịch sử"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop Table of History Bookings (Hidden on mobile md:block) */}
          {filteredHistoryBookings.length > 0 ? (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] font-bold">
                    <th className="pb-3 pl-2">Mã Đơn</th>
                    <th className="pb-3">Quán Cà Phê</th>
                    <th className="pb-3">Ngày & Giờ Hẹn</th>
                    <th className="pb-3">Bàn Đã Chọn</th>
                    <th className="pb-3">Trạng Thái Đơn</th>
                    <th className="pb-3 text-right">Tổng Tiền</th>
                    <th className="pb-3 text-right pr-2">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredHistoryBookings.map(order => {
                    const cd = calculateBookingCountdown(order.date, order.startTime, order.createdAt);
                    const isExpired = order.bookingStatus === 'expired' || cd.status === 'expired';

                    return (
                      <tr key={order.id} className="hover:bg-[#FFF9EE]/50 transition-colors">
                        <td className="py-3.5 pl-2 font-black text-[#FF5C8D]">
                          {order.id}
                        </td>
                        <td className="py-3.5 font-bold text-[#2E1A12] max-w-[160px] truncate">
                          {order.cafeName}
                        </td>
                        <td className="py-3.5 text-stone-600">
                          {formatDateVN(order.date)} • <strong className="text-[#2E1A12]">{order.startTime}</strong>
                        </td>
                        <td className="py-3.5">
                          <span className="bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2] font-bold px-2 py-0.5 rounded-md">
                            {order.tableName}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {order.bookingStatus === 'completed' ? (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã hoàn tất check-in</span>
                            </span>
                          ) : order.bookingStatus === 'cancelled' ? (
                            <span className="bg-stone-100 text-stone-500 border border-stone-200 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Đã hủy</span>
                            </span>
                          ) : isExpired ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Hết 15p giữ bàn (Giải phóng)</span>
                            </span>
                          ) : (
                            <span className="bg-stone-100 text-stone-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              Đã lưu trữ
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-black text-[#2E1A12]">
                          {formatVND(order.totalAmount)}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setReceiptModalBooking(order)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF5C8D] hover:underline"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Biên nhận</span>
                            </button>

                            <Link
                              to={`/cafe/${order.cafeId}`}
                              className="text-stone-500 hover:text-[#FF5C8D] p-1 rounded hover:bg-[#FCECEF]"
                              title="Đặt lại quán này"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDelete(order.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                              title="Xóa đơn khỏi lịch sử"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-stone-400 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#FFD9E2]">
              Không có đơn nào trong mục lọc này.
            </div>
          )}

        </div>

      </section>

      {/* =========================================================================
          QR CODE MODAL
          ========================================================================= */}
      {activeQrModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center relative shadow-2xl border border-[#FFD9E2]">
            <button
              onClick={() => setActiveQrModalBooking(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs text-[#FF5C8D] font-black uppercase tracking-wider block mb-1">
              Mã Check-in: {activeQrModalBooking.id}
            </span>
            <h3 className="text-lg font-black text-[#2E1A12] mb-2">
              {activeQrModalBooking.cafeName}
            </h3>

            {/* Countdown Badge in QR modal */}
            <div className="mb-3 flex justify-center">
              <BookingItemCountdown
                date={activeQrModalBooking.date}
                startTime={activeQrModalBooking.startTime}
                createdAt={activeQrModalBooking.createdAt}
              />
            </div>

            {/* QR SVG */}
            <div className="w-48 h-48 mx-auto bg-[#FFF9EE] p-3 rounded-2xl border border-[#FFD9E2] mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-stone-900">
                <rect x="5" y="5" width="28" height="28" fill="#2E1A12" rx="4" />
                <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="13" width="12" height="12" fill="#FF5C8D" rx="2" />

                <rect x="67" y="5" width="28" height="28" fill="#2E1A12" rx="4" />
                <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="75" y="13" width="12" height="12" fill="#FF5C8D" rx="2" />

                <rect x="5" y="67" width="28" height="28" fill="#2E1A12" rx="4" />
                <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="75" width="12" height="12" fill="#FF5C8D" rx="2" />

                <rect x="42" y="42" width="16" height="16" fill="#FF5C8D" rx="3" />
                <rect x="45" y="45" width="10" height="10" fill="white" rx="2" />
                <rect x="47" y="47" width="6" height="6" fill="#2E1A12" />
              </svg>
            </div>

            <div className="text-xs text-stone-600 mb-4 font-semibold">
              Bàn: {activeQrModalBooking.tableName} • Giờ check-in: {activeQrModalBooking.startTime}
            </div>

            <button
              onClick={() => setActiveQrModalBooking(null)}
              className="w-full py-3 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-bold rounded-full text-xs shadow-soft"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ELECTRONIC RECEIPT MODAL
          ========================================================================= */}
      {receiptModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 relative shadow-2xl border border-[#FFD9E2] text-xs">
            <button
              onClick={() => setReceiptModalBooking(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#FFD9E2]">
              <span className="font-extrabold text-xs text-[#FF5C8D] uppercase tracking-widest block">
                FLEXIDESK E-RECEIPT
              </span>
              <h3 className="font-extrabold text-base text-[#2E1A12] mt-1">
                {receiptModalBooking.cafeName}
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {receiptModalBooking.cafeAddress}
              </p>
              <div className="mt-2 text-[10px] text-stone-400 font-mono">
                MÃ ĐƠN: {receiptModalBooking.id} • {receiptModalBooking.createdAt ? formatDateVN(receiptModalBooking.createdAt) : formatDateVN(receiptModalBooking.date)}
              </div>
            </div>

            {/* Booking Slot Details */}
            <div className="py-3 border-b border-stone-100 space-y-1.5 text-stone-700">
              <div className="flex justify-between">
                <span>Vị trí bàn:</span>
                <span className="font-bold text-[#2E1A12]">{receiptModalBooking.tableName} ({receiptModalBooking.tableZone || 'Tiêu chuẩn'})</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian check-in:</span>
                <span className="font-bold text-[#2E1A12]">Từ {receiptModalBooking.startTime}</span>
              </div>
              <div className="flex justify-between text-[#FF5C8D] font-bold">
                <span>Thời gian giữ bàn:</span>
                <span>15 phút sau giờ check-in</span>
              </div>
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span className="font-bold text-[#2E1A12]">{receiptModalBooking.customerInfo.name} ({receiptModalBooking.customerInfo.phone})</span>
              </div>
            </div>

            {/* Ordered Drinks List */}
            <div className="py-3 border-b border-stone-100">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Chi tiết đồ uống & dịch vụ
              </div>
              {receiptModalBooking.cartItems && receiptModalBooking.cartItems.length > 0 ? (
                <div className="space-y-1.5">
                  {receiptModalBooking.cartItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-stone-800">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <span className="font-bold">{formatVND(item.menuItem.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-stone-400 italic">Không gọi đồ uống trước</div>
              )}
            </div>

            {/* Financial summary */}
            <div className="py-3 space-y-1.5 border-b border-dashed border-[#FFD9E2]">
              <div className="flex justify-between text-stone-600">
                <span>Tiền món nước:</span>
                <span>{formatVND(receiptModalBooking.drinkTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Phí chỗ ngồi:</span>
                <span>{receiptModalBooking.seatFee > 0 ? formatVND(receiptModalBooking.seatFee) : '0 đ (Miễn phí)'}</span>
              </div>
              {receiptModalBooking.discountAmount > 0 && (
                <div className="flex justify-between text-[#FF6433] font-bold">
                  <span>Khuyến mãi:</span>
                  <span>-{formatVND(receiptModalBooking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-[#2E1A12] pt-1 border-t border-stone-100">
                <span>Tổng cộng:</span>
                <span className="text-[#FF5C8D]">{formatVND(receiptModalBooking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                <span>Đã thanh toán trước:</span>
                <span className="font-bold text-[#FF5C8D]">{formatVND(receiptModalBooking.depositAmount)}</span>
              </div>
              {receiptModalBooking.remainingAtCafe > 0 && (
                <div className="flex justify-between text-[11px] text-[#FF6433] font-bold">
                  <span>Còn lại thanh toán tại quán:</span>
                  <span>{formatVND(receiptModalBooking.remainingAtCafe)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-[#FFF9EE] font-bold text-stone-700 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>In hóa đơn</span>
              </button>
              <button
                onClick={() => setReceiptModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-bold text-xs shadow-soft cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
