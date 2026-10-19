import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Coffee, Heart, CheckCircle2 } from 'lucide-react';

export const TopPosterBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#FDF2F4] text-[#2E1A12] py-8 sm:py-12 md:py-16 border-b border-pink-100">
      
      {/* Background soft ambient pastel lighting */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-pink-200/40 rounded-full blur-[140px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/2 right-10 w-[550px] h-[550px] bg-[#FEF3C7]/50 rounded-full blur-[120px] pointer-events-none -z-0"></div>

      {/* Main Container: Wide Layout with ~1.5cm margins (px-4 sm:px-8 md:px-14 lg:px-16) */}
      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
        
        {/* POSTER CARD (Image 1 Aesthetic: White, Pink, Creamy Beige with Dark Cocoa text & playful accents) */}
        <div className="relative rounded-[40px] bg-[#FFF9EE] border-2 border-pink-200/80 p-6 sm:p-10 md:p-14 shadow-[0_20px_50px_rgba(255,92,141,0.10)] overflow-hidden">
          
          {/* Subtle playful grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#FBCFE8_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-40 pointer-events-none"></div>

          {/* 1. TOP CORNER LABELS & EMBLEMS */}
          <div className="relative z-20 flex items-start justify-between border-b border-pink-200/60 pb-6 mb-4 sm:mb-6">
            
            {/* Top-Left: Mini Stacked Brand Tag matching Cinnabon Lab vibe */}
            <div className="text-left font-sans select-none">
              <span className="block text-[11px] sm:text-xs font-black tracking-widest text-[#2E1A12] uppercase leading-tight">
                FLEXIDESK
              </span>
              <span className="block text-[11px] sm:text-xs font-black tracking-widest text-[#FF5C8D] uppercase leading-tight">
                SPECIALTY COFFEE
              </span>
              <span className="block text-[10px] sm:text-[11px] font-extrabold tracking-widest text-stone-400 uppercase leading-tight">
                WORKSPACES LAB
              </span>
            </div>

            {/* Top-Center Running Header Ticker */}
            <div className="hidden md:flex items-center gap-6 text-xs font-black tracking-[0.2em] text-[#7A584A] uppercase select-none">
              <span className="text-[#FF5C8D]">★ NEW WORKSPACE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-300"></span>
              <span>FLEXIBLE SEATS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-300"></span>
              <span className="text-[#2E1A12]">NO TIME LIMIT</span>
            </div>

            {/* Top-Right: Circular 5.0 Rating Badge (Directly inspired by Image 1) */}
            <div className="flex items-center gap-3 select-none">
              <div className="text-right hidden sm:block">
                <span className="block text-[10px] font-bold text-stone-400 uppercase">Được đánh giá cao</span>
                <span className="block text-xs font-black text-[#2E1A12]">1845+ KHÁCH HÀNG</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF5C8D] to-[#FFAEC0] text-white p-1 flex flex-col items-center justify-center text-center shadow-md transform rotate-[-6deg] hover:rotate-0 transition-transform">
                <span className="text-[14px] font-black leading-none">5.0</span>
                <div className="flex text-amber-200 text-[8px] mt-0.5">★★★★★</div>
              </div>
            </div>

          </div>

          {/* 2. RETRO PINK RIBBON / TAPE ACCENT (Matching Image 1 banner tape across poster) */}
          <div className="relative z-10 -mx-6 sm:-mx-14 my-1 overflow-hidden pointer-events-none select-none">
            <div className="bg-[#FFD1DC] text-[#2E1A12] py-1.5 px-8 font-black text-[11px] sm:text-xs tracking-[0.25em] uppercase flex items-center justify-around whitespace-nowrap transform rotate-[-1deg] border-y border-pink-300 shadow-2xs">
              <span>✦ CO-WORKING COFFEE</span>
              <span>✦ SƠ ĐỒ BÀN TRỰC QUAN</span>
              <span>✦ KHÔNG GIỚI HẠN THỜI GIAN</span>
              <span>✦ 100% Ổ CẮM & WI-FI</span>
              <span>✦ CHECK-IN THEO PHÚT</span>
            </div>
          </div>

          {/* 3. CENTERSTAGE: GIANT CONDENSED DISPLAY TEXT + FLOATING TWIN SPECIALTY GLASSES (IMAGE 2) */}
          <div className="relative my-4 sm:my-8 md:my-10 pb-6 sm:pb-10 flex flex-col items-center justify-center select-none min-h-[340px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[560px] xl:min-h-[620px]">
            
            {/* Giant Stacked Poster Typography: "YOUR SPACE" (Line 1) in Cocoa Mocha & "YOUR PACE" (Line 2) in Bubblegum Pink - STRICTLY 1 LINE EACH */}
            <div className="relative z-10 w-full text-center tracking-tighter px-2">
              <div className="whitespace-nowrap text-[clamp(3rem,10.2vw,12.5rem)] font-black uppercase text-[#2E1A12] font-display drop-shadow-xs leading-[0.88]">
                YOUR SPACE
              </div>
              <div className="whitespace-nowrap text-[clamp(3rem,10.2vw,12.5rem)] font-black uppercase text-[#FF5C8D] font-display drop-shadow-sm leading-[0.88] mt-1 sm:mt-2.5">
                YOUR PACE
              </div>
            </div>

            {/* Central Floating Coffee Glass (Image 2 - Two glasses with popcorn cream toppings) */}
            <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none group">
              <div className="relative transform hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                {/* 1. Underlying soft blended radial contact & cast shadows - smoothly feathered in all directions */}
                <div 
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-14 bg-[#2E1A12]/20 rounded-full blur-2xl pointer-events-none transform scale-y-50"
                  aria-hidden="true"
                />
                <div 
                  className="absolute -bottom-2 left-[40%] -translate-x-1/2 w-[55%] h-7 bg-[#2E1A12]/25 rounded-full blur-lg pointer-events-none transform scale-y-60"
                  aria-hidden="true"
                />

                {/* 2. Specialty Glasses Image with smooth layered drop-shadows */}
                <img
                  src="/coffee-hero.png"
                  alt="FlexiDesk Specialty Popcorn & Cream Foam Coffee"
                  className="relative z-10 w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[430px] h-auto object-contain filter drop-shadow-[0_16px_24px_rgba(46,26,18,0.18)] drop-shadow-[0_30px_42px_rgba(46,26,18,0.12)]"
                />
              </div>
            </div>

            {/* Left Accent Badge: Periwinkle Card (From Image 1) - Positioned safely in bottom-left flank */}
            <div className="hidden xl:flex absolute left-2 2xl:left-6 bottom-4 z-30 bg-[#DDE8FA] p-4 rounded-3xl border border-blue-200/80 shadow-xs flex-col max-w-[200px] text-left">
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block mb-1">
                ✦ 100% TỰ DO
              </span>
              <p className="text-xs font-extrabold text-[#2E1A12] leading-snug">
                Không áp lực giờ ngồi, thoải mái chạy deadline cả ngày.
              </p>
            </div>

            {/* Right Side Callout Badge: Terracotta / Pink Callout with "CHỈ TỪ 0Đ*" - Positioned safely in bottom-right flank */}
            <div className="absolute right-1 sm:right-3 2xl:right-6 bottom-1 sm:bottom-4 z-30 flex flex-col items-end select-none">
              <div className="bg-[#FFFFFF] p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-pink-200 shadow-card flex flex-col items-center justify-center text-center">
                <span className="text-[9px] sm:text-xs font-black tracking-widest text-[#FF5C8D] uppercase block text-center">
                  TIỀN GIỜ CHỈ TỪ
                </span>
                <div className="text-3xl sm:text-6xl md:text-7xl font-black text-[#FF5C8D] font-display leading-none tracking-tight text-center my-0.5">
                  0Đ*
                </div>
                <span className="text-[8px] sm:text-[10px] text-stone-500 font-bold max-w-[110px] sm:max-w-[160px] leading-tight mt-0.5 sm:mt-1 block text-center mx-auto">
                  *Miễn phí giờ làm việc khi gọi món nước
                </span>
              </div>
            </div>

          </div>

          {/* 4. BOTTOM POSTER SECTION: CHECKERBOARD RIBBON + PUNCHY MANIFESTO + CTA */}
          <div className="relative z-20 pt-6 sm:pt-8 border-t border-pink-200/60 mt-4 sm:mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Left side: Pink/Mocha 2-row Checkerboard + Manifesto */}
            <div className="space-y-3">
              
              {/* 2-row Checkerboard accent ribbon (Matching Image 1) */}
              <div className="inline-grid grid-cols-12 gap-0.5 p-1 bg-white rounded-md border border-pink-300">
                {/* Row 1 */}
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                {/* Row 2 */}
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
                <div className="w-2.5 h-2 bg-[#2E1A12]"></div>
                <div className="w-2.5 h-2 bg-[#FF5C8D]"></div>
              </div>

              {/* Punchy 4-line Manifesto in uppercase condensed */}
              <div className="text-xs sm:text-sm font-extrabold tracking-wide uppercase leading-snug text-[#4A3830] space-y-0.5">
                <div className="text-[#FF5C8D] font-black">LÀM VIỆC THEO CÁCH CỦA BẠN!</div>
                <div>KHÔNG ÉP THỜI LƯỢNG • TỰ DO CHECK-IN THEO PHÚT</div>
                <div>SƠ ĐỒ BÀN TRỰC QUAN — CHỌN CHỖ CHUẨN GU TẠI MỖI QUÁN</div>
                <div className="text-stone-500 font-semibold">100% Ổ CẮM SẠC & WI-FI TỐC ĐỘ CAO CHO MỌI DEADLINE</div>
              </div>

            </div>

            {/* Right side: Action Button & System Handle */}
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <button
                onClick={() => navigate('/cafes')}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-black text-xs sm:text-sm px-8 py-4 rounded-full shadow-[0_12px_30px_rgba(255,92,141,0.35)] transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                <span>Xem Sơ Đồ Bàn & Đặt Chỗ Ngay</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <div className="text-left md:text-right text-[10px] text-stone-500 font-bold tracking-wider">
                <span className="text-[#FF5C8D] font-black">@FLEXIDESK.VN</span> — NỀN TẢNG CO-WORKING CAFE & ĐỒ UỐNG CHUẨN GU
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
