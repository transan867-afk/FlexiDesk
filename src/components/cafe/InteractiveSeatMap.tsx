import React, { useState } from 'react';
import { TableSeat, TableStatus } from '../../types';
import { formatVND } from '../../utils/formatters';
import {
  Check,
  Zap,
  Users,
  ShieldAlert,
  Sparkles,
  Layers,
  Info,
  Tv,
  X,
  ArrowRight
} from 'lucide-react';

interface InteractiveSeatMapProps {
  cafeId: string;
  cafeName: string;
  tables: TableSeat[];
  selectedTableId?: string;
  onSelectTable: (table: TableSeat) => void;
  isOwnerMode?: boolean;
  onUpdateTableStatus?: (tableId: string, newStatus: TableStatus) => void;
}

// Blueprint table layout specification matching the user's architectural plan (10m x 10m)
interface BlueprintSlot {
  code: string;
  defaultName: string;
  type: 'double' | 'booth' | 'meeting_room' | 'single';
  shape: 'duo_h' | 'duo_v' | 'curved_up' | 'curved_down' | 'corner_lounge' | 'meeting_room' | 'single_desk';
  capacity: number;
  floor: number;
  x: number; // percentage 0-100%
  y: number; // percentage 0-100%
  zone: string;
  hourlyRate?: number;
  features: string[];
}

// Floor 1 Blueprint Layout matching the user's uploaded floor plan
const FLOOR_1_SLOTS: BlueprintSlot[] = [
  // Top row: 4 horizontal duo tables along top window wall
  {
    code: 'T01',
    defaultName: 'Bàn Đôi Cửa Sổ #01',
    type: 'double',
    shape: 'duo_h',
    capacity: 2,
    floor: 1,
    x: 18,
    y: 12,
    zone: 'Hàng Cửa Sổ Tường Trên',
    features: ['2 Ổ cắm điện', 'Ánh sáng tự nhiên 100%', 'Ghế đệm êm'],
  },
  {
    code: 'T02',
    defaultName: 'Bàn Đôi Cửa Sổ #02',
    type: 'double',
    shape: 'duo_h',
    capacity: 2,
    floor: 1,
    x: 38,
    y: 12,
    zone: 'Hàng Cửa Sổ Tường Trên',
    features: ['2 Ổ cắm điện', 'Ánh sáng tự nhiên 100%', 'Ghế đệm êm'],
  },
  {
    code: 'T03',
    defaultName: 'Bàn Đôi Cửa Sổ #03',
    type: 'double',
    shape: 'duo_h',
    capacity: 2,
    floor: 1,
    x: 58,
    y: 12,
    zone: 'Hàng Cửa Sổ Tường Trên',
    features: ['2 Ổ cắm điện', 'Ánh sáng tự nhiên 100%', 'Ghế đệm êm'],
  },
  {
    code: 'T04',
    defaultName: 'Bàn Đôi Cửa Sổ #04',
    type: 'double',
    shape: 'duo_h',
    capacity: 2,
    floor: 1,
    x: 80,
    y: 12,
    zone: 'Hàng Cửa Sổ Tường Trên',
    features: ['2 Ổ cắm điện', 'Ánh sáng tự nhiên 100%', 'Ghế đệm êm'],
  },

  // Center Zone: S-Curve semi-circular sofa pair (Yin-Yang wave flow)
  {
    code: 'B01',
    defaultName: 'Sofa Bán Nguyệt S-Curve #01 (Vòm Dưới)',
    type: 'booth',
    shape: 'curved_up',
    capacity: 4,
    floor: 1,
    x: 35,
    y: 35,
    zone: 'Khu Sofa Lượn Sóng Trung Tâm',
    features: ['Sofa nhung bo cong', 'Bàn tròn gỗ sồi', '4 Cổng sạc Type-C PD'],
  },
  {
    code: 'B02',
    defaultName: 'Sofa Bán Nguyệt S-Curve #02 (Vòm Trên)',
    type: 'booth',
    shape: 'curved_down',
    capacity: 4,
    floor: 1,
    x: 58,
    y: 31,
    zone: 'Khu Sofa Lượn Sóng Trung Tâm',
    features: ['Sofa nhung bo cong', 'Bàn tròn gỗ sồi', '4 Cổng sạc Type-C PD'],
  },

  // Right of central sofas: 1 vertical duo table
  {
    code: 'T05',
    defaultName: 'Bàn Đôi Thảo Luận #05',
    type: 'double',
    shape: 'duo_v',
    capacity: 2,
    floor: 1,
    x: 80,
    y: 33,
    zone: 'Khu Vách Phải',
    features: ['2 Ổ cắm điện', 'Ghế đệm lưng cao'],
  },

  // Mid-left wall: 1 horizontal duo table
  {
    code: 'T06',
    defaultName: 'Bàn Đôi Vách Trái #06',
    type: 'double',
    shape: 'duo_h',
    capacity: 2,
    floor: 1,
    x: 18,
    y: 54,
    zone: 'Khu Vách Trái Yên Tĩnh',
    features: ['2 Ổ cắm điện', 'Vách gỗ cách âm nhẹ'],
  },

  // Middle-lower row: 3 parallel vertical duo tables
  {
    code: 'T07',
    defaultName: 'Bàn Đôi Trung Tâm #07',
    type: 'double',
    shape: 'duo_v',
    capacity: 2,
    floor: 1,
    x: 40,
    y: 58,
    zone: 'Dãy Bàn Đôi Giữa Phòng',
    features: ['2 Ổ cắm điện âm bàn', 'Bàn rộng làm việc laptop đôi'],
  },
  {
    code: 'T08',
    defaultName: 'Bàn Đôi Trung Tâm #08',
    type: 'double',
    shape: 'duo_v',
    capacity: 2,
    floor: 1,
    x: 53,
    y: 58,
    zone: 'Dãy Bàn Đôi Giữa Phòng',
    features: ['2 Ổ cắm điện âm bàn', 'Bàn rộng làm việc laptop đôi'],
  },
  {
    code: 'T09',
    defaultName: 'Bàn Đôi Trung Tâm #09',
    type: 'double',
    shape: 'duo_v',
    capacity: 2,
    floor: 1,
    x: 66,
    y: 58,
    zone: 'Dãy Bàn Đôi Giữa Phòng',
    features: ['2 Ổ cắm điện âm bàn', 'Bàn rộng làm việc laptop đôi'],
  },

  // Bottom-right corner: VIP L-shaped Curved Corner Lounge Sofa + Oval Table
  {
    code: 'L01',
    defaultName: 'Sofa Lounge Góc VIP #L01',
    type: 'booth',
    shape: 'corner_lounge',
    capacity: 6,
    floor: 1,
    x: 80,
    y: 65,
    zone: 'Khu Sofa Lounge Góc VIP',
    features: ['Sofa góc chữ L cao cấp', 'Bàn oval mặt đá cẩm thạch', '6 Ổ cắm sạc đa năng'],
  },
];

