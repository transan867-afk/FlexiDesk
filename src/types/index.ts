export type NoiseLevel = 'Rất yên tĩnh' | 'Yên tĩnh' | 'Vừa phải' | 'Sôi động';
export type PowerSocketLevel = 'Mỗi bàn đều có' | 'Nhiều ổ cắm' | 'Vừa đủ';
export type LightLevel = 'Tự nhiên' | 'Yếu' | 'Bình thường' | 'Mạnh' | 'Ánh sáng ngập tràn' | 'Ánh sáng tốt' | 'Ấm cúng';

export interface CafeFeatures {
  noiseLevel: NoiseLevel;
  wifiSpeedMbps: number;
  powerSockets: PowerSocketLevel;
  naturalLight: LightLevel;
  meetingRooms: boolean;
  airConditioning: boolean;
  parking: string;
  outdoorSpace: boolean;
}

export type TableType = 'single' | 'double' | 'group' | 'booth' | 'meeting_room' | 'sofa_curved';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type SeatShape = 'single_desk' | 'duo_desk' | 'curved_booth' | 'group_table' | 'meeting_room' | 'bar_seat';

export interface TableSeat {
  id: string;
  cafeId: string;
  name: string;
  code: string;
  type: TableType;
  shape?: SeatShape;
  floor?: number; // 1: Tầng 1, 2: Tầng 2, 3: Tầng 3 / Rooftop (defaults to 1)
  capacity: number;
  features: string[];
  status: TableStatus;
  hourlyRate: number; // 0đ (miễn phí khi gọi nước) hoặc phụ phí phòng riêng
  zone: string;
  position?: {
    x?: number; // 0-100% position on the visual seat map
    y?: number; // 0-100% position on the visual seat map
    row?: number;
    col?: number;
  };
}

export interface MenuCategoryConfig {
  id: string;
  name: string;
  viTitle?: string;
}

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  category: 'coffee' | 'tea' | 'signature' | 'pastry' | 'snack' | string;
  categoryName: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isPopular?: boolean;
  badge?: string;
  sizes?: { name: string; extraPrice: number }[];
  sugarLevels?: string[];
  iceLevels?: string[];
}

export interface CafeReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  workFriendlyTags: string[];
}

export interface Cafe {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  distanceKm?: number;
  rating: number;
  reviewCount: number;
  priceRange: string;
  images: string[];
  heroImage: string;
  floorsCount?: number; // Số lượng tầng (1, 2 hoặc 3)
  floorNames?: Record<number, string>; // Tên từng tầng: e.g. { 1: "Tầng 1 - Barista & Lounge", 2: "Tầng 2 - Silent Study" }
  openHours: {
    open: string;
    close: string;
  };
  features: CafeFeatures;
  categories: string[];
  tables: TableSeat[];
  reviews: CafeReview[];
  ownerId?: string;
  status?: 'active' | 'pending_approval' | 'suspended';
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: string;
  selectedSugar?: string;
  selectedIce?: string;
  extraPrice: number;
  notes?: string;
  totalPrice: number;
}

export type BookingStatus = 'draft' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'full_advance' | 'deposit_10_percent';
export type PaymentGateway = 'momo' | 'zalopay' | 'vnpay' | 'vietqr' | 'credit_card';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface BookingOrder {
  id: string; // e.g. FD-928134
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  cafeHeroImage: string;
  tableId: string;
  tableName: string;
  tableType: TableType;
  tableZone: string;
  floor?: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (linh hoạt theo phút)
  endTime?: string;
  durationHours?: number; // deprecated: FlexiDesk không giới hạn thời gian
  guestCount?: number;
  customerInfo: CustomerInfo;
  cartItems: CartItem[];
  drinkTotal: number;
  seatFee: number;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  remainingAtCafe: number;
  paymentMethod: PaymentMethod;
  paymentGateway?: PaymentGateway;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  qrCodeData: string;
  createdAt: string;
  updatedAt: string;
}

export interface CafeFilterParams {
  searchQuery?: string;
  district?: string;
  noiseLevel?: string;
  wifiMinSpeed?: number;
  hasMeetingRoom?: boolean;
  powerSockets?: string;
  naturalLight?: string;
  favoritesOnly?: boolean;
  date?: string;
  startTime?: string;
  guestCount?: number;
  sortBy?: 'recommended' | 'rating' | 'price_asc' | 'price_desc';
}

/* ================= USER & AUTH ROLES ================= */
export type UserRole = 'customer' | 'partner' | 'admin';
export type MembershipTier = 'free' | 'pro' | 'team';

export interface BusinessRegistration {
  cafeName: string;
  taxCode?: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  approvedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  avatar: string;
  role: UserRole;
  membership?: MembershipTier;
  points?: number;
  savedCafeIds?: string[];
  cafeId?: string;
  cafeName?: string;
  status: 'active' | 'pending' | 'suspended';
  businessRegistration?: BusinessRegistration;
  createdAt: string;
}

export interface PromotionCode {
  code: string;
  name: string;
  description: string;
  discountType: 'fixed' | 'percent';
  value: number;
  minOrder: number;
  isActive: boolean;
}
