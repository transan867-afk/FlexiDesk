import React from 'react';
import { TopPosterBanner } from '../components/home/TopPosterBanner';
import { HeroSection } from '../components/home/HeroSection';
import { CategoryPills } from '../components/home/CategoryPills';
import { PromoBanners } from '../components/home/PromoBanners';
import { ValueProps } from '../components/home/ValueProps';
import { CafeCard } from '../components/cafe/CafeCard';
import { MOCK_CAFES } from '../data/cafesData';
import { Star, ArrowRight, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const featuredCafes = MOCK_CAFES.slice(0, 3);

  const testimonials = [
    {
      name: 'Vũ Minh Tuấn',
      role: 'Full-stack Engineer @ Tech Corp',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      comment: 'Trước đây mỗi lần cần tìm quán ngồi làm việc cả ngày rất sợ cảnh vào quán thì hết bàn có ổ cắm. Nhờ FlexiDesk mình cọc trước 10% đến là có ngay bàn Focus Silent, Wi-Fi 300Mbps ổn định tuyệt đối!',
      rating: 5,
    },
    {
      name: 'Nguyễn Lê Quỳnh Như',
      role: 'Product Designer & Freelancer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      comment: 'Giao diện cực kỳ đẹp và trực quan! Mình thích nhất tính năng xem trước độ ồn và chọn sơ đồ bàn. Nước uống tới quán là đã pha xong, không phải đứng đợi.',
      rating: 5,
    },
    {
      name: 'Trần Hoàng Long',
      role: 'Founder @ Creative Studio',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      comment: 'Nhóm mình thường xuyên đặt phòng họp kính Glass Room tại Nâu Coffee để làm việc nhóm. Có màn hình HDMI và bảng viết, tiện hơn hẳn văn phòng truyền thống.',
      rating: 5,
    },
  ];

  const communityImages = [
    '/cafes/the-workshop-haven-main.jpg',
    '/cafes/white-glass-garden.png',
    '/cafes/pudding-haus-storefront.png',
    '/cafes/twitter-beans-interior.jpg',
    '/cafes/sunlit-glasshouse.png',
  ];

  return (
    <div className="min-h-screen">
      {/* 1. Top Poster Banner - YOUR SPACE YOUR PACE */}
      <TopPosterBanner />

      {/* 2. Hero Section matching Antix style */}
      <HeroSection />

      {/* 2. Circular Category Pills */}
      <CategoryPills />

      {/* 3. Value Propositions 4-column strip */}
      <ValueProps />

      {/* 4. Featured Cafes Section */}
      <section className="py-16 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-script text-2xl text-[#FF5C8D] block mb-1">
              Điểm đến nổi bật
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2E1A12] tracking-tight">
              Quán Cà Phê Làm Việc Được Đánh Giá Cao Nhất
            </h2>
            <p className="text-stone-500 text-sm sm:text-base mt-2">
              Những không gian được cộng đồng remote worker và sinh viên yêu thích nhất tuần này
            </p>
          </div>

          <button
            onClick={() => navigate('/cafes')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF5C8D] hover:text-[#E83D70] group"
          >
            <span>Xem tất cả quán</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCafes.map(cafe => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
      </section>

      {/* 5. Promotional Split Banners */}
      <PromoBanners />

      {/* 6. Testimonials Section matching Image 1 pastel card look */}
      <section className="py-16 bg-[#FFF9EE]/70 border-y border-pink-200/60">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-script text-2xl text-[#FF5C8D] block mb-1">
              Khách hàng tin chọn
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2E1A12] tracking-tight">
              Đồng Hành Cùng 10.000+ Buổi Làm Việc
            </h2>
            <p className="text-stone-500 text-sm sm:text-base mt-2">
              Lắng nghe cảm nhận thực tế từ những người đã trải nghiệm nền tảng FlexiDesk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-[#FFD9E2]/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-700 text-sm leading-relaxed mb-6 italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover shadow-xs border-2 border-[#FF5C8D]/40"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#2E1A12]">{t.name}</h4>
                    <span className="text-[11px] text-stone-500">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Community Photo Strip */}
      <section className="py-16 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF5C8D] font-bold text-xs uppercase tracking-wider mb-1">
              <Camera className="w-4 h-4" />
              <span>@flexidesk.vn</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2E1A12]">
              Khoảnh Khắc Cùng Cộng Đồng FlexiDesk
            </h3>
          </div>
          <span className="text-stone-500 text-xs sm:text-sm">
            Tag #FlexiDesk để xuất hiện trên thư viện cộng đồng
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {communityImages.map((src, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-3xl overflow-hidden shadow-xs hover:shadow-card transition-transform hover:-translate-y-1 group"
            >
              <img
                src={src}
                alt="FlexiDesk Community"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
