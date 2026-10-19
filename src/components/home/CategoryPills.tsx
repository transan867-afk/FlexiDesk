import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Users2, Trees, Sparkles, Coffee } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  tag: string;
  count: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  filterValue: string;
}

export const CategoryPills: React.FC = () => {
  const navigate = useNavigate();

  const categories: CategoryItem[] = [
    {
      id: 'cat-1',
      name: 'Yên Tĩnh Tuyệt Đối',
      tag: 'Tập trung cao độ',
      count: '12 Quán',
      icon: <BookOpen className="w-7 h-7" />,
      bgColor: 'bg-amber-100/80',
      textColor: 'text-amber-700',
      filterValue: 'Rất yên tĩnh',
    },
    {
      id: 'cat-2',
      name: 'Họp Nhóm & Phòng Kín',
      tag: 'Màn hình & Bảng trắng',
      count: '8 Quán',
      icon: <Users2 className="w-7 h-7" />,
      bgColor: 'bg-emerald-100/80',
      textColor: 'text-emerald-700',
      filterValue: 'Họp nhóm & Workshop',
    },
    {
      id: 'cat-3',
      name: 'Sân Vườn Nhiệt Đới',
      tag: 'Thư giãn nhiều cây xanh',
      count: '6 Quán',
      icon: <Trees className="w-7 h-7" />,
      bgColor: 'bg-rose-100/80',
      textColor: 'text-rose-700',
      filterValue: 'Không gian sân vườn',
    },
    {
      id: 'cat-4',
      name: 'View Trên Cao Rooftop',
      tag: 'Tiếp khách & Sang trọng',
      count: '5 Quán',
      icon: <Sparkles className="w-7 h-7" />,
      bgColor: 'bg-sky-100/80',
      textColor: 'text-sky-700',
      filterValue: 'View đẹp trên cao',
    },
    {
      id: 'cat-5',
      name: 'Cà Phê Đặc Sản Pha Tay',
      tag: 'V60 & Cold Brew',
      count: '9 Quán',
      icon: <Coffee className="w-7 h-7" />,
      bgColor: 'bg-purple-100/80',
      textColor: 'text-purple-700',
      filterValue: 'Cà phê đặc sản',
    },
  ];

  const handleSelectCategory = (cat: CategoryItem) => {
    navigate(`/cafes?search=${encodeURIComponent(cat.filterValue)}`);
  };

  return (
    <section className="py-14 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
      {/* Header matching Image 1 Cinnabon Lab style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="font-script text-2xl sm:text-3xl text-[#FF5C8D] block mb-1">
            Khám phá
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2E1A12] tracking-tight">
            Không Gian Phù Hợp Cho Mọi Nhu Cầu
          </h2>
          <p className="text-stone-500 text-sm sm:text-base mt-2 max-w-xl">
            Từ bàn đơn yên tĩnh cách âm để viết code, đến phòng kính họp nhóm có màn hình trình chiếu và máy lạnh mát rượi.
          </p>
        </div>

        {/* Carousel indicator arrows matching Antix */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cafes')}
            className="w-10 h-10 rounded-full border border-[#FFD9E2] bg-white hover:bg-[#FCECEF] flex items-center justify-center text-[#8C7A70] hover:text-[#FF5C8D] transition-colors shadow-xs"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/cafes')}
            className="w-10 h-10 rounded-full border border-[#FFD9E2] bg-white hover:bg-[#FCECEF] flex items-center justify-center text-[#8C7A70] hover:text-[#FF5C8D] transition-colors shadow-xs"
            aria-label="Next categories"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Circular Category Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleSelectCategory(cat)}
            className="flex flex-col items-center text-center cursor-pointer group transition-transform duration-200 hover:-translate-y-1.5"
          >
            {/* Pastel Circle Avatar */}
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full ${cat.bgColor} ${cat.textColor} flex items-center justify-center mb-4 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md border-4 border-white`}
            >
              {cat.icon}
            </div>

            <h3 className="font-bold text-sm sm:text-base text-[#2E1A12] group-hover:text-[#FF5C8D] transition-colors">
              {cat.name}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">{cat.tag}</p>
            <span className="text-[11px] font-semibold text-[#FF5C8D] bg-[#FCECEF] border border-[#FFD9E2] px-2.5 py-0.5 rounded-full mt-2">
              {cat.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
