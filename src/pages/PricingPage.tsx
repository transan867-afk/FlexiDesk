import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatVND } from '../utils/formatters';
import {
  Check,
  Zap,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Tag,
  Receipt,
  Bell,
  FolderHeart,
  QrCode,
  CreditCard,
  Smartphone,
  Star,
  CheckCircle2,
  X,
  ArrowLeft
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanModal, setSelectedPlanModal] = useState<'pro' | 'team' | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'momo' | 'vietqr' | 'credit_card'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Pricing values
  const proMonthly = 79000;
  const proYearly = Math.round(79000 * 12 * 0.8); // 20% off
  const teamMonthly = 329000;
  const teamYearly = Math.round(329000 * 12 * 0.8); // 20% off

  const handleOpenSubscribe = (plan: 'pro' | 'team') => {
    if (!currentUser) {
      navigate('/login?redirect=/pricing');
      return;
    }
    setSelectedPlanModal(plan);
  };

  const handleConfirmSubscription = () => {
    if (!selectedPlanModal) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      // Upgrade user tier in AuthContext
      if (currentUser) {
        updateProfile({
          membership: selectedPlanModal,
          points: (currentUser.points || 0) + (selectedPlanModal === 'pro' ? 200 : 1000),
        });
      }
      const planName = selectedPlanModal === 'pro' ? 'FlexiDesk PRO' : 'FlexiDesk TEAM';
      setSuccessNotice(`Chúc mừng! Bạn đã nâng cấp thành công gói ${planName}.`);
      setSelectedPlanModal(null);
    }, 1500);
  };

  return (
    <div className="py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">

      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-[#FCECEF] px-4 py-1.5 rounded-full border border-[#FFD9E2] text-[#FF5C8D] text-xs font-bold mb-4 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#FF5C8D]" />
          <span>Gói Hội Viên Độc Quyền FlexiDesk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#2E1A12] tracking-tight leading-[1.35] sm:leading-[1.4]">
          Nâng Tầm Trải Nghiệm Làm Việc & Đặt Chỗ
        </h1>
        <p className="mt-4 text-stone-600 text-sm sm:text-base leading-relaxed">
          Tiết kiệm hơn, giữ chỗ lâu hơn, không quảng cáo và nhận hàng loạt ưu đãi đồ uống độc quyền cho cá nhân và nhóm khởi nghiệp.
        </p>

        {/* Billing cycle switcher */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-[#FFF9EE] border border-[#FFD9E2] shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#2E1A12] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Thanh toán theo tháng
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Thanh toán theo năm</span>
            <span className="text-[10px] bg-[#FEF0C7] text-[#9A3412] font-extrabold px-2 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="mb-10 max-w-2xl mx-auto bg-[#FCECEF] border-2 border-[#FFD9E2] text-[#2E1A12] p-5 rounded-3xl flex items-center gap-3 shadow-md animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-[#FF5C8D] shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-[#FF5C8D]">Kích Hoạt Gói Thành Công!</h4>
            <p className="text-xs text-[#2E1A12] mt-0.5">{successNotice}</p>
          </div>
        </div>
      )}

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-16">
        
        {/* Plan 1: Free Basic */}
        <div className="bg-white rounded-[32px] p-7 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Gói Tiêu Chuẩn</span>
            <h3 className="text-2xl font-black text-[#2E1A12] mt-1">Cơ Bản</h3>
            <p className="text-xs text-stone-500 mt-2">Dành cho người dùng thỉnh thoảng tìm quán cà phê làm việc tự do.</p>
            
            <div className="my-6">
              <span className="text-4xl font-black text-stone-900">0 đ</span>
              <span className="text-xs text-stone-500 ml-1.5 font-medium">/ miễn phí trọn đời</span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-700">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Đặt chỗ trước không giới hạn giờ ngồi</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Xem Interactive Seat Map sơ đồ bàn thực tế</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Đặt cọc linh hoạt 10% giữ chỗ</span>
              </li>
              <li className="flex items-start gap-2.5 text-stone-400">
                <span className="w-4 text-center">✕</span>
                <span>Thời gian giữ chỗ tiêu chuẩn 15 phút</span>
              </li>
              <li className="flex items-start gap-2.5 text-stone-400">
                <span className="w-4 text-center">✕</span>
                <span>Không có voucher độc quyền hàng tháng</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/cafes')}
            className="w-full mt-8 py-3.5 rounded-full border-2 border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
          >
            Đang Sử Dụng
          </button>
        </div>

        {/* Plan 2: PRO (Highlight) */}
        <div className="bg-gradient-to-b from-white via-[#FFF9EE] to-[#FCECEF]/40 rounded-[36px] p-7 sm:p-8 border-3 border-[#FF5C8D] shadow-xl flex flex-col justify-between relative transform lg:-translate-y-2">
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF5C8D] text-white font-black text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-current" /> Phổ Biến Nhất Cho Freelancer
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5C8D]">Gói Cá Nhân Chuyên Nghiệp</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2E1A12] mt-1 flex items-center gap-2">
              <span>Gói PRO</span>
              <span className="text-xs bg-[#FCECEF] text-[#FF5C8D] px-2.5 py-0.5 rounded-full font-bold border border-[#FFD9E2]">79K</span>
            </h3>
            <p className="text-xs text-stone-600 mt-2">Dành cho freelancers, sinh viên chạy deadline và người làm việc từ xa.</p>
            
            <div className="my-6">
              <span className="text-4xl sm:text-5xl font-black text-[#FF5C8D]">
                {formatVND(billingCycle === 'monthly' ? proMonthly : proYearly)}
              </span>
              <span className="text-xs text-stone-500 ml-1.5 font-medium">
                /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-[#2E1A12]">
              <li className="flex items-start gap-2.5 font-bold text-[#FF5C8D]">
                <Check className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Trải nghiệm HOÀN TOÀN KHÔNG QUẢNG CÁO</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Thêm voucher giảm giá độc quyền hàng tháng (20k - 50k)</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold text-[#2E1A12]">
                <Clock className="w-4 h-4 text-[#FF6433] shrink-0 mt-0.5" />
                <span>Tăng thời gian giữ chỗ (+10 đến 15 phút khi đến trễ)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Tích điểm FlexiPoints từ mỗi lượt check-in để đổi quà & đồ uống</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FolderHeart className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Lưu bộ lọc tùy biến & tạo danh sách quán theo mục đích: Học bài, Chạy deadline, Họp nhóm, Chill...</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenSubscribe('pro')}
            className="w-full mt-8 py-4 rounded-full bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-extrabold text-xs sm:text-sm shadow-pink-200 shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Nâng Cấp Gói PRO 79K Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Plan 3: TEAM */}
        <div className="bg-white rounded-[32px] p-7 sm:p-8 border-2 border-[#DDE8FA] shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">Gói Nhóm & Doanh Nghiệp Nhỏ</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2E1A12] mt-1 flex items-center gap-2">
              <span>Gói TEAM</span>
              <span className="text-xs bg-[#DDE8FA] text-[#1E3A8A] px-2.5 py-0.5 rounded-full font-bold">329K</span>
            </h3>
            <p className="text-xs text-stone-500 mt-2">Dành cho nhóm làm việc, startup khởi nghiệp và nhóm làm đồ án.</p>
            
            <div className="my-6">
              <span className="text-4xl font-black text-[#2E1A12]">
                {formatVND(billingCycle === 'monthly' ? teamMonthly : teamYearly)}
              </span>
              <span className="text-xs text-stone-500 ml-1.5 font-medium">
                /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-700">
              <li className="flex items-start gap-2.5 font-bold text-[#1E3A8A]">
                <Check className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>BAO GỒM TOÀN BỘ QUYỀN LỢI CỦA GÓI PRO</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold text-[#2E1A12]">
                <Users className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Gửi thông tin đặt chỗ & mã QR check-in tự động cho cả nhóm</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Nhắc lịch tự động và cập nhật thay đổi đơn hàng cho từng thành viên</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold text-[#FF5C8D]">
                <Receipt className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Hỗ trợ chia sẻ hóa đơn (Split Bill) & ghi nhận chi phí riêng của từng người</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Ưu tiên giữ phòng họp lớn Glass Room và bàn dài thảo luận</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenSubscribe('team')}
            className="w-full mt-8 py-4 rounded-full bg-[#2E1A12] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Đăng Ký Gói TEAM 329K</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card max-w-5xl mx-auto mb-16">
        <h3 className="text-xl font-extrabold text-stone-900 mb-6 text-center">
          Bảng So Sánh Quyền Lợi Chi Tiết
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-200 text-stone-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Tính năng & Quyền lợi</th>
                <th className="py-3 px-4 text-center">Cơ Bản (0đ)</th>
                <th className="py-3 px-4 text-center text-brand-darkgreen font-black">Gói PRO (79k)</th>
                <th className="py-3 px-4 text-center text-purple-800 font-black">Gói TEAM (329k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3.5 px-4 font-semibold">Thời lượng sử dụng chỗ ngồi</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FF5C8D]">Không giới hạn</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FF5C8D]">Không giới hạn</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FF5C8D]">Không giới hạn</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-4 font-semibold">Trải nghiệm không quảng cáo</td>
                <td className="py-3.5 px-4 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-4 text-center text-[#FF5C8D] font-bold">✓ 100% Sạch</td>
                <td className="py-3.5 px-4 text-center text-[#FF5C8D] font-bold">✓ 100% Sạch</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold">Thời gian gia hạn giữ chỗ khi đến trễ</td>
                <td className="py-3.5 px-4 text-center">15 phút</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FF6433]">+15 phút (Tổng 30p)</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FF6433]">+15 phút (Tổng 30p)</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-4 font-semibold">Tích điểm thưởng FlexiPoints</td>
                <td className="py-3.5 px-4 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-4 text-center text-[#FF5C8D] font-bold">✓ Tích điểm đổi quà</td>
                <td className="py-3.5 px-4 text-center text-[#FF5C8D] font-bold">✓ Tích điểm x2 cho nhóm</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold">Lưu bộ lọc & tạo danh sách theo mục đích</td>
                <td className="py-3.5 px-4 text-center text-stone-400">Tối đa 1</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FF5C8D]">✓ Không giới hạn</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FF5C8D]">✓ Không giới hạn</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-4 font-semibold">Gửi vé đặt chỗ & nhắc lịch cả nhóm</td>
                <td className="py-3.5 px-4 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-4 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#1E3A8A]">✓ Tự động hóa nhóm</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold">Chia sẻ hóa đơn & ghi nhận chi phí (Split Bill)</td>
                <td className="py-3.5 px-4 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-4 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#1E3A8A]">✓ Hỗ trợ xuất chi phí</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Checkout Simulation Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#FFD9E2] relative animate-scale-up">
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFF9EE] hover:bg-[#FCECEF] text-stone-500 hover:text-[#2E1A12] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center font-black text-xl border border-[#FFD9E2]">
                {selectedPlanModal === 'pro' ? '★' : '👥'}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#2E1A12]">
                  Xác Nhận Đăng Ký {selectedPlanModal === 'pro' ? 'Gói PRO (79.000đ)' : 'Gói TEAM (329.000đ)'}
                </h3>
                <p className="text-xs text-stone-500">
                  {billingCycle === 'monthly' ? 'Chu kỳ thanh toán: Hàng tháng' : 'Chu kỳ thanh toán: Hàng năm (-20%)'}
                </p>
              </div>
            </div>

            {/* Price review */}
            <div className="bg-cream-50 p-4 rounded-2xl mb-5 border border-stone-100 text-xs space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Gói dịch vụ:</span>
                <span className="font-bold text-stone-900">
                  {selectedPlanModal === 'pro' ? 'FlexiDesk PRO Thành Viên' : 'FlexiDesk TEAM Nhóm Làm Việc'}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Thời hạn kích hoạt:</span>
                <span className="font-semibold text-stone-800">
                  {billingCycle === 'monthly' ? '30 ngày (Gia hạn tự động)' : '365 ngày (1 năm)'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Số tiền thanh toán:</span>
                <span className="text-brand-coral text-base font-extrabold">
                  {formatVND(selectedPlanModal === 'pro' ? (billingCycle === 'monthly' ? proMonthly : proYearly) : (billingCycle === 'monthly' ? teamMonthly : teamYearly))}
                </span>
              </div>
            </div>

            {/* Gateway selection */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentGateway('momo')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentGateway === 'momo' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-pink-600" />
                  <span>Ví MoMo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('vietqr')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentGateway === 'vietqr' ? 'border-[#FF5C8D] bg-[#FCECEF] text-[#FF5C8D]' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#FF5C8D]" />
                  <span>VietQR 24/7</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('credit_card')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentGateway === 'credit_card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Thẻ ATM / Visa</span>
                </button>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleConfirmSubscription}
              disabled={isProcessing}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-extrabold text-sm shadow-pink-200 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Đang xử lý giao dịch...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Xác Nhận & Kích Hoạt Gói Ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
