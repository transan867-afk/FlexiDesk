import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CafeCard } from '../components/cafe/CafeCard';
import { cafeService } from '../services/cafeService';
import { DISTRICTS } from '../data/cafesData';
import { Search, SlidersHorizontal, RotateCcw, Volume2, Wifi, Zap, Building2, MapPin, Sun, Heart, ArrowLeft } from 'lucide-react';
import { CafeFilterParams } from '../types';
import { useFavorites } from '../context/FavoritesContext';

export const CafesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites, isFavorite } = useFavorites();

  // Read initial values from URL query params
  const initialDistrict = searchParams.get('district') || 'Tất cả khu vực';
  const initialSearch = searchParams.get('search') || '';
  const initialFavorites = searchParams.get('favorites') === 'true';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [district, setDistrict] = useState(initialDistrict);
  const [noiseLevel, setNoiseLevel] = useState('Tất cả');
  const [wifiMinSpeed, setWifiMinSpeed] = useState<number>(0);
  const [powerSockets, setPowerSockets] = useState('Tất cả');
  const [naturalLight, setNaturalLight] = useState('Tất cả');
  const [hasMeetingRoom, setHasMeetingRoom] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavorites);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price_asc'>('recommended');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    if (searchParams.get('favorites') === 'true') {
      setFavoritesOnly(true);
    }
  }, [searchParams]);

  // Compute filtered cafes
  const filterParams: CafeFilterParams = useMemo(() => ({
    searchQuery,
    district,
    noiseLevel,
    wifiMinSpeed,
    powerSockets,
    naturalLight,
    hasMeetingRoom,
    sortBy,
  }), [searchQuery, district, noiseLevel, wifiMinSpeed, powerSockets, naturalLight, hasMeetingRoom, sortBy]);

  const cafes = useMemo(() => {
    let list = cafeService.getAllCafes(filterParams);
    if (favoritesOnly) {
      list = list.filter(c => isFavorite(c.id));
    }
    return list;
  }, [filterParams, favoritesOnly, isFavorite]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDistrict('Tất cả khu vực');
    setNoiseLevel('Tất cả');
    setWifiMinSpeed(0);
    setPowerSockets('Tất cả');
    setNaturalLight('Tất cả');
    setHasMeetingRoom(false);
    setFavoritesOnly(false);
    setSortBy('recommended');
    setSearchParams({});
  };

  const isFilterActive = searchQuery || district !== 'Tất cả khu vực' || noiseLevel !== 'Tất cả' || wifiMinSpeed > 0 || powerSockets !== 'Tất cả' || naturalLight !== 'Tất cả' || hasMeetingRoom || favoritesOnly;

  return (
    <div className="py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">

      {/* Page Title Header */}
      <div className="mb-8">
        <span className="font-script text-2xl text-[#FF5C8D] block mb-1">
          Khám phá không gian
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2E1A12] tracking-tight">
          Danh Sách Quán Cà Phê Làm Việc & Đặt Chỗ
        </h1>
        <p className="text-stone-500 text-sm sm:text-base mt-1.5 max-w-2xl">
          Tìm kiếm quán cà phê có không gian yên tĩnh, Wi-Fi doanh nghiệp và đầy đủ ổ cắm điện để giữ chỗ trước khi tới.
        </p>
      </div>

      {/* Main Search and Quick Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Text Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên quán, địa chỉ (Quận 1, Tú Xương...), phong cách..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#FFF9EE] text-sm text-[#2E1A12] border border-[#FFD9E2] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
            />
          </div>

          {/* District Select */}
          <div className="w-full md:w-56">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF9EE] text-sm font-semibold text-[#2E1A12] border border-[#FFD9E2] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div className="w-full md:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF9EE] text-sm font-semibold text-[#2E1A12] border border-[#FFD9E2] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D]"
            >
              <option value="recommended">Gợi ý tốt nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price_asc">Gần bạn nhất</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="md:hidden w-full inline-flex items-center justify-center gap-2 bg-[#FCECEF] text-[#FF5C8D] font-bold text-sm py-3 px-4 rounded-2xl"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ lọc nâng cao</span>
          </button>

        </div>

        {/* Detailed Horizontal Filter Pills (Desktop & expandable mobile) */}
        <div className={`mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3 ${
          showMobileFilter ? 'block' : 'hidden md:flex'
        }`}>
          
          {/* Noise Level */}
          <div className="flex items-center gap-1.5 bg-[#FFF9EE] px-3 py-1.5 rounded-xl border border-[#FFD9E2]/70 text-xs">
            <Volume2 className="w-3.5 h-3.5 text-[#FF5C8D]" />
            <span className="font-bold text-[#2E1A12]">Độ ồn:</span>
            <select
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(e.target.value)}
              className="bg-transparent font-semibold text-[#2E1A12] outline-none"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Rất yên tĩnh">Rất yên tĩnh</option>
              <option value="Yên tĩnh">Yên tĩnh</option>
              <option value="Vừa phải">Vừa phải</option>
            </select>
          </div>

          {/* Wi-Fi Speed */}
          <div className="flex items-center gap-1.5 bg-[#FFF9EE] px-3 py-1.5 rounded-xl border border-[#FFD9E2]/70 text-xs">
            <Wifi className="w-3.5 h-3.5 text-[#FF5C8D]" />
            <span className="font-bold text-[#2E1A12]">Wi-Fi:</span>
            <select
              value={wifiMinSpeed}
              onChange={(e) => setWifiMinSpeed(Number(e.target.value))}
              className="bg-transparent font-semibold text-[#2E1A12] outline-none"
            >
              <option value={0}>Tất cả tốc độ</option>
              <option value={150}>Từ 150 Mbps</option>
              <option value={250}>Từ 250 Mbps (Siêu tốc)</option>
              <option value={300}>Từ 300 Mbps (Cáp quang)</option>
            </select>
          </div>

          {/* Power Sockets */}
          <div className="flex items-center gap-1.5 bg-[#FFF9EE] px-3 py-1.5 rounded-xl border border-[#FFD9E2]/70 text-xs">
            <Zap className="w-3.5 h-3.5 text-[#FF5C8D]" />
            <span className="font-bold text-[#2E1A12]">Ổ cắm điện:</span>
            <select
              value={powerSockets}
              onChange={(e) => setPowerSockets(e.target.value)}
              className="bg-transparent font-semibold text-[#2E1A12] outline-none"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Mỗi bàn đều có">Mỗi bàn đều có</option>
              <option value="Nhiều ổ cắm">Nhiều ổ cắm</option>
            </select>
          </div>

          {/* Light Level Filter (Tự nhiên / Yếu / Bình Thường / Mạnh) */}
          <div className="flex items-center gap-1.5 bg-[#FFF9EE] px-3 py-1.5 rounded-xl border border-[#FFD9E2]/70 text-xs">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-[#2E1A12]">Ánh sáng:</span>
            <select
              value={naturalLight}
              onChange={(e) => setNaturalLight(e.target.value)}
              className="bg-transparent font-semibold text-[#2E1A12] outline-none"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Tự nhiên">Tự nhiên</option>
              <option value="Yếu">Yếu</option>
              <option value="Bình thường">Bình thường</option>
              <option value="Mạnh">Mạnh</option>
            </select>
          </div>

          {/* Meeting Room Toggle */}
          <label className="flex items-center gap-2 bg-[#FFF9EE] px-3 py-1.5 rounded-xl border border-[#FFD9E2]/70 text-xs font-semibold text-[#2E1A12] cursor-pointer hover:bg-[#FCECEF]/60">
            <input
              type="checkbox"
              checked={hasMeetingRoom}
              onChange={(e) => setHasMeetingRoom(e.target.checked)}
              className="rounded text-[#FF5C8D] focus:ring-[#FF5C8D]"
            />
            <Building2 className="w-3.5 h-3.5 text-[#FF5C8D]" />
            <span>Phòng họp</span>
          </label>

          {/* Favorites Only Toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              favoritesOnly
                ? 'bg-[#FCECEF] border-[#FFD9E2] text-[#FF5C8D] shadow-xs'
                : 'bg-[#FFF9EE] border-[#FFD9E2]/70 text-[#2E1A12] hover:bg-[#FCECEF]/60'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-[#FF5C8D] text-[#FF5C8D]' : 'text-stone-400'}`} />
            <span>Quán yêu thích {favorites.length > 0 ? `(${favorites.length})` : ''}</span>
          </button>

          {/* Reset button */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5C8D] hover:text-[#E83D70] ml-auto transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}

        </div>

      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-[#2E1A12]">
          Tìm thấy <span className="text-[#FF5C8D] font-extrabold">{cafes.length}</span> quán cà phê phù hợp
        </span>

        {district !== 'Tất cả khu vực' && (
          <span className="text-xs bg-[#FCECEF] text-[#FF5C8D] font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-[#FFD9E2]">
            <MapPin className="w-3 h-3" /> {district}
          </span>
        )}
      </div>

      {/* Cafes Grid or Empty State */}
      {cafes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cafes.map(cafe => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#FFD9E2] shadow-xs max-w-xl mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#2E1A12] mb-2">
            Không tìm thấy quán cà phê phù hợp
          </h3>
          <p className="text-sm text-stone-500 mb-6">
            Thử điều chỉnh lại từ khóa tìm kiếm hoặc bỏ bớt các tiêu chí lọc nâng cao để xem thêm kết quả.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-bold text-xs px-6 py-3 rounded-full shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại tất cả bộ lọc</span>
          </button>
        </div>
      )}

    </div>
  );
};
