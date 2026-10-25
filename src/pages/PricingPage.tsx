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
  ArrowLeft,
  Store,
  Award,
  BarChart3
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanModal, setSelectedPlanModal] = useState<'pro' | 'team' | 'business' | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'momo' | 'vietqr' | 'credit_card'>('vietqr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Pricing values
  const proMonthly = 79000;
  const proYearly = 759000; // 759.000 VND / năm
  const teamMonthly = 329000;
  const teamYearly = 3159000; // 3.159.000 VND / năm
  const businessMonthly = 1999000; // 1.999.000 VND / tháng
  const businessYearly = 19190000; // 19.190.000 VND / năm (ưu đãi ~20%)

  const handleOpenSubscribe = (plan: 'pro' | 'team' | 'business') => {
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
      // Upgrade user tier in AuthContext & save cafe business plan if business
      if (currentUser) {
        if (selectedPlanModal === 'business') {
          const cafeId = currentUser.cafeId || 'cafe-1';
          localStorage.setItem(`flexidesk_partner_plan_${cafeId}`, 'business');
          updateProfile({
            role: currentUser.role === 'customer' ? 'partner' : currentUser.role,
            points: (currentUser.points || 0) + 5000,
          });
        } else {
          updateProfile({
            membership: selectedPlanModal,
            points: (currentUser.points || 0) + (selectedPlanModal === 'pro' ? 200 : 1000),
          });
        }
      }
      const planName = 
        selectedPlanModal === 'pro' 
          ? 'FlexiDesk PRO' 
          : selectedPlanModal === 'team' 
            ? 'FlexiDesk TEAM' 
            : 'FlexiDesk BUSINESS (Gói Đối Tác Doanh Nghiệp)';
      setSuccessNotice(`Chúc mừng! Bạn đã kích hoạt thành công ${planName}.`);
      setSelectedPlanModal(null);
    }, 1500);
  };

  const getPlanPrice = (plan: 'pro' | 'team' | 'business') => {
    if (plan === 'pro') return billingCycle === 'monthly' ? proMonthly : proYearly;
    if (plan === 'team') return billingCycle === 'monthly' ? teamMonthly : teamYearly;
    return billingCycle === 'monthly' ? businessMonthly : businessYearly;
  };

  return (
    <div className="py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">

      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-[#FCECEF] px-4 py-1.5 rounded-full border border-[#FFD9E2] text-[#FF5C8D] text-xs font-bold mb-4 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#FF5C8D]" />
          <span>Bảng Giá & Gói Dịch Vụ FlexiDesk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#2E1A12] tracking-tight leading-[1.35] sm:leading-[1.4]">
          Nâng Tầm Trải Nghiệm Làm Việc & Đặt Chỗ
        </h1>
        <p className="mt-4 text-stone-600 text-sm sm:text-base leading-relaxed">
          Lựa chọn giải pháp phù hợp với bạn — từ cá nhân tự do, nhóm làm việc khởi nghiệp cho đến các quán cà phê đối tác quy mô lớn.
        </p>

        {/* Billing cycle switcher */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-[#FFF9EE] border border-[#FFD9E2] shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-[#2E1A12] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Thanh toán theo tháng
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
            <h4 className="font-extrabold text-sm sm:text-base text-[#FF5C8D]">Kích Hoạt Thành Công!</h4>
            <p className="text-xs text-[#2E1A12] mt-0.5">{successNotice}</p>
          </div>
        </div>
      )}

      {/* 4 Pricing Cards Grid: Side-by-Side (Cơ Bản | PRO | TEAM | BUSINESS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch max-w-[1720px] mx-auto mb-16">
        
        {/* ================= PLAN 1: FREE BASIC ================= */}
        <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Gói Tiêu Chuẩn</span>
            <h3 className="text-2xl font-black text-[#2E1A12] mt-1">Cơ Bản</h3>
            <p className="text-xs text-stone-500 mt-2 min-h-[36px]">Dành cho người dùng thỉnh thoảng tìm quán cà phê làm việc tự do.</p>
            
            <div className="my-6">
              <span className="text-3xl sm:text-4xl font-black text-stone-900">0 đ</span>
              <span className="text-xs text-stone-500 ml-1.5 font-medium">/ miễn phí trọn đời</span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-700 border-t border-stone-100 pt-5">
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
                <span className="w-4 text-center font-bold">✕</span>
                <span>Thời gian giữ chỗ tiêu chuẩn 15 phút</span>
              </li>
              <li className="flex items-start gap-2.5 text-stone-400">
                <span className="w-4 text-center font-bold">✕</span>
                <span>Không có voucher độc quyền hàng tháng</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/cafes')}
            className="w-full mt-8 py-3.5 rounded-full border-2 border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Đang Sử Dụng
          </button>
        </div>

        {/* ================= PLAN 2: PRO ================= */}
        <div className="bg-gradient-to-b from-white via-[#FFF9EE] to-[#FCECEF]/40 rounded-[32px] p-6 sm:p-7 border-3 border-[#FF5C8D] shadow-xl flex flex-col justify-between relative transform xl:-translate-y-2">
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5C8D] text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
            <Star className="w-3 h-3 fill-current" /> Phổ Biến Cho Freelancer
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5C8D]">Gói Cá Nhân Chuyên Nghiệp</span>
            <h3 className="text-2xl font-black text-[#2E1A12] mt-1 flex items-center gap-2">
              <span>Gói PRO</span>
              <span className="text-xs bg-[#FCECEF] text-[#FF5C8D] px-2 py-0.5 rounded-full font-bold border border-[#FFD9E2]">79K</span>
            </h3>
            <p className="text-xs text-stone-600 mt-2 min-h-[36px]">Dành cho freelancers, sinh viên chạy deadline và người làm việc từ xa.</p>
            
            <div className="my-6">
              <span className="text-3xl sm:text-4xl font-black text-[#FF5C8D]">
                {formatVND(billingCycle === 'monthly' ? proMonthly : proYearly)}
              </span>
              <span className="text-xs text-stone-500 ml-1.5 font-medium">
                /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-[#2E1A12] border-t border-stone-100 pt-5">
              <li className="flex items-start gap-2.5 font-bold text-[#FF5C8D]">
                <Check className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Trải nghiệm HOÀN TOÀN KHÔNG QUẢNG CÁO</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Thêm voucher giảm giá độc quyền hàng tháng</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold text-[#2E1A12]">
                <Clock className="w-4 h-4 text-[#FF6433] shrink-0 mt-0.5" />
                <span>Tăng thời gian giữ chỗ (+10 đến 15 phút khi đến trễ)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Tích điểm FlexiPoints từ mỗi lượt check-in đổi quà</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FolderHeart className="w-4 h-4 text-[#FF5C8D] shrink-0 mt-0.5" />
                <span>Lưu bộ lọc tùy biến & danh sách quán theo mục đích</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenSubscribe('pro')}
            className="w-full mt-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-extrabold text-xs shadow-pink-200 shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Nâng Cấp Gói PRO 79K</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================= PLAN 3: TEAM (TÁCH BIỆT KHỎI DOANH NGHIỆP) ================= */}
        <div className="bg-white rounded-[32px] p-6 sm:p-7 border-2 border-[#DDE8FA] shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">Gói Nhóm & Startup</span>
            <h3 className="text-2xl font-black text-[#2E1A12] mt-1 flex items-center gap-2">
              <span>Gói TEAM</span>
              <span className="text-xs bg-[#DDE8FA] text-[#1E3A8A] px-2 py-0.5 rounded-full font-bold">329K</span>
            </h3>
            <p className="text-xs text-stone-500 mt-2 min-h-[36px]">Dành cho nhóm làm việc, startup khởi nghiệp và nhóm làm đồ án.</p>
            
            <div className="my-6">
              <span className="text-3xl sm:text-4xl font-black text-[#2E1A12]">
                {formatVND(billingCycle === 'monthly' ? teamMonthly : teamYearly)}
              </span>
              <span className="text-xs text-stone-500 ml-1.5 font-medium">
                /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-700 border-t border-stone-100 pt-5">
              <li className="flex items-start gap-2.5 font-bold text-[#1E3A8A]">
                <Check className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>BAO GỒM TOÀN BỘ QUYỀN LỢI CỦA GÓI PRO</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold text-[#2E1A12]">
                <Users className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Gửi vé đặt chỗ & mã QR check-in tự động cho cả nhóm</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Nhắc lịch tự động và cập nhật thay đổi đơn hàng</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold text-[#FF5C8D]">
                <Receipt className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Hỗ trợ chia sẻ hóa đơn (Split Bill) & tách chi phí</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>Ưu tiên giữ phòng họp lớn Glass Room và bàn dài</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenSubscribe('team')}
            className="w-full mt-8 py-3.5 rounded-full bg-[#2E1A12] hover:bg-black text-white font-extrabold text-xs shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Đăng Ký Gói TEAM 329K</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ================= PLAN 4: GÓI BUSINESS (GÓI RIÊNG BIỆT 1.999.000 VNĐ) ================= */}
        <div className="bg-gradient-to-b from-[#2E1A12] via-[#351E14] to-[#1E110B] text-white rounded-[32px] p-6 sm:p-7 border-3 border-amber-400 shadow-2xl flex flex-col justify-between relative transform xl:-translate-y-2">
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3 fill-current" /> Gói Quán Đối Tác & Doanh Nghiệp
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Gói Đối Tác Doanh Nghiệp</span>
            <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              <span>Gói Business</span>
              <span className="text-xs bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full font-black">VIP</span>
            </h3>
            
            {/* User's exact prompt description */}
            <div className="text-[11px] text-amber-100/90 mt-2 font-medium bg-white/10 p-2.5 rounded-xl border border-white/10 leading-relaxed min-h-[58px]">
              ⭐ <strong>Gói Business:</strong> dành cho các quán cà phê đối tác có lượng khách đặt chỗ lớn và tần suất giao dịch ổn định (≥ 12 lượt đặt chỗ/ngày)
            </div>
            
            <div className="my-5">
              <span className="text-3xl sm:text-4xl font-black text-amber-300">
                {billingCycle === 'monthly' ? '1.999.000 đ' : formatVND(businessYearly)}
              </span>
              <span className="text-xs text-stone-300 ml-1.5 font-medium">
                /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-stone-200 border-t border-white/15 pt-5">
              <li className="flex items-start gap-2.5 font-black text-amber-300">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>0% PHÍ HOA HỒNG GIAO DỊCH (Giữ 100% doanh thu)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Tối ưu tần suất lớn & ổn định (≥ 12 lượt đặt chỗ/ngày)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Sơ đồ bàn Interactive Seat Map Không Giới Hạn & Đa Tầng</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Tự động đếm ngược 15p theo giờ check-in & Auto-Release</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Tự động chuyển trạng thái "Khách đang ngồi" khi gán bàn</span>
              </li>
              <li className="flex items-start gap-2.5 font-bold text-amber-200">
                <Award className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>Huy hiệu Đối Tác Top 1 hiển thị ưu tiên đầu trang chủ</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Hỗ trợ kỹ thuật VIP 24/7 & chuyên viên đồng hành setup</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenSubscribe('business')}
            className="w-full mt-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs shadow-amber-500/20 shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Đăng Ký Gói Business 1.999K</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Feature Comparison Table with 4 Columns */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card max-w-6xl mx-auto mb-16">
        <h3 className="text-xl font-extrabold text-stone-900 mb-6 text-center">
          Bảng So Sánh Quyền Lợi Chi Tiết Cả 4 Gói Dịch Vụ
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-200 text-stone-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-3">Tính năng & Quyền lợi</th>
                <th className="py-3 px-3 text-center">Cơ Bản (0đ)</th>
                <th className="py-3 px-3 text-center text-[#FF5C8D] font-black">Gói PRO (79k)</th>
                <th className="py-3 px-3 text-center text-[#1E3A8A] font-black">Gói TEAM (329k)</th>
                <th className="py-3 px-3 text-center text-amber-600 font-black bg-amber-50/50 rounded-t-xl">Gói Business (1.999k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3.5 px-3 font-semibold">Thời lượng sử dụng chỗ ngồi</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#FF5C8D]">Không giới hạn</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#FF5C8D]">Không giới hạn</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#FF5C8D]">Không giới hạn</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/30">Không giới hạn</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-3 font-semibold">Trải nghiệm không quảng cáo</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center text-[#FF5C8D] font-bold">✓ 100% Sạch</td>
                <td className="py-3.5 px-3 text-center text-[#FF5C8D] font-bold">✓ 100% Sạch</td>
                <td className="py-3.5 px-3 text-center text-amber-700 font-bold bg-amber-50/50">✓ 100% Sạch</td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-semibold">Thời gian giữ chỗ khi đến trễ</td>
                <td className="py-3.5 px-3 text-center">15 phút</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#FF6433]">+15 phút (Tổng 30p)</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#FF6433]">+15 phút (Tổng 30p)</td>
                <td className="py-3.5 px-3 text-center font-bold text-emerald-700 bg-amber-50/30">Auto-Release 15p</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-3 font-semibold">Tích điểm thưởng FlexiPoints</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center text-[#FF5C8D] font-bold">✓ Tích điểm đổi quà</td>
                <td className="py-3.5 px-3 text-center text-[#FF5C8D] font-bold">✓ Tích điểm x2 nhóm</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/50">✓ Tích điểm x5 VIP</td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-semibold">Gửi vé đặt chỗ & nhắc lịch cả nhóm</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#1E3A8A]">✓ Tự động hóa nhóm</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/30">✓ Đầy đủ</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-3 font-semibold">Chia sẻ hóa đơn (Split Bill)</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center font-bold text-[#1E3A8A]">✓ Hỗ trợ xuất chi phí</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/50">✓ POS Bán Hàng</td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-semibold">Phí hoa hồng giao dịch FlexiDesk</td>
                <td className="py-3.5 px-3 text-center">10% / đơn</td>
                <td className="py-3.5 px-3 text-center">10% / đơn</td>
                <td className="py-3.5 px-3 text-center">10% / đơn</td>
                <td className="py-3.5 px-3 text-center font-black text-emerald-600 bg-emerald-50/80">0% (Miễn phí trọn đời)</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-3 font-semibold">Quy mô sơ đồ bàn Interactive Seat Map</td>
                <td className="py-3.5 px-3 text-center text-stone-400">Xem sơ đồ</td>
                <td className="py-3.5 px-3 text-center text-stone-400">Xem sơ đồ</td>
                <td className="py-3.5 px-3 text-center text-stone-400">Xem sơ đồ</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/50">Đa Tầng Không Giới Hạn</td>
              </tr>
              <tr>
                <td className="py-3.5 px-3 font-semibold">Lưu lượng & Tần suất xử lý</td>
                <td className="py-3.5 px-3 text-center text-stone-400">Tiêu chuẩn</td>
                <td className="py-3.5 px-3 text-center text-stone-400">Tiêu chuẩn</td>
                <td className="py-3.5 px-3 text-center text-stone-400">Tiêu chuẩn</td>
                <td className="py-3.5 px-3 text-center font-black text-amber-700 bg-amber-50/30">≥ 12 lượt đặt chỗ/ngày</td>
              </tr>
              <tr className="bg-[#FFF9EE]/50">
                <td className="py-3.5 px-3 font-semibold">Huy hiệu Đối Tác Top 1 Trang Chủ</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center text-stone-400">✕</td>
                <td className="py-3.5 px-3 text-center font-bold text-amber-700 bg-amber-50/50">✓ Ghim Top 1</td>
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
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF5C8D] bg-[#FCECEF] px-3 py-1 rounded-full border border-[#FFD9E2]">
                Thanh Toán Nâng Cấp
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 mb-2">
              Kích Hoạt {selectedPlanModal === 'pro' ? 'Gói PRO' : selectedPlanModal === 'team' ? 'Gói TEAM' : 'Gói Business'}
            </h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              {selectedPlanModal === 'business'
                ? 'Dành cho các quán cà phê đối tác có lượng khách đặt chỗ lớn và tần suất giao dịch ổn định (≥ 12 lượt đặt chỗ/ngày).'
                : 'Bạn đang nâng cấp tài khoản của mình. Quyền lợi thành viên sẽ được mở khóa tức thì ngay khi thanh toán thành công.'}
            </p>

            {/* Price review */}
            <div className="bg-[#FFF9EE] p-4 rounded-2xl mb-5 border border-[#FFD9E2] text-xs space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Gói dịch vụ:</span>
                <span className="font-bold text-stone-900">
                  {selectedPlanModal === 'pro' 
                    ? 'FlexiDesk PRO Thành Viên' 
                    : selectedPlanModal === 'team' 
                      ? 'FlexiDesk TEAM Nhóm Làm Việc' 
                      : 'FlexiDesk BUSINESS Đối Tác Quán'}
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
                <span className="text-[#FF5C8D] text-base font-extrabold">
                  {formatVND(getPlanPrice(selectedPlanModal))}
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
                  onClick={() => setPaymentGateway('vietqr')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentGateway === 'vietqr' ? 'border-[#FF5C8D] bg-[#FCECEF] text-[#FF5C8D]' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#FF5C8D]" />
                  <span>VietQR 24/7</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('momo')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentGateway === 'momo' ? 'border-[#FF5C8D] bg-[#FCECEF] text-[#FF5C8D]' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#FF5C8D]" />
                  <span>Ví MoMo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway('credit_card')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
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
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-extrabold text-sm shadow-pink-200 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
