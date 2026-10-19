import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Tag, Coffee } from 'lucide-react';

export const PromoBanners: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Banner: Image 1 Periwinkle Blue & White Aesthetic */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#DDE8FA] via-[#EAF1FC] to-[#D5E4F9] rounded-[36px] p-8 sm:p-12 text-[#2E1A12] relative overflow-hidden flex flex-col justify-between shadow-card border border-blue-200/80 min-h-[400px] lg:min-h-[440px]">
          
          <div className="relative z-10 max-w-sm sm:max-w-md">
            <span className="inline-block bg-[#2E1A12] text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4">
              Đặc Quyền Hội Viên FlexiPass
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#2E1A12] tracking-tight leading-tight mb-4 uppercase">
              FLEXI <span className="text-[#FF5C8D]">DELIGHT!</span>
            </h2>
            <p className="text-[#4A3830] text-sm sm:text-base leading-relaxed mb-8">
              Làm việc trọn vẹn không lo tiếng ồn hay gián đoạn. Đặt trước chỉ với 10% phí cọc giữ chỗ, thưởng thức đồ uống hảo hạng được pha chế sẵn khi bạn check-in.
            </p>
            <button
              onClick={() => navigate('/cafes')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-sm px-7 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <span>Đặt bàn ngay</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Right Floating Product Combo: Cinnamon Pastry Roll + Iced Americano (Image 1 - Enlarged) */}
          <div className="mt-8 lg:mt-0 flex justify-center lg:block lg:absolute lg:right-1 xl:right-4 lg:bottom-2 xl:bottom-4 z-10 select-none">
            <div className="relative group transform hover:scale-105 transition-transform duration-500 flex flex-col items-center">
              {/* Soft ambient white glow behind combo */}
              <div className="absolute inset-0 bg-white/60 rounded-full blur-2xl -z-10 scale-95 pointer-events-none"></div>

              {/* Underlying contact shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-[#2E1A12]/20 rounded-full blur-xl pointer-events-none transform scale-y-50"></div>

              <img
                src="/flexi-delight-combo.png"
                alt="FlexiDelight Cinnamon Roll & Iced Americano Combo"
                className="w-72 sm:w-88 md:w-96 lg:w-80 xl:w-[420px] 2xl:w-[460px] h-auto object-contain filter drop-shadow-[0_20px_32px_rgba(46,26,18,0.22)] drop-shadow-[0_36px_48px_rgba(46,26,18,0.12)] cursor-pointer"
                title="Bánh cuộn quế & Cà phê Americano đá hảo hạng"
              />
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/20 pointer-events-none blur-xl"></div>
        </div>

        {/* Right Card: Warm Vanilla Beige with Pink 20% Discount */}
        <div className="lg:col-span-5 bg-[#FFF9EE] rounded-[36px] p-8 sm:p-10 border-2 border-pink-200/80 shadow-card flex flex-col justify-between relative overflow-hidden">
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[#FF5C8D] font-extrabold text-sm">
                <Tag className="w-4 h-4" />
                <span>MÃ ƯU ĐÃI TUẦN</span>
              </div>
              
              {/* Discount badge */}
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-[#FF5C8D]">20%</span>
                <span className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  DISCOUNT
                </span>
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-[#2E1A12] mb-4">
              Món nước Signature nổi bật
            </h3>

            {/* List of 2 highlight items with thumbnail */}
            <div className="space-y-4">
              <div
                onClick={() => navigate('/cafes/the-workshop-haven')}
                className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 hover:bg-cream-100 transition-colors cursor-pointer border border-stone-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=120&q=80"
                    alt="Latte Hạnh Nhân"
                    className="w-12 h-12 rounded-xl object-cover shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-800">
                      Latte Hạnh Nhân Muối Biển
                    </h4>
                    <span className="text-[11px] text-stone-500">Nâu Coffee</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs sm:text-sm text-brand-green">58.000 đ</div>
                  <span className="text-[10px] text-brand-coral font-semibold">Tặng mã 20%</span>
                </div>
              </div>

              <div
                onClick={() => navigate('/cafes/botanica-green-hub')}
                className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 hover:bg-cream-100 transition-colors cursor-pointer border border-stone-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=120&q=80"
                    alt="Matcha Shizuoka"
                    className="w-12 h-12 rounded-xl object-cover shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-800">
                      Matcha Shizuoka Nhật Bản
                    </h4>
                    <span className="text-[11px] text-stone-500">Botanica</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs sm:text-sm text-brand-green">68.000 đ</div>
                  <span className="text-[10px] text-brand-coral font-semibold">Best-seller</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-stone-100">
            <button
              onClick={() => navigate('/cafes')}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-lightcoral hover:bg-brand-coral text-brand-coral hover:text-white font-bold text-sm py-3.5 rounded-full transition-all"
            >
              <span>Xem tất cả ưu đãi & đặt bàn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
