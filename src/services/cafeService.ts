import { Cafe, CafeFilterParams, MenuItem, TableSeat } from '../types';
import { db } from './databaseService';

export const cafeService = {
  /**
   * Get all cafes with full client-side filtering and sorting
   */
  getAllCafes(filters?: CafeFilterParams): Cafe[] {
    let result = [...db.getCafes()];

    if (!filters) return result;

    // Filter by text search
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(cafe =>
        cafe.name.toLowerCase().includes(query) ||
        cafe.address.toLowerCase().includes(query) ||
        cafe.district.toLowerCase().includes(query) ||
        cafe.tagline.toLowerCase().includes(query) ||
        cafe.categories.some(c => c.toLowerCase().includes(query))
      );
    }

    // Filter by District
    if (filters.district && filters.district !== 'Tất cả khu vực') {
      result = result.filter(cafe => cafe.district.toLowerCase() === filters.district!.toLowerCase());
    }

    // Filter by Noise level
    if (filters.noiseLevel && filters.noiseLevel !== 'Tất cả') {
      result = result.filter(cafe => cafe.features.noiseLevel === filters.noiseLevel);
    }

    // Filter by Wi-Fi minimum speed
    if (filters.wifiMinSpeed && filters.wifiMinSpeed > 0) {
      result = result.filter(cafe => cafe.features.wifiSpeedMbps >= filters.wifiMinSpeed!);
    }

    // Filter by Meeting rooms
    if (filters.hasMeetingRoom) {
      result = result.filter(cafe => cafe.features.meetingRooms);
    }

    // Filter by Power Sockets
    if (filters.powerSockets && filters.powerSockets !== 'Tất cả') {
      result = result.filter(cafe => cafe.features.powerSockets === filters.powerSockets);
    }

    // Filter by Light level (Tự nhiên / Yếu / Bình thường / Mạnh)
    if (filters.naturalLight && filters.naturalLight !== 'Tất cả') {
      result = result.filter(cafe => {
        const light = (cafe.features.naturalLight || '').toLowerCase();
        const target = filters.naturalLight!.toLowerCase();
        if (target === 'tự nhiên') {
          return light.includes('tự nhiên') || light.includes('ngập tràn');
        }
        if (target === 'mạnh') {
          return light.includes('mạnh') || light.includes('ngập tràn') || light.includes('tốt');
        }
        if (target === 'bình thường') {
          return light.includes('bình thường') || light.includes('tốt') || light.includes('vừa');
        }
        if (target === 'yếu') {
          return light.includes('yếu') || light.includes('ấm cúng') || light.includes('dịu');
        }
        return light.includes(target);
      });
    }

    // Filter by Guest Count
    if (filters.guestCount && filters.guestCount > 1) {
      result = result.filter(cafe => cafe.tables.some(t => t.capacity >= filters.guestCount!));
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'price_asc':
          result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
          break;
        case 'recommended':
        default:
          result.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
          break;
      }
    }

    return result;
  },

  /**
   * Get single cafe by ID or slug
   */
  getCafeById(id: string): Cafe | undefined {
    return db.getCafeById(id);
  },

  /**
   * Get menu items for a specific cafe
   */
  getCafeMenu(cafeId: string): MenuItem[] {
    return db.getMenuByCafe(cafeId);
  },

  /**
   * Check dynamic table availability for a specific time slot
   */
  getTableAvailability(
    cafeId: string,
    tableId: string,
    date: string,
    startTime: string,
    durationHours?: number
  ): { isAvailable: boolean; reason?: string } {
    const cafe = db.getCafeById(cafeId);
    if (!cafe) return { isAvailable: false, reason: 'Quán không tồn tại' };

    const table = cafe.tables.find(t => t.id === tableId);
    if (!table) return { isAvailable: false, reason: 'Bàn không tồn tại' };

    if (table.status === 'occupied') {
      return { isAvailable: false, reason: 'Bàn hiện đang có khách ngồi sử dụng' };
    }
    if (table.status === 'reserved') {
      return { isAvailable: false, reason: 'Bàn đã có người đặt trước trong khung giờ này' };
    }
    if (table.status === 'maintenance') {
      return { isAvailable: false, reason: 'Bàn đang trong thời gian bảo trì' };
    }

    return { isAvailable: true };
  }
};
