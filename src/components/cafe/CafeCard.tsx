import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Wifi, Volume2, Zap, ArrowRight, Users, Heart } from 'lucide-react';
import { Cafe } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';

interface CafeCardProps {
  cafe: Cafe;
}

export const CafeCard: React.FC<CafeCardProps> = ({ cafe }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(cafe.id);

  return (
    <div className="bg-white rounded-[32px] overflow-hidden border border-[#FFD9E2]/80 hover:border-[#FF5C8D]/50 shadow-card hover:shadow-floating transition-all duration-300 flex flex-col group hover:-translate-y-1">
      
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FFF9EE]">
        <img
          src={cafe.heroImage}
          alt={cafe.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          {/* Rating */}
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs text-xs font-bold text-[#2E1A12] pointer-events-none">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{cafe.rating}</span>
            <span className="text-stone-400 font-normal">({cafe.reviewCount})</span>
          </div>

          {/* District Tag & Heart Favorite Button */}
          <div className="flex items-center gap-2">
            <span className="bg-[#2E1A12]/85 backdrop-blur-md px-3 py-1.5 rounded-full text-[#FFF9EE] text-xs font-bold pointer-events-none">
              {cafe.district}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(cafe.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs cursor-pointer ${
                favorite
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white scale-110 shadow-pink-200'
                  : 'bg-white/90 text-stone-600 hover:text-[#FF5C8D] hover:bg-white'
              }`}
              title={favorite ? 'Bỏ lưu quán yêu thích' : 'Lưu vào quán yêu thích'}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Noise Level Tag */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/95 backdrop-blur-md text-[#FF5C8D] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 border border-pink-100">
            <Volume2 className="w-3 h-3 text-[#FF5C8D]" />
            {cafe.features.noiseLevel}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Address */}
          <div className="flex items-center gap-1 text-xs text-stone-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#FF5C8D] shrink-0" />
            <span className="truncate">{cafe.address}</span>
            {cafe.distanceKm && (
              <span className="text-stone-400 shrink-0">• {cafe.distanceKm} km</span>
            )}
          </div>

          {/* Title & Tagline */}
          <Link to={`/cafes/${cafe.id}`}>
            <h3 className="font-extrabold text-lg text-[#2E1A12] group-hover:text-[#FF5C8D] transition-colors line-clamp-1">
              {cafe.name}
            </h3>
          </Link>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {cafe.tagline}
          </p>

          {/* Amenity Badges */}
          <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-[#FF5C8D] shrink-0" />
              <span>Wi-Fi {cafe.features.wifiSpeedMbps} Mbps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#FF5C8D] shrink-0" />
              <span>{cafe.features.powerSockets}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FF5C8D] shrink-0" />
              <span>{cafe.tables.length} loại bàn lựa chọn</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#FF5C8D] font-semibold">
              <span>{cafe.features.meetingRooms ? '✓ Có phòng họp' : '✓ Không gian mở'}</span>
            </div>
          </div>
        </div>

        {/* Footer & CTA */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Mức giá đồ uống
            </span>
            <span className="text-xs sm:text-sm font-black text-[#FF5C8D]">
              {cafe.priceRange}
            </span>
          </div>

          <Link
            to={`/cafes/${cafe.id}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all shadow-xs group-hover:shadow-md"
          >
            <span>Đặt chỗ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