// Floor 2 Layout: Quiet Workspaces & Private Meeting Room
const FLOOR_2_SLOTS: BlueprintSlot[] = [
  {
    code: 'S01',
    defaultName: 'Bàn Đơn Silent Focus #S01',
    type: 'single',
    shape: 'single_desk',
    capacity: 1,
    floor: 2,
    x: 18,
    y: 16,
    zone: 'Khu Yên Tĩnh Tầng 2',
    features: ['Ghế Herman Miller', 'Đèn bàn bảo vệ mắt', 'Type-C PD 65W'],
  },
  {
    code: 'S02',
    defaultName: 'Bàn Đơn Silent Focus #S02',
    type: 'single',
    shape: 'single_desk',
    capacity: 1,
    floor: 2,
    x: 38,
    y: 16,
    zone: 'Khu Yên Tĩnh Tầng 2',
    features: ['Ghế Ergonomic', 'Đèn bàn bảo vệ mắt', 'Type-C PD 65W'],
  },
  {
    code: 'S03',
    defaultName: 'Bàn Đơn Silent Focus #S03',
    type: 'single',
    shape: 'single_desk',
    capacity: 1,
    floor: 2,
    x: 60,
    y: 16,
    zone: 'Khu Yên Tĩnh Tầng 2',
    features: ['Ghế Ergonomic', 'Đèn bàn bảo vệ mắt', 'Type-C PD 65W'],
  },
  {
    code: 'S04',
    defaultName: 'Bàn Đơn Silent Focus #S04',
    type: 'single',
    shape: 'single_desk',
    capacity: 1,
    floor: 2,
    x: 80,
    y: 16,
    zone: 'Khu Yên Tĩnh Tầng 2',
    features: ['Ghế Ergonomic', 'Đèn bàn bảo vệ mắt', 'Type-C PD 65W'],
  },
  {
    code: 'M01',
    defaultName: 'Phòng Họp Kính Glass Room #M01',
    type: 'meeting_room',
    shape: 'meeting_room',
    capacity: 10,
    floor: 2,
    x: 36,
    y: 54,
    zone: 'Phòng Họp Kín Cách Âm',
    hourlyRate: 120000,
    features: ['Tivi 65 inch 4K & HDMI', 'Loa hội nghị Jabra', 'Bảng trắng nam châm'],
  },
  {
    code: 'B03',
    defaultName: 'Booth Kính Thảo Luận #B03',
    type: 'booth',
    shape: 'curved_up',
    capacity: 4,
    floor: 2,
    x: 75,
    y: 52,
    zone: 'Khu Thảo Luận Kín',
    hourlyRate: 25000,
    features: ['Cách âm 80%', 'Màn hình phụ 27 inch', '4 Ổ cắm sạc'],
  },
];

