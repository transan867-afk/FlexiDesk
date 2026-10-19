import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, MapPin, ArrowRight, Sparkles, Heart, Zap, Tag, Coffee } from 'lucide-react';
import { DISTRICTS } from '../../data/cafesData';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('Tất cả khu vực');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [isDrinkLiked, setIsDrinkLiked] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (district !== 'Tất cả khu vực') params.set('district', district);
    if (date) params.set('date', date);
    if (startTime) params.set('startTime', startTime);
    navigate(`/cafes?${params.toString()}`);
  };

  return (
    <section className="relative pt-6 pb-20 md:pb-28 overflow-hidden">
      {/* Background organic blob shapes inspired by Antix */}
      <div className="absolute top-10 right-0 w-[550px] h-[550px] bg-pink-100/60 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-48 left-[-100px] w-[450px] h-[450px] bg-[#FFF9EE]/80 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
          
          {/* Left Column: Bold Expressive Headline & Search */}
          <div className="lg:col-span-5 2xl:col-span-4 space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-pink-200/80 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C8D] animate-ping"></span>
              <span className="text-xs font-bold text-[#FF5C8D] tracking-wide">
                Nền tảng đặt bàn & gọi món cà phê số 1
              </span>
            </div>

            {/* Antix-style Bold Three-word Stack with Comfortable Line Spacing */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-[#2E1A12] flex flex-col gap-2.5 sm:gap-3.5 leading-[1.25]">
              <span className="block">CHỖ NGỒI.</span>
              <span className="block text-[#FF5C8D]">CÀ PHÊ.</span>
              <span className="block text-[#2E1A12]">TẬP TRUNG!</span>
            </h1>

            <p className="text-stone-600 text-sm sm:text-base max-w-lg font-normal leading-relaxed">
              Khám phá và đặt trước chỗ ngồi tại các quán cà phê làm việc chuẩn gu: Wi-Fi tốc độ cao, đầy đủ ổ cắm điện, không gian yên tĩnh và menu đồ uống sẵn sàng khi bạn tới.
            </p>

            {/* Quick Action Button */}
            <div className="pt-1 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/cafes')}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-sm sm:text-base px-7 py-3.5 sm:px-8 sm:py-4 rounded-full shadow-[0_12px_28px_rgba(255,92,141,0.3)] transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                <span>Khám phá các quán ngay</span>
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>

              <div className="flex items-center gap-2 text-stone-500 text-xs sm:text-sm font-medium">
                <Sparkles className="w-4 h-4 text-brand-amber" />
                <span>Không tốn phí huỷ trước 2 giờ</span>
              </div>
            </div>

            {/* Antix-inspired Quick Search Bar Widget */}
            <div className="mt-6 bg-white p-4 sm:p-5 rounded-3xl shadow-card border border-[#FFD9E2]/80 max-w-xl">
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* District */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5C8D]" />
                    Khu vực
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs font-semibold text-[#2E1A12] bg-[#FFF9EE] border border-[#FFD9E2] rounded-xl px-2.5 py-2.5 focus:ring-1 focus:ring-[#FF5C8D] outline-none"
                  >
                    {DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#FF5C8D]" />
                    Ngày đặt
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold text-[#2E1A12] bg-[#FFF9EE] border border-[#FFD9E2] rounded-xl px-2.5 py-2.5 focus:ring-1 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>

                {/* Time Slot Check-in */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF5C8D]" />
                      Giờ check-in
                    </span>
                    <span className="text-[9px] text-[#FF5C8D] font-semibold">Tự do từng phút</span>
                  </label>
                  <input
                    type="time"
                    step="60"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs font-semibold text-[#2E1A12] bg-[#FFF9EE] border border-[#FFD9E2] rounded-xl px-2.5 py-2.5 focus:ring-1 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Tìm Quán</span>
                  </button>
                </div>

              </form>
            </div>

          </div>

          {/* Right Column: Unified Showcase Box for Promotional Drink & Recommended Cafe */}
          <div className="lg:col-span-7 2xl:col-span-8">
            <div className="relative rounded-[36px] sm:rounded-[44px] bg-white/85 backdrop-blur-md border-2 border-[#FFD9E2] p-4 sm:p-6 md:p-7 shadow-2xl shadow-[#FF5C8D]/10">
              
              {/* Header Bar of the Unified Box */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 sm:mb-5 border-b border-[#FFD9E2]/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C8D] animate-ping"></span>
                  <span className="text-xs sm:text-sm font-black text-[#2E1A12] uppercase tracking-wider">
                    Gợi Ý Hôm Nay • Nâu Coffee
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5C8D] bg-[#FFF0F4] px-3 py-1 rounded-full border border-[#FFD9E2]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ưu đãi độc quyền -20%</span>
                </div>
              </div>

              {/* Grid: 2 Items side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                
                {/* 1. Interactive Promotional Drink Card */}
                <div 
                  onClick={() => navigate('/cafes/the-workshop-haven')}
                  className="group relative rounded-3xl overflow-hidden border-2 border-[#FFD9E2] bg-gradient-to-b from-[#FFF9EE] via-white to-[#FFF0F4]/40 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:border-[#FF5C8D] transition-all duration-300 cursor-pointer"
                >
                  {/* Top Bar: Flash Sale Badge & Interactive Favorite Button */}
                  <div className="flex items-center justify-between mb-3 z-10">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF1E62] via-[#FF5C8D] to-[#E83D70] text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(255,92,141,0.4)] border border-white">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-wider">ƯU ĐÃI ĐẶT TRƯỚC</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDrinkLiked(!isDrinkLiked);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        isDrinkLiked
                          ? 'bg-[#FF5C8D] text-white shadow-md scale-110'
                          : 'bg-white/95 text-stone-400 hover:text-[#FF5C8D] border border-pink-100 hover:bg-pink-50'
                      }`}
                      title={isDrinkLiked ? 'Đã yêu thích món này' : 'Yêu thích món này'}
                    >
                      <Heart className={`w-4 h-4 transition-transform ${isDrinkLiked ? 'fill-current scale-110' : ''}`} />
                    </button>
                  </div>

                  {/* Inner Box Stage with Enlarged 3D Cutout Glass overlapping the frame */}
                  <div className="relative my-7 sm:my-8 h-36 sm:h-40 w-full rounded-[28px] bg-gradient-to-b from-[#FFF0F4] via-[#FFEBF2]/60 to-[#FFF9EE] border-2 border-pink-200/80 shadow-inner flex items-center justify-center">
                    {/* Ambient Glow behind glass */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5C8D]/25 via-[#FFAEC0]/20 to-[#FEF0C7]/40 rounded-[28px] blur-xl pointer-events-none"></div>

                    {/* Big 3D Overlapping Glass */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      {/* Soft contact ground shadow */}
                      <div className="absolute -bottom-2.5 sm:-bottom-3 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-4 bg-[#2E1A12]/30 rounded-full blur-md transform scale-y-60"></div>

                      <img
                        src="/latte-sea-salt.png"
                        alt="Latte Hạnh Nhân Muối Biển"
                        className="h-[145%] sm:h-[155%] max-h-none w-auto object-contain drop-shadow-[0_18px_30px_rgba(46,26,18,0.28)] transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 select-none"
                      />
                    </div>

                    {/* BIG BOLD EYE-CATCHING DISCOUNT STAMP (top-right overlapping box) */}
                    <div className="absolute -top-3.5 -right-2 sm:-right-3 z-20 bg-gradient-to-br from-[#FF1E62] via-[#FF5C8D] to-[#D81B60] text-white px-3 py-1.5 rounded-2xl shadow-[0_8px_20px_rgba(255,30,98,0.45)] border-2 border-white transform rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all flex flex-col items-center leading-none">
                      <span className="text-[9px] font-black tracking-wider text-pink-100 uppercase">GIẢM NGAY</span>
                      <span className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">-20%</span>
                      <span className="text-[9px] font-extrabold text-amber-200 mt-0.5">TIẾT KIỆM 12K</span>
                    </div>

                    {/* Floating Pill: Prepared upon arrival (bottom-left overlapping box) */}
                    <div className="absolute -bottom-2.5 left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-pink-100 flex items-center gap-1.5 pointer-events-none">
                      <Coffee className="w-3.5 h-3.5 text-[#FF5C8D]" />
                      <span className="text-[10px] font-bold text-[#2E1A12]">Pha sẵn khi tới</span>
                    </div>
                  </div>

                  {/* Drink Info & Prominent Pricing Display */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#2E1A12] group-hover:text-[#FF5C8D] transition-colors leading-snug">
                        Latte Hạnh Nhân Muối Biển
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        Arabica Cầu Đất, sữa hạnh nhân & bọt muối hồng
                      </p>
                    </div>

                    {/* HIGH-IMPACT PROMINENT DISCOUNT PRICING BLOCK */}
                    <div className="bg-gradient-to-r from-[#FFF0F4] to-[#FFF9EE] border-2 border-[#FFD9E2] rounded-2xl p-2.5 sm:p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400 font-bold line-through">
                            58.000đ
                          </span>
                          <span className="bg-[#FF1E62] text-white text-[10px] font-black px-1.5 py-0.2 rounded-md tracking-wide">
                            -20%
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-[#FF1E62] tracking-tight leading-none mt-1">
                          46.000đ
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block text-[10px] font-black text-[#FF1E62] bg-white px-2.5 py-1 rounded-xl border border-pink-200 shadow-xs uppercase tracking-wide">
                          🔥 Tiết kiệm 12k
                        </span>
                        <span className="block text-[10px] text-stone-500 font-semibold mt-1">
                          Khi đặt cùng bàn
                        </span>
                      </div>
                    </div>

                    {/* Action CTA Button */}
                    <div className="pt-0.5">
                      <div className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF1E62] via-[#FF5C8D] to-[#E83D70] group-hover:from-[#E83D70] group-hover:to-[#C2185B] text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl shadow-[0_8px_20px_rgba(255,92,141,0.35)] transition-all">
                        <span>Chọn ly này ưu đãi 46k</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Recommended Cafe Card (Nâu Coffee) */}
                <div 
                  onClick={() => navigate('/cafes/the-workshop-haven')}
                  className="group relative rounded-3xl overflow-hidden shadow-md border-2 border-white bg-stone-900 flex flex-col justify-between min-h-[340px] md:min-h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-pink-200"
                >
                  {/* Cafe Image as Background */}
                  <img
                    src="/cafes/the-workshop-haven-main.jpg"
                    alt="Nâu Coffee – Coffee & Workspace"
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Gradient Overlay for Top Badges & Bottom Text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none"></div>

                  {/* Top Badges Row */}
                  <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-2">
                    {/* 100% Co O Cam Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                      <Zap className="w-3 h-3 text-[#FF5C8D]" />
                      <span className="text-[11px] font-bold text-[#2E1A12]">
                        100% Có Ổ Cắm
                      </span>
                    </div>

                    {/* 4.9 Rating Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-xs font-black text-[#2E1A12]">4.9</span>
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-[10px] font-semibold text-stone-500">(500+)</span>
                    </div>
                  </div>

                  {/* Bottom Cafe Details */}
                  <div className="relative z-10 p-4 sm:p-5 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFD9E2] block">
                      Không Gian Nổi Bật
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold mt-0.5 group-hover:text-[#FFD9E2] transition-colors">
                      Nâu Coffee
                    </h3>
                    <p className="text-xs text-stone-200 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FFD9E2]" />
                      <span>Quận 1, TP. HCM • 300 Mbps Wi-Fi</span>
                    </p>

                    {/* Action Link */}
                    <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-white/90 group-hover:text-white flex items-center gap-1.5">
                        <span>Xem bàn trống & đặt chỗ</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="text-[11px] font-semibold text-[#FFD9E2] bg-white/10 px-2.5 py-0.5 rounded-full">
                        Còn 6 bàn
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
