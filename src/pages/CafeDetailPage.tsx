import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cafeService } from '../services/cafeService';
import { db } from '../services/databaseService';
import { Cafe, MenuItem, TableSeat } from '../types';
import { TimeSlotPicker } from '../components/booking/TimeSlotPicker';
import { InteractiveSeatMap } from '../components/cafe/InteractiveSeatMap';
import { MenuItemCard } from '../components/cafe/MenuItemCard';
import { BookingSummary } from '../components/booking/BookingSummary';
import { useBooking } from '../context/BookingContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  Star,
  MapPin,
  Clock,
  Wifi,
  Volume2,
  Zap,
  Sun,
  ShieldCheck,
  ChevronRight,
  Share2,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Coffee,
  Sparkles
} from 'lucide-react';
import { formatVND } from '../utils/formatters';

export const CafeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    cafe: selectedCafe,
    table: selectedTable,
    totalAmount,
    depositAmount,
    paymentMethod,
    setCafe,
    selectTable,
  } = useBooking();
  const { items: cartItems, setCafeContext } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [cafe, setLocalCafe] = useState<Cafe | null>(null);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>('all');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [tableNotice, setTableNotice] = useState<string | null>(null);
  const tableSectionRef = useRef<HTMLDivElement>(null);
  const menuSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncData = () => {
      if (id) {
        const found = cafeService.getCafeById(id);
        if (found) {
          setLocalCafe(found);
          setCafe(found);
          setCafeContext(found.id, found.name);
        }
      }
    };

    syncData();

    // Listen to real-time database table status changes & auto-releases
    const unsubscribe = db.subscribe(syncData);
    const handleEvent = () => syncData();
    window.addEventListener('flexidesk_db_updated', handleEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('flexidesk_db_updated', handleEvent);
    };
  }, [id]);

  if (!cafe) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Không tìm thấy quán cà phê</h2>
        <p className="text-stone-500 mb-6">Quán cà phê bạn tìm kiếm có thể đã tạm đóng hoặc đường dẫn không đúng.</p>
        <Link
          to="/cafes"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-bold px-6 py-3 rounded-full shadow-pink-200 shadow-md transition-all"
        >
          <span>Khám phá danh sách quán</span>
        </Link>
      </div>
    );
  }

  const menuItems = cafeService.getCafeMenu(cafe.id);

  const categoriesList = db.getMenuCategories(cafe.id);

  const menuCategories = [
    { id: 'all', name: 'Tất cả món' },
    ...categoriesList.map(c => ({ id: c.id, name: c.name }))
  ];

  const sectionMeta: Record<string, { enTitle: string; viTitle: string }> = {};
  categoriesList.forEach(c => {
    sectionMeta[c.id] = { enTitle: c.name, viTitle: c.viTitle || '' };
  });

  const categoryOrder = categoriesList.map(c => c.id);
  const groupedSections = categoryOrder
    .map(catId => ({
      id: catId,
      meta: sectionMeta[catId] || { enTitle: catId, viTitle: '' },
      items: menuItems.filter(item => item.category === catId),
    }))
    .filter(sec => sec.items.length > 0);

  const displaySections = activeMenuCategory === 'all'
    ? groupedSections
    : [{
        id: activeMenuCategory,
        meta: sectionMeta[activeMenuCategory] || { enTitle: activeMenuCategory, viTitle: '' },
        items: menuItems.filter(item => item.category === activeMenuCategory),
      }].filter(sec => sec.items.length > 0);

  const handleTableSelect = (table: TableSeat) => {
    selectTable(table);
    setTableNotice(null);
  };

  const handleProceedToConfirmation = () => {
    if (!selectedTable && (!cartItems || cartItems.length === 0)) {
      setTableNotice('⚠️ Vui lòng chọn cả chỗ ngồi trên sơ đồ và chọn ít nhất 1 món nước trước khi tiếp tục.');
      tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!selectedTable) {
      setTableNotice('⚠️ Vui lòng chọn một chỗ ngồi / bàn làm việc trên sơ đồ trước khi tiếp tục.');
      tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      setTableNotice('⚠️ Vui lòng chọn thêm ít nhất 1 món nước trong thực đơn bên dưới để hoàn tất đặt chỗ.');
      return;
    }
    navigate('/booking');
  };

  return (
    <div className="py-6 sm:py-8 pb-36 lg:pb-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
      
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <Link to="/" className="hover:text-[#FF5C8D]">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/cafes" className="hover:text-[#FF5C8D]">Quán cà phê</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2E1A12] font-bold truncate max-w-xs">{cafe.name}</span>
        </div>
      </div>

      {/* Main Top Grid: Gallery & Information */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-stone-200/80 shadow-card mb-10">
        
        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          {/* Big Featured Image */}
          <div className="md:col-span-8 aspect-[16/10] rounded-3xl overflow-hidden shadow-xs bg-stone-100">
            <img
              src={cafe.images[selectedImageIndex] || cafe.heroImage}
              alt={cafe.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* 3 Vertical Thumbnails */}
          <div className="md:col-span-4 grid grid-cols-3 md:grid-cols-1 gap-3">
            {cafe.images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`aspect-[16/10] md:aspect-auto md:h-28 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-[#FF5C8D] scale-[1.02] shadow-sm'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${cafe.name} view ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Title & Metadata Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="bg-[#FFF9EE] text-[#2E1A12] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#FFD9E2]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{cafe.rating}</span>
                <span className="text-stone-500 font-normal">({cafe.reviewCount} đánh giá xác thực)</span>
              </span>
              <span className="bg-[#FCECEF] text-[#FF5C8D] text-xs font-bold px-3 py-1 rounded-full border border-[#FFD9E2]">
                {cafe.district}
              </span>
              <span className="bg-[#FFF9EE] text-[#2E1A12] text-xs font-bold px-3 py-1 rounded-full border border-[#FFD9E2]">
                Mở cửa: {cafe.openHours.open} - {cafe.openHours.close}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2E1A12] tracking-tight">
              {cafe.name}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-1 font-medium">
              {cafe.tagline}
            </p>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mt-3">
              <MapPin className="w-4 h-4 text-[#FF5C8D] shrink-0" />
              <span>{cafe.address}, {cafe.ward}, {cafe.district}, {cafe.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => toggleFavorite(cafe.id)}
              className={`p-3 rounded-full border transition-all ${
                isFavorite(cafe.id)
                  ? 'border-[#FFD9E2] bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-pink-200'
                  : 'border-[#FFD9E2] text-stone-600 hover:bg-[#FCECEF] hover:text-[#FF5C8D]'
              }`}
              title={isFavorite(cafe.id) ? 'Bỏ lưu quán yêu thích' : 'Lưu vào danh sách yêu thích'}
            >
              <Heart className={`w-5 h-5 ${isFavorite(cafe.id) ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={() => alert('Đã sao chép liên kết quán vào khay nhớ tạm!')}
              className="p-3 rounded-full border border-[#FFD9E2] text-[#2E1A12] hover:bg-[#FCECEF] transition-colors"
              title="Chia sẻ"
            >
              <Share2 className="w-5 h-5 text-[#FF5C8D]" />
            </button>
            <div className="text-right">
              <span className="text-xs text-stone-400 block font-medium">Mức giá tham khảo</span>
              <span className="text-lg font-black text-[#FF5C8D]">{cafe.priceRange}</span>
            </div>
          </div>
        </div>

        {/* Amenity Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-6 text-xs text-[#2E1A12] font-semibold">
          <div className="flex items-center gap-2 bg-[#FFF9EE] p-3 rounded-2xl border border-[#FFD9E2]/60">
            <Volume2 className="w-4 h-4 text-[#FF5C8D] shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block font-normal">Độ ồn</span>
              <span>{cafe.features.noiseLevel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9EE] p-3 rounded-2xl border border-[#FFD9E2]/60">
            <Wifi className="w-4 h-4 text-[#FF5C8D] shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block font-normal">Tốc độ Wi-Fi</span>
              <span>{cafe.features.wifiSpeedMbps} Mbps</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9EE] p-3 rounded-2xl border border-[#FFD9E2]/60">
            <Zap className="w-4 h-4 text-[#FF5C8D] shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block font-normal">Ổ cắm sạc</span>
              <span>{cafe.features.powerSockets}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9EE] p-3 rounded-2xl border border-[#FFD9E2]/60">
            <Sun className="w-4 h-4 text-[#FF5C8D] shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block font-normal">Ánh sáng</span>
              <span>{cafe.features.naturalLight}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9EE] p-3 rounded-2xl border border-[#FFD9E2]/60">
            <ShieldCheck className="w-4 h-4 text-[#FF5C8D] shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block font-normal">Phòng họp</span>
              <span>{cafe.features.meetingRooms ? 'Có phòng riêng' : 'Không gian mở'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF9EE] p-3 rounded-2xl border border-[#FFD9E2]/60">
            <Clock className="w-4 h-4 text-[#FF5C8D] shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block font-normal">Giữ xe</span>
              <span className="truncate max-w-[90px] block" title={cafe.features.parking}>Miễn phí</span>
            </div>
          </div>
        </div>

        {/* Detailed description */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-400 mb-2">
            Mô tả không gian & dịch vụ
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed max-w-4xl">
            {cafe.description}
          </p>
        </div>

      </div>

      {/* Main Booking Flow: Left Column (Steps) & Right Column (Sticky Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Steps Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Mobile Quick Switcher Bar (Hidden on desktop/laptop lg:hidden) */}
          <div className="flex lg:hidden items-center gap-2 p-1.5 bg-[#FFF9EE] rounded-2xl border border-[#FFD9E2]">
            <button
              type="button"
              onClick={() => tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#FFD9E2] text-xs font-bold text-[#2E1A12] flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#FCECEF] active:scale-95 transition-all"
            >
              <span>🪑 Sơ Đồ Bàn</span>
              {selectedTable && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
            </button>
            <button
              type="button"
              onClick={() => menuSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#FFD9E2] text-xs font-bold text-[#2E1A12] flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#FCECEF] active:scale-95 transition-all"
            >
              <span>☕ Thực Đơn Gọi Món</span>
              {cartItems.length > 0 && (
                <span className="bg-[#FF5C8D] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Step 1: Time Slot Picker */}
          <TimeSlotPicker />

          {/* Step 2: Table Seating Map */}
          <div ref={tableSectionRef}>
            {tableNotice && (
              <div className="mb-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm p-4 rounded-2xl flex items-center gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-bold">{tableNotice}</span>
              </div>
            )}
            <InteractiveSeatMap
              cafeId={cafe.id}
              cafeName={cafe.name}
              tables={cafe.tables}
              selectedTableId={selectedTable?.id}
              onSelectTable={handleTableSelect}
            />
          </div>

          {/* Step 3: Cafe Drinks Menu (Redesigned Editorial Carte Layout) */}
          <div ref={menuSectionRef} className="bg-white rounded-[36px] p-6 sm:p-10 border border-[#FFD9E2] shadow-card relative">
            
            {/* Step 3 Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 p-4 rounded-2xl bg-[#FFF9EE]/70 border border-[#FFD9E2]">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  cartItems.length > 0
                    ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-2xs'
                    : 'bg-rose-100 text-rose-700 animate-pulse'
                }`}>
                  Bước 3: Chọn Món Nước {cartItems.length > 0 ? `✓ (Đã chọn ${cartItems.length} món)` : '(Bắt buộc)'}
                </span>
                <span className="text-xs text-stone-600 hidden md:inline">
                  Mỗi chỗ ngồi đặt trước yêu cầu kèm theo ít nhất 1 món nước
                </span>
              </div>

              {cartItems.length > 0 && (
                <div className="text-right">
                  <span className="text-xs text-stone-500 font-medium mr-2">Tổng đồ uống:</span>
                  <span className="font-black text-sm text-[#FF5C8D]">
                    {formatVND(cartItems.reduce((sum, item) => sum + (item.menuItem.price + (item.extraPrice || 0)) * item.quantity, 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Editorial Masthead / Header Emblem (Matching reference top emblem) */}
            <div className="text-center max-w-md mx-auto pt-2 pb-8 mb-8 border-b border-[#2E1A12]/10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFF9EE] border border-[#FFD9E2] text-[#FF5C8D] mb-3 shadow-2xs">
                <Coffee className="w-5 h-5 text-[#FF5C8D]" />
              </div>
              
              <h2 className="font-black text-2xl sm:text-3xl text-[#2E1A12] tracking-widest uppercase">
                / {cafe.name.split('–')[0].split('-')[0].trim()} /
              </h2>
              
              <p className="text-xs text-stone-500 mt-1 font-semibold tracking-wide">
                café & workspace • curated signature menu
              </p>

              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFF9EE] border border-[#FFD9E2] rounded-full text-[11px] font-bold text-stone-600">
                <span>Đơn vị tính: k (x1.000đ)</span>
                <span>•</span>
                <span>Nhấp vào món để tùy chỉnh size, đường, đá</span>
              </div>
            </div>

            {/* Menu Category Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-3 mb-10 scrollbar-none">
              {menuCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveMenuCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeMenuCategory === cat.id
                      ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-pink-200 shadow-md'
                      : 'bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2]/70 hover:bg-[#FCECEF]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Editorial Sections */}
            <div className="space-y-12">
              {displaySections.map((section, sIdx) => (
                <div key={section.id} className={sIdx > 0 ? "pt-4" : ""}>
                  {/* Section Title with horizontal divider rule matching reference */}
                  <div className="flex items-end justify-between pb-3 border-b border-[#2E1A12]/15 mb-8">
                    <div>
                      <h3 className="font-black text-2xl sm:text-3xl text-[#2E1A12] tracking-tight">
                        {section.meta.enTitle}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-0.5">
                        {section.meta.viTitle}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-400 pb-1">
                      {section.items.length} món
                    </span>
                  </div>

                  {/* 3 Columns Item Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {section.items.map(item => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card">
            <h3 className="text-xl font-extrabold text-brand-espresso mb-6 flex items-center justify-between">
              <span>Đánh Giá Từ Khách Hàng</span>
              <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" /> {cafe.rating} / 5.0
              </span>
            </h3>

            <div className="space-y-6">
              {cafe.reviews.map(review => (
                <div key={review.id} className="pb-6 border-b border-stone-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">{review.userName}</h4>
                        <span className="text-[11px] text-stone-400">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {'★'.repeat(review.rating)}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3">
                    "{review.comment}"
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {review.workFriendlyTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#FCECEF] text-[#FF5C8D] border border-[#FFD9E2] font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sticky Column: Summary & Checkout Button */}
        <div className="lg:col-span-4">
          <BookingSummary onProceedToCheckout={handleProceedToConfirmation} />
        </div>

      </div>

      {/* Mobile Sticky Booking Action Bar (Hidden on laptop/desktop lg:hidden) */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#FFD9E2] px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Summary info on the left */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E1A12] truncate">
              <span className="text-stone-400">Bàn:</span>
              <span className={selectedTable ? 'text-[#FF5C8D] font-black' : 'text-stone-400 font-normal italic'}>
                {selectedTable ? selectedTable.code : 'Chưa chọn'}
              </span>
              <span className="text-stone-300">•</span>
              <span className={cartItems.length > 0 ? 'text-[#2E1A12]' : 'text-stone-400 italic font-normal'}>
                {cartItems.length > 0 ? `${cartItems.length} món` : 'Chưa món'}
              </span>
            </div>
            <div className="text-base font-black text-[#FF5C8D] leading-tight">
              {formatVND(
                paymentMethod === 'deposit_10_percent'
                  ? (depositAmount > 0 ? depositAmount : totalAmount)
                  : totalAmount
              )}
              {paymentMethod === 'deposit_10_percent' && (
                <span className="text-[10px] text-stone-400 font-normal ml-1">(Cọc 10%)</span>
              )}
            </div>
          </div>

          {/* Action button on the right */}
          <button
            onClick={handleProceedToConfirmation}
            className="bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-pink-200 shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <span>Tiếp tục đặt chỗ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