export const InteractiveSeatMap: React.FC<InteractiveSeatMapProps> = ({
  cafeId,
  cafeName,
  tables,
  selectedTableId,
  onSelectTable,
  isOwnerMode = false,
  onUpdateTableStatus,
}) => {
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [activeSeatModal, setActiveSeatModal] = useState<TableSeat | null>(null);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  // Active slots for selected floor
  const currentBlueprintSlots = activeFloor === 2 ? FLOOR_2_SLOTS : FLOOR_1_SLOTS;

  // Resolve seat data: combine blueprint slot with dynamic state from cafe tables
  const resolvedSeats: { slot: BlueprintSlot; seat: TableSeat }[] = currentBlueprintSlots.map(slot => {
    // Try to match with existing table in database by code
    const existing = tables.find(t => t.code === slot.code);
    if (existing) {
      return {
        slot,
        seat: {
          ...existing,
          floor: activeFloor,
          name: existing.name || slot.defaultName,
          type: existing.type || slot.type,
          capacity: existing.capacity || slot.capacity,
          zone: existing.zone || slot.zone,
          features: existing.features && existing.features.length ? existing.features : slot.features,
          hourlyRate: existing.hourlyRate ?? (slot.hourlyRate || 0),
          position: { x: slot.x, y: slot.y },
        },
      };
    }

    // Default synthesized table if not yet explicitly saved
    const synthesized: TableSeat = {
      id: `${cafeId}-${slot.code.toLowerCase()}`,
      cafeId,
      code: slot.code,
      name: slot.defaultName,
      type: slot.type,
      capacity: slot.capacity,
      floor: activeFloor,
      features: slot.features,
      status: 'available',
      hourlyRate: slot.hourlyRate || 0,
      zone: slot.zone,
      position: { x: slot.x, y: slot.y },
    };

    return { slot, seat: synthesized };
  });

  const handleSeatClick = (seat: TableSeat) => {
    setActiveSeatModal(seat);
  };

  const handleConfirmSelect = (seat: TableSeat) => {
    if (seat.status === 'occupied') {
      setWarningNotice(`Chỗ "${seat.name}" hiện đang có khách ngồi. Vui lòng chọn chỗ có màu xanh còn trống.`);
      setTimeout(() => setWarningNotice(null), 4000);
      return;
    }
    if (seat.status === 'reserved') {
      setWarningNotice(`Chỗ "${seat.name}" đã được khách khác giữ chỗ trước.`);
      setTimeout(() => setWarningNotice(null), 4000);
      return;
    }
    if (seat.status === 'maintenance') {
      setWarningNotice(`Chỗ "${seat.name}" đang trong quá trình bảo trì thiết bị.`);
      setTimeout(() => setWarningNotice(null), 4000);
      return;
    }

    setWarningNotice(null);
    onSelectTable(seat);
    setActiveSeatModal(null);
  };

  const getStatusColor = (status: TableStatus, isSelected: boolean) => {
    if (isSelected) {
      return {
        tableBg: 'bg-emerald-600 text-white border-emerald-700 shadow-xl ring-4 ring-emerald-400/80 scale-110 z-30',
        chairBg: 'bg-emerald-700 border-emerald-800',
        sofaBg: 'bg-emerald-600 border-emerald-700',
        badge: 'bg-white text-emerald-800',
      };
    }
    switch (status) {
      case 'available':
        return {
          tableBg: 'bg-white text-emerald-950 border-emerald-400 hover:border-emerald-600 hover:shadow-lg hover:scale-105 transition-all',
          chairBg: 'bg-emerald-100 border-emerald-400',
          sofaBg: 'bg-emerald-50 border-emerald-400',
          badge: 'bg-emerald-500 text-white',
        };
      case 'occupied':
        return {
          tableBg: 'bg-stone-100 text-stone-500 border-stone-300 opacity-60 cursor-pointer',
          chairBg: 'bg-stone-200 border-stone-300',
          sofaBg: 'bg-stone-100 border-stone-300',
          badge: 'bg-stone-400 text-white',
        };
      case 'reserved':
        return {
          tableBg: 'bg-rose-50 text-rose-800 border-rose-300 opacity-75 cursor-pointer',
          chairBg: 'bg-rose-200 border-rose-300',
          sofaBg: 'bg-rose-50 border-rose-300',
          badge: 'bg-rose-400 text-white',
        };
      case 'maintenance':
      default:
        return {
          tableBg: 'bg-amber-50 text-amber-800 border-amber-300 opacity-60 cursor-not-allowed',
          chairBg: 'bg-amber-200 border-amber-300',
          sofaBg: 'bg-amber-50 border-amber-300',
          badge: 'bg-amber-500 text-white',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-3 sm:p-7 border border-[#FFD9E2]/80 shadow-card overflow-hidden">
      
      {/* Top Map Header & Floor Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-[#FCECEF] text-[#FF5C8D] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#FFD9E2]">
              <Layers className="w-3.5 h-3.5" /> Interactive Seat Map
            </span>
            <span className="text-xs bg-[#FFF9EE] text-[#2E1A12] font-bold px-2.5 py-1 rounded-full border border-[#FFD9E2]/60">
              Sơ Đồ Thực Tế (10m × 10m)
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#2E1A12]">
            Sơ Đồ Bố Trí Bàn & Chỗ Ngồi – {cafeName}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Bấm trực tiếp vào từng vị trí bàn đôi, sofa lượn sóng hoặc phòng VIP để xem chi tiết và đặt chỗ.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#2E1A12] bg-[#FFF9EE] p-2.5 rounded-2xl border border-[#FFD9E2]/80">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-2xs"></span>
            <span>Trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-stone-400 inline-block"></span>
            <span>Khách ngồi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5C8D] inline-block"></span>
            <span>Đã đặt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>Bảo trì</span>
          </div>
        </div>
      </div>

      {warningNotice && (
        <div className="mb-6 bg-rose-50 border-2 border-rose-300 text-rose-900 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-shake">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{warningNotice}</span>
        </div>
      )}

      {/* Floor Selection Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveFloor(1)}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeFloor === 1
              ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-pink-200 shadow-md'
              : 'bg-[#FFF9EE] text-[#2E1A12] hover:bg-[#FCECEF] border border-[#FFD9E2]/70'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tầng 1 (Trệt): Không Gian Mở</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeFloor === 1 ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#2E1A12]'
          }`}>
            12 Vị trí
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFloor(2)}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeFloor === 2
              ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-pink-200 shadow-md'
              : 'bg-[#FFF9EE] text-[#2E1A12] hover:bg-[#FCECEF] border border-[#FFD9E2]/70'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tầng 2: Yên Tĩnh & Phòng Họp Kính</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeFloor === 2 ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#2E1A12]'
          }`}>
            6 Vị trí
          </span>
        </button>
      </div>

      {/* Mobile Touch Guidance Notice */}
      <div className="flex sm:hidden items-center justify-center text-[11px] text-stone-500 bg-[#FFF9EE] px-3.5 py-1.5 rounded-xl border border-[#FFD9E2] mb-3 font-medium text-center">
        <span>Chạm trực tiếp vào bàn trên sơ đồ để chọn chỗ ngồi</span>
      </div>

      {/* ================= ARCHITECTURAL FLOOR CANVAS ================= */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="relative w-full aspect-square bg-[#FDFBF7] rounded-2xl sm:rounded-[36px] border-2 sm:border-4 border-stone-300 p-2 sm:p-8 overflow-hidden shadow-inner select-none">
        
        {/* Architectural Dimensions indicator - positioned with clean clearance (hidden on mobile to prevent overflow) */}
        <div className="hidden sm:block absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-3 py-0.5 rounded-full border border-stone-300 text-[9px] font-mono text-stone-500 font-extrabold tracking-widest uppercase shadow-2xs z-20">
          ← 10000 mm (10.0m) →
        </div>
        <div className="hidden sm:block absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-3 py-0.5 rounded-full border border-stone-300 text-[9px] font-mono text-stone-500 font-extrabold tracking-widest uppercase shadow-2xs z-20">
          ← 10000 mm (10.0m) →
        </div>
        <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 -rotate-90 bg-[#FDFBF7] px-3 py-0.5 rounded-full border border-stone-300 text-[9px] font-mono text-stone-500 font-extrabold tracking-widest uppercase origin-center shadow-2xs z-20">
          ← 10000 mm →
        </div>
        <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 rotate-90 bg-[#FDFBF7] px-3 py-0.5 rounded-full border border-stone-300 text-[9px] font-mono text-stone-500 font-extrabold tracking-widest uppercase origin-center shadow-2xs z-20">
          ← 10000 mm →
        </div>

        {/* Double interior architectural wall */}
        <div className="absolute inset-2 sm:inset-6 border sm:border-2 border-dashed border-stone-200 rounded-2xl sm:rounded-[28px] pointer-events-none"></div>

        {/* Top wall natural window indicator - placed with clean margin */}
        <div className="absolute top-1 sm:top-2 left-8 sm:left-16 right-8 sm:right-16 h-1.5 sm:h-2 bg-sky-200/90 border-b sm:border-b-2 border-sky-300 rounded-b flex items-center justify-center shadow-2xs z-10">
          <span className="text-[7px] sm:text-[9px] text-sky-800 font-bold uppercase tracking-wider px-2 py-0.5 bg-white/95 rounded-full shadow-2xs">
            Hàng Cửa Sổ Hướng Ánh Sáng Tự Nhiên
          </span>
        </div>

        {/* Floor 1: Bottom-left quiet corner partition outline (as shown in plan) */}
        {activeFloor === 1 && (
          <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 w-16 sm:w-32 h-16 sm:h-32 border-t sm:border-t-2 border-r sm:border-r-2 border-stone-200 bg-stone-50/40 rounded-tr-xl sm:rounded-tr-2xl flex items-center justify-center pointer-events-none">
            <span className="text-[7px] sm:text-[8px] text-stone-400 font-bold tracking-wider uppercase">
              Khu Phụ Trợ
            </span>
          </div>
        )}

        {/* Floor 2: Spacious Glass Meeting Zone Enclosure (situated in bottom-left zone around M01, completely clear of top desks) */}
        {activeFloor === 2 && (
          <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 w-40 sm:w-80 h-24 sm:h-44 border sm:border-2 border-dashed border-sky-400/80 bg-sky-50/30 rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 flex flex-col justify-between pointer-events-none z-0">
            <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-extrabold text-sky-900">
              <span className="flex items-center gap-1"><Tv className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-sky-600" /> Vách Kính Cách Âm 100%</span>
              <span className="text-[7px] sm:text-[8px] bg-sky-200/80 text-sky-900 px-1 py-0.5 rounded font-bold">Phòng Họp Riêng</span>
            </div>
            <div className="text-[7px] sm:text-[8px] text-sky-700/80 font-medium">
              Khu vực phòng họp riêng biệt • Có bảng trắng & màn hình trình chiếu
            </div>
          </div>
        )}

        {/* ================= SEATS PLACEMENT CANVAS ================= */}
        <div className="relative w-full h-full">
          {resolvedSeats.map(({ slot, seat }) => {
            const isSelected = selectedTableId === seat.id;
            const colors = getStatusColor(seat.status, isSelected);

            return (
              <div
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute cursor-pointer transition-all duration-300 z-10 hover:z-30 group`}
                title={`${seat.name} (${seat.capacity} người) - Bấm để chọn`}
              >
                {/* 1. HORIZONTAL DUO TABLE (Bàn đôi ngang 2 ghế hai bên trái/phải) */}
                {slot.shape === 'duo_h' && (
                  <div className="flex items-center justify-center">
                    {/* Left Chair */}
                    <div className={`w-1.5 sm:w-3 h-5 sm:h-8 rounded-l-md border ${colors.chairBg} shadow-2xs`}></div>
                    
                    {/* Center Table */}
                    <div className={`w-7 sm:w-11 h-7 sm:h-11 rounded-lg sm:rounded-xl border sm:border-2 mx-0.5 sm:mx-1 flex flex-col items-center justify-center font-extrabold shadow-sm ${colors.tableBg}`}>
                      <span className="text-[9px] sm:text-xs font-black tracking-tight">{seat.code}</span>
                      <span className="text-[6px] sm:text-[8px] opacity-75 font-semibold leading-none">{seat.capacity}C</span>
                    </div>

                    {/* Right Chair */}
                    <div className={`w-1.5 sm:w-3 h-5 sm:h-8 rounded-r-md border ${colors.chairBg} shadow-2xs`}></div>
                  </div>
                )}

                {/* 2. VERTICAL DUO TABLE (Bàn đôi dọc 2 ghế trên/dưới) */}
                {slot.shape === 'duo_v' && (
                  <div className="flex flex-col items-center justify-center">
                    {/* Top Chair */}
                    <div className={`w-5 sm:w-8 h-1.5 sm:h-3 rounded-t-md border ${colors.chairBg} shadow-2xs`}></div>
                    
                    {/* Center Table */}
                    <div className={`w-7 sm:w-11 h-7 sm:h-11 rounded-lg sm:rounded-xl border sm:border-2 my-0.5 sm:my-1 flex flex-col items-center justify-center font-extrabold shadow-sm ${colors.tableBg}`}>
                      <span className="text-[9px] sm:text-xs font-black tracking-tight">{seat.code}</span>
                      <span className="text-[6px] sm:text-[8px] opacity-75 font-semibold leading-none">{seat.capacity}C</span>
                    </div>

                    {/* Bottom Chair */}
                    <div className={`w-5 sm:w-8 h-1.5 sm:h-3 rounded-b-md border ${colors.chairBg} shadow-2xs`}></div>
                  </div>
                )}

                {/* 3. S-CURVE CURVED SOFA BOOTH 1 (Vòng cung dưới, mở hướng lên trên) */}
                {slot.shape === 'curved_up' && (
                  <div className="relative flex flex-col items-center justify-center">
                    {/* Center Round Table */}
                    <div className={`w-8 sm:w-13 h-8 sm:h-13 rounded-full border sm:border-2 flex flex-col items-center justify-center font-extrabold shadow-sm z-10 -mb-2.5 sm:-mb-4 ${colors.tableBg}`}>
                      <span className="text-[9px] sm:text-xs font-black">{seat.code}</span>
                      <span className="text-[6px] sm:text-[8px] opacity-75 font-semibold leading-none">{seat.capacity}C</span>
                    </div>

                    {/* Bottom Curved Crescent Sofa (open upwards) */}
                    <div className={`w-18 sm:w-32 h-9 sm:h-16 rounded-b-full border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-r-2 sm:border-r-4 ${colors.sofaBg} flex items-end justify-around pb-0.5 sm:pb-1 shadow-xs`}>
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-current opacity-30"></span>
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-current opacity-30"></span>
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-current opacity-30"></span>
                    </div>
                  </div>
                )}

                {/* 4. S-CURVE CURVED SOFA BOOTH 2 (Vòng cung trên, mở hướng xuống dưới) */}
                {slot.shape === 'curved_down' && (
                  <div className="relative flex flex-col items-center justify-center">
                    {/* Top Curved Crescent Sofa (open downwards) */}
                    <div className={`w-18 sm:w-32 h-9 sm:h-16 rounded-t-full border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-r-2 sm:border-r-4 ${colors.sofaBg} flex items-start justify-around pt-0.5 sm:pt-1 shadow-xs`}>
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-current opacity-30"></span>
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-current opacity-30"></span>
                      <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-current opacity-30"></span>
                    </div>

                    {/* Center Round Table */}
                    <div className={`w-8 sm:w-13 h-8 sm:h-13 rounded-full border sm:border-2 flex flex-col items-center justify-center font-extrabold shadow-sm z-10 -mt-2.5 sm:-mt-4 ${colors.tableBg}`}>
                      <span className="text-[9px] sm:text-xs font-black">{seat.code}</span>
                      <span className="text-[6px] sm:text-[8px] opacity-75 font-semibold leading-none">{seat.capacity}C</span>
                    </div>
                  </div>
                )}

                {/* 5. CORNER L-SHAPED CURVED LOUNGE (Sofa góc chữ L bo cong + Bàn oval) */}
                {slot.shape === 'corner_lounge' && (
                  <div className="relative flex items-center justify-center">
                    {/* L-shaped surrounding sofa wrapper */}
                    <div className={`w-18 sm:w-32 h-14 sm:h-24 rounded-tr-2xl sm:rounded-tr-3xl rounded-br-2xl sm:rounded-br-3xl rounded-bl-2xl sm:rounded-bl-3xl border sm:border-2 ${colors.sofaBg} p-1 sm:p-2 flex flex-col justify-center items-center shadow-md`}>
                      {/* Oval Coffee Table */}
                      <div className={`w-11 sm:w-18 h-6 sm:h-10 rounded-full border sm:border-2 flex flex-col items-center justify-center font-black shadow-sm ${colors.tableBg}`}>
                        <span className="text-[9px] sm:text-xs font-black">{seat.code}</span>
                        <span className="text-[6px] sm:text-[8px] font-bold opacity-80 leading-none">VIP • {seat.capacity}C</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SINGLE FOCUS DESK */}
                {slot.shape === 'single_desk' && (
                  <div className="flex flex-col items-center justify-center">
                    {/* Desk Partition Screen */}
                    <div className="w-7 sm:w-12 h-0.5 sm:h-1 bg-stone-400 rounded-full mb-0.5"></div>
                    {/* Desk Table */}
                    <div className={`w-7 sm:w-12 h-6 sm:h-10 rounded-lg sm:rounded-xl border sm:border-2 flex flex-col items-center justify-center font-extrabold shadow-sm ${colors.tableBg}`}>
                      <span className="text-[8px] sm:text-xs font-black">{seat.code}</span>
                      <span className="text-[6px] sm:text-[8px] opacity-75">Focus</span>
                    </div>
                    {/* Ergonomic Chair */}
                    <div className={`w-4 sm:w-7 h-1.5 sm:h-2.5 rounded-b-md border ${colors.chairBg} mt-0.5 sm:mt-1`}></div>
                  </div>
                )}

                {/* 7. MEETING ROOM EMBEDDED SEAT BUTTON */}
                {slot.shape === 'meeting_room' && (
                  <div className={`p-1.5 sm:p-5 rounded-xl sm:rounded-2xl border sm:border-2 flex flex-col items-center justify-center shadow-md ${colors.tableBg}`}>
                    <Tv className="w-3.5 sm:w-5 h-3.5 sm:h-5 mb-0.5 sm:mb-1 text-sky-600" />
                    <span className="font-black text-[9px] sm:text-sm">{seat.code}</span>
                    <span className="text-[7px] sm:text-[9px] font-bold mt-0.5">{seat.name}</span>
                    <span className="text-[6px] sm:text-[8px] opacity-80 mt-0.5">{seat.capacity} chỗ</span>
                    {seat.hourlyRate > 0 && (
                      <span className="text-[7px] sm:text-[9px] font-black text-brand-coral mt-0.5">{formatVND(seat.hourlyRate)}</span>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        </div>
      </div>

      {/* ================= MODAL: SEAT INFORMATION POPUP ================= */}
      {activeSeatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 relative animate-scale-up">
            
            {/* Close button */}
            <button
              onClick={() => setActiveSeatModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FCECEF] text-[#FF5C8D] border border-[#FFD9E2] font-black text-lg flex items-center justify-center shrink-0">
                {activeSeatModal.code}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5C8D]">
                  {activeSeatModal.floor === 2 ? 'Tầng 2 (Khu Yên Tĩnh)' : 'Tầng 1 (Khu Sơ Đồ Thực Tế)'}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-[#2E1A12] leading-tight">
                  {activeSeatModal.name}
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {activeSeatModal.zone}
                </span>
              </div>
            </div>

            {/* Status & Pricing strip */}
            <div className="bg-[#FFF9EE] p-3.5 rounded-2xl mb-4 border border-[#FFD9E2]/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Trạng thái</span>
                <span className={`inline-flex items-center gap-1 font-bold ${
                  activeSeatModal.status === 'available'
                    ? 'text-emerald-700'
                    : activeSeatModal.status === 'occupied'
                    ? 'text-stone-600'
                    : activeSeatModal.status === 'reserved'
                    ? 'text-[#FF5C8D]'
                    : 'text-amber-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    activeSeatModal.status === 'available'
                      ? 'bg-emerald-500'
                      : activeSeatModal.status === 'occupied'
                      ? 'bg-stone-400'
                      : activeSeatModal.status === 'reserved'
                      ? 'bg-[#FF5C8D]'
                      : 'bg-amber-500'
                  }`}></span>
                  {activeSeatModal.status === 'available'
                    ? 'Chỗ đang trống (Sẵn sàng)'
                    : activeSeatModal.status === 'occupied'
                    ? 'Đang có khách ngồi'
                    : activeSeatModal.status === 'reserved'
                    ? 'Đã có khách đặt trước'
                    : 'Đang bảo trì thiết bị'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Phụ phí chỗ</span>
                <span className="font-extrabold text-[#FF5C8D]">
                  {activeSeatModal.hourlyRate > 0 ? formatVND(activeSeatModal.hourlyRate) : 'Miễn phí khi gọi nước'}
                </span>
              </div>
            </div>

            {/* Sức chứa */}
            <div className="flex items-center gap-2 text-xs text-[#2E1A12] bg-white p-3 rounded-xl border border-[#FFD9E2]/70 mb-4">
              <Users className="w-4 h-4 text-[#FF5C8D] shrink-0" />
              <span>Sức chứa đề xuất: <strong>{activeSeatModal.capacity} người</strong> (Không bắt buộc số lượng)</span>
            </div>

            {/* Features tags */}
            <div className="mb-6">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Trang bị tiện ích tại chỗ này
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeSeatModal.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-[#FFD9E2]/80 text-[#2E1A12] px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <Zap className="w-3 h-3 text-[#FF5C8D]" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {isOwnerMode ? (
                // Owner Mode: Toggle Status directly or Assign Table
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTable(activeSeatModal);
                      setActiveSeatModal(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-xs shadow-soft transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gán Bàn Này Cho Đơn POS Hiện Tại</span>
                  </button>

                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1.5">
                      Chuyển trạng thái bàn (Đồng bộ khách & chủ quán):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => {
                          onUpdateTableStatus?.(activeSeatModal.id, 'available');
                          setActiveSeatModal(null);
                        }}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-colors border ${
                          activeSeatModal.status === 'available'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        ● Trống
                      </button>
                      <button
                        onClick={() => {
                          onUpdateTableStatus?.(activeSeatModal.id, 'occupied');
                          setActiveSeatModal(null);
                        }}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-colors border ${
                          activeSeatModal.status === 'occupied'
                            ? 'bg-stone-700 text-white border-stone-800 shadow-xs'
                            : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        ● Khách ngồi
                      </button>
                      <button
                        onClick={() => {
                          onUpdateTableStatus?.(activeSeatModal.id, 'reserved');
                          setActiveSeatModal(null);
                        }}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-colors border ${
                          activeSeatModal.status === 'reserved'
                            ? 'bg-[#FF5C8D] text-white border-[#E83D70] shadow-xs'
                            : 'bg-[#FCECEF] text-[#FF5C8D] border-[#FFD9E2] hover:bg-rose-100'
                        }`}
                      >
                        ● Đã đặt
                      </button>
                      <button
                        onClick={() => {
                          onUpdateTableStatus?.(activeSeatModal.id, 'maintenance');
                          setActiveSeatModal(null);
                        }}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-colors border ${
                          activeSeatModal.status === 'maintenance'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        ● Bảo trì
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Customer Mode: Pick Seat
                <button
                  type="button"
                  disabled={activeSeatModal.status !== 'available'}
                  onClick={() => handleConfirmSelect(activeSeatModal)}
                  className={`w-full py-3.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    activeSeatModal.status === 'available'
                      ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white shadow-pink-200 cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {activeSeatModal.status === 'available' ? (
                    <>
                      <span>Chọn Chỗ Ngồi Này Để Đặt Bàn</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <span>Chỗ Này Hiện Không Khả Dụng</span>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
