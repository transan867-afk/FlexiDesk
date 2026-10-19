import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useCart } from '../context/CartContext';
import { bookingService } from '../services/bookingService';
import { PaymentGateway } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  Coffee,
  Info
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cafe,
    table,
    date,
    startTime,
    customerInfo,
    paymentMethod,
    discountCode,
    discountAmount,
    drinkTotal,
    seatFee,
    totalAmount,
    depositAmount,
    remainingAtCafe,
    resetBooking,
  } = useBooking();

  const { items: cartItems, clearCart } = useCart();

  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  if (!cafe || !table) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Không tìm thấy thông tin đơn</h2>
        <p className="text-stone-500 mb-6">Vui lòng quay lại chọn quán cà phê và bàn làm việc.</p>
        <Link to="/cafes" className="bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-bold px-6 py-3 rounded-full shadow-pink-200 shadow-md transition-all">
          Xem danh sách quán
        </Link>
      </div>
    );
  }

  const paymentGateways = [
    {
      id: 'momo' as PaymentGateway,
      name: 'Ví Điện Tử MoMo',
      desc: 'Quét mã QR thanh toán nhanh qua App MoMo',
      badge: 'Phổ biến nhất',
      color: 'bg-pink-50 border-pink-200 text-pink-700',
      icon: <Smartphone className="w-5 h-5 text-pink-600" />,
    },
    {
      id: 'vietqr' as PaymentGateway,
      name: 'Chuyển Khoản Ngân Hàng (VietQR)',
      desc: 'Chuyển khoản 24/7 qua mọi ứng dụng ngân hàng',
      badge: 'Miễn phí GD',
      color: 'bg-[#FCECEF] border-[#FFD9E2] text-[#FF5C8D]',
      icon: <QrCode className="w-5 h-5 text-[#FF5C8D]" />,
    },
    {
      id: 'vnpay' as PaymentGateway,
      name: 'Cổng VNPay-QR',
      desc: 'Hỗ trợ quét QR trên 40+ ứng dụng ngân hàng',
      badge: '',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: <CreditCard className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'zalopay' as PaymentGateway,
      name: 'Ví Điện Tử ZaloPay',
      desc: 'Liên kết thanh toán ngay trong Zalo',
      badge: '',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
      icon: <Smartphone className="w-5 h-5 text-cyan-600" />,
    },
    {
      id: 'credit_card' as PaymentGateway,
      name: 'Thẻ Quốc Tế (Visa / Mastercard / JCB)',
      desc: 'Thanh toán trực tiếp bằng thẻ ghi nợ hoặc tín dụng',
      badge: '',
      color: 'bg-stone-50 border-stone-200 text-stone-700',
      icon: <CreditCard className="w-5 h-5 text-stone-600" />,
    },
  ];

  const payableNow = paymentMethod === 'deposit_10_percent' ? depositAmount : totalAmount;
  const payableLater = paymentMethod === 'deposit_10_percent' ? remainingAtCafe : 0;

  /**
   * Execute Payment Simulation
   */
  const handleExecutePayment = (shouldSucceed: boolean) => {
    setIsProcessing(true);
    setSimulationError(null);

    setTimeout(() => {
      // 1. Create booking in service
      const createdBooking = bookingService.createBooking({
        cafeId: cafe.id,
        cafeName: cafe.name,
        cafeAddress: cafe.address,
        cafeHeroImage: cafe.heroImage,
        tableId: table.id,
        tableName: table.name,
        tableType: table.type,
        tableZone: table.zone,
        floor: table.floor,
        date,
        startTime,
        customerInfo,
        cartItems,
        drinkTotal,
        seatFee,
        discountCode,
        discountAmount,
        totalAmount,
        depositAmount: payableNow,
        remainingAtCafe: payableLater,
        paymentMethod,
        paymentGateway: selectedGateway,
        bookingStatus: 'pending_payment',
        paymentStatus: 'pending',
      });

      // 2. Simulate transaction callback
      const result = bookingService.simulatePayment(
        createdBooking.id,
        shouldSucceed,
        selectedGateway,
        paymentMethod
      );

      setIsProcessing(false);

      if (result.success && result.booking) {
        // Clear active cart & active draft
        clearCart();
        resetBooking();
        // Redirect to success page
        navigate(`/booking/success/${result.booking.id}`);
      } else {
        setSimulationError(
          result.error || 'Thanh toán mô phỏng thất bại. Đơn đặt chỗ vẫn ở trạng thái chờ thanh toán.'
        );
      }
    }, 1500);
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
          <span>Quay lại thông tin đặt chỗ</span>
        </button>
      </div>

      <div className="mb-8">
        <span className="font-script text-2xl text-[#FF5C8D] block mb-1">
          Hoàn tất đặt chỗ
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2E1A12] tracking-tight">
          Cổng Thanh Toán & Xác Nhận Đơn
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Lựa chọn phương thức thanh toán và kiểm tra luồng demo giao dịch theo tiêu chuẩn MVP.
        </p>
      </div>

      {/* MVP Simulation Notice Alert */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 mb-8 text-xs sm:text-sm text-amber-900 shadow-xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-amber-950 mb-1">
            Chế Độ Mô Phỏng Giao Dịch MVP (Sandbox Environment)
          </h4>
          <p className="leading-relaxed text-amber-900">
            Đây là phiên bản demo nhằm kiểm thử toàn bộ luồng nghiệp vụ. 
            <strong> Tuyệt đối không phát sinh giao dịch tiền thật.</strong> Bạn có thể chủ động bấm <strong>"Mô Phỏng Thành Công"</strong> hoặc <strong>"Mô Phỏng Thất Bại"</strong> để kiểm tra tính nhất quán giữa trạng thái đặt chỗ (Booking Status) và trạng thái thanh toán (Payment Status).
          </p>
        </div>
      </div>

      {simulationError && (
        <div className="mb-8 bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 text-xs sm:text-sm text-rose-900 flex items-start gap-3 animate-shake">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm text-rose-950 mb-1">
              Giao dịch mô phỏng không thành công!
            </h4>
            <p className="text-rose-800">{simulationError}</p>
            <p className="text-xs text-rose-600 mt-2">
              Gợi ý: Đơn vẫn được lưu ở trạng thái <em>pending_payment</em>. Bạn có thể chọn cổng thanh toán khác hoặc thử lại với nút "Mô Phỏng Thành Công".
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Payment Gateway Selection */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFD9E2]/80 shadow-card">
            <h3 className="text-lg font-extrabold text-[#2E1A12] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FF5C8D]" />
              <span>Chọn Phương Thức Thanh Toán</span>
            </h3>

            <div className="space-y-3">
              {paymentGateways.map(gateway => (
                <div
                  key={gateway.id}
                  onClick={() => setSelectedGateway(gateway.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedGateway === gateway.id
                      ? 'border-[#FF5C8D] bg-[#FCECEF]/40 shadow-xs'
                      : 'border-stone-200 hover:border-[#FFD9E2] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#FFD9E2] flex items-center justify-center shadow-2xs">
                      {gateway.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#2E1A12]">{gateway.name}</h4>
                        {gateway.badge && (
                          <span className="text-[10px] font-extrabold bg-[#FCECEF] text-[#FF5C8D] px-2 py-0.5 rounded-full border border-[#FFD9E2]">
                            {gateway.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{gateway.desc}</p>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="paymentGateway"
                    checked={selectedGateway === gateway.id}
                    onChange={() => setSelectedGateway(gateway.id)}
                    className="text-[#FF5C8D] focus:ring-[#FF5C8D]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Simulator Action Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFD9E2] shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5C8D] animate-pulse"></span>
              <h3 className="text-lg font-extrabold text-[#2E1A12]">
                Thực Hiện Mô Phỏng Giao Dịch
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-6">
              Nhấn một trong hai nút bên dưới để quan sát hệ thống phản hồi và cập nhật dữ liệu:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Success Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleExecutePayment(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] disabled:bg-stone-300 text-white font-extrabold text-sm py-4 px-6 rounded-full shadow-pink-200 shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Mô Phỏng THÀNH CÔNG</span>
                  </>
                )}
              </button>

              {/* Failure Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleExecutePayment(false)}
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white font-extrabold text-sm py-4 px-6 rounded-full shadow-md transition-all transform hover:-translate-y-0.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Mô Phỏng THẤT BẠI</span>
                  </>
                )}
              </button>

            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-[#FF5C8D]" />
              <span>Giao dịch an toàn • Dữ liệu mã hóa lưu tại Local Storage</span>
            </div>
          </div>

        </div>

        {/* Right Column: Financial Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFD9E2]/80 shadow-card">
            <h3 className="text-lg font-extrabold text-[#2E1A12] mb-4">
              Chi Phí Đơn Đặt Chỗ
            </h3>

            {/* Quick Order Recap */}
            <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2]/70 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between font-bold text-[#2E1A12]">
                <span>Quán:</span>
                <span className="text-[#FF5C8D] truncate max-w-[170px]">{cafe.name}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Vị trí:</span>
                <span className="font-semibold text-stone-800">{table.name}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Giờ check-in:</span>
                <span className="font-semibold text-stone-800">Từ {startTime} (Không giới hạn)</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Ngày:</span>
                <span className="font-semibold text-stone-800">{formatDateVN(date)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Người đặt:</span>
                <span className="font-semibold text-stone-800">{customerInfo.name} ({customerInfo.phone})</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pb-4 border-b border-stone-100">
              <div className="flex justify-between text-stone-600">
                <span>Tổng tiền đồ uống ({cartItems.length} món):</span>
                <span className="font-semibold">{formatVND(drinkTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Phí chỗ ngồi (Không giới hạn):</span>
                <span className="font-semibold">{seatFee > 0 ? formatVND(seatFee) : '0 đ (Miễn phí)'}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-brand-coral font-bold">
                  <span>Mã ưu đãi ({discountCode}):</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-[#2E1A12] pt-2 border-t border-stone-100">
                <span>Tổng giá trị đơn:</span>
                <span className="text-[#FF5C8D] font-extrabold">{formatVND(totalAmount)}</span>
              </div>
            </div>

            {/* Highlighted payment card */}
            <div className="mt-5 p-4 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#2E1A12]">
                  {paymentMethod === 'deposit_10_percent'
                    ? 'Số tiền cần thanh toán ngay (10% cọc):'
                    : 'Số tiền cần thanh toán ngay (100%):'}
                </span>
                <span className="text-lg font-black text-[#FF5C8D]">
                  {formatVND(payableNow)}
                </span>
              </div>

              {paymentMethod === 'deposit_10_percent' && (
                <div className="flex justify-between items-center text-xs text-stone-600 pt-2 border-t border-[#FFD9E2]/60">
                  <span>Còn lại trả tại quán khi check-in:</span>
                  <span className="font-extrabold text-[#2E1A12]">{formatVND(payableLater)}</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
