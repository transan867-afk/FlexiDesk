import { Cafe, MenuItem, TableSeat, User, BookingOrder, PromotionCode, MenuCategoryConfig } from '../types';
import { MOCK_CAFES, MOCK_MENU_ITEMS } from '../data/cafesData';
import { PROMOTIONS } from '../data/promotionsData';

export const DEFAULT_MENU_CATEGORIES: MenuCategoryConfig[] = [
  { id: 'signature', name: 'Sparkling', viTitle: 'Món Nước Sủi Tăm & Cold Brew Đặc Quyền' },
  { id: 'tea', name: 'Fresh Fruit', viTitle: 'Trà Trái Cây Tươi & Sinh Tố Đá Xay' },
  { id: 'coffee', name: 'Specialty Coffee', viTitle: 'Cà Phê Ý & Phin Đặc Sản' },
  { id: 'pastry', name: 'Bakery & Pastry', viTitle: 'Bánh Nướng Pháp & Tráng Miệng' },
  { id: 'snack', name: 'Light Bites', viTitle: 'Đồ Ăn Nhẹ' },
];

export interface DatabaseSchema {
  users: User[];
  cafes: Cafe[];
  menus: Record<string, MenuItem[]>;
  menuCategories?: Record<string, MenuCategoryConfig[]>;
  bookings: BookingOrder[];
  promotions: PromotionCode[];
  systemStats: {
    version: string;
    lastSaved: string;
  };
}

const STORAGE_KEY = 'flexidesk_full_database_v7';

const DEFAULT_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Quản Trị Viên FlexiDesk',
    email: 'admin@flexidesk.vn',
    password: '123',
    phone: '0909 000 999',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    status: 'active',
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'u-partner-1',
    name: 'Nguyễn Hoàng Long',
    email: 'chuquan@theworkshophaven.vn',
    password: '123',
    phone: '0908 123 456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'partner',
    cafeId: 'cafe-1',
    cafeName: 'Nâu Coffee – Coffee & Workspace',
    status: 'active',
    businessRegistration: {
      cafeName: 'Nâu Coffee',
      taxCode: '0318992011',
      address: '42 Ngô Đức Kế, Phường Bến Nghé, Quận 1',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      phone: '0908 123 456',
      approvedAt: '2026-10-05T09:00:00.000Z',
    },
    createdAt: '2026-10-05T09:00:00.000Z',
  },
  {
    id: 'u-customer-1',
    name: 'Trần Văn Minh',
    email: 'khachhang@gmail.com',
    password: '123',
    phone: '0901 234 567',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    role: 'customer',
    status: 'active',
    createdAt: '2026-10-10T14:30:00.000Z',
  },
];

class DatabaseManager {
  private data: DatabaseSchema;
  private isServerSynced: boolean = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.data = this.loadInitial();
    // Try to sync with server on initialization
    this.fetchFromServer();
    // Check and release any expired bookings on start
    this.checkAndAutoReleaseExpiredBookings();
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        this.checkAndAutoReleaseExpiredBookings();
      }, 5000);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public notify(): void {
    this.listeners.forEach(l => {
      try { l(); } catch (e) { console.error('Error in db subscriber:', e); }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flexidesk_db_updated'));
    }
  }

  private sanitizeCafeImages(cafes: Cafe[]): Cafe[] {
    const defaultHeroMap: Record<string, { hero: string; images: string[] }> = {
      'cafe-1': {
        hero: '/cafes/the-workshop-haven-main.jpg',
        images: ['/cafes/the-workshop-haven-main.jpg', '/cafes/warm-loft-interior.png', '/cafes/sunlit-glasshouse.png', '/cafes/twitter-beans-interior.jpg'],
      },
      'cafe-2': {
        hero: '/cafes/white-glass-garden.png',
        images: ['/cafes/white-glass-garden.png', '/cafes/sunlit-glasshouse.png', '/cafes/warm-loft-interior.png', '/cafes/the-workshop-haven-main.jpg'],
      },
      'cafe-3': {
        hero: '/cafes/pudding-haus-storefront.png',
        images: ['/cafes/pudding-haus-storefront.png', '/cafes/twitter-beans-interior.jpg', '/cafes/warm-loft-interior.png', '/cafes/the-workshop-haven-main.jpg'],
      },
      'cafe-4': {
        hero: '/cafes/sunlit-glasshouse.png',
        images: ['/cafes/sunlit-glasshouse.png', '/cafes/the-workshop-haven-main.jpg', '/cafes/twitter-beans-interior.jpg', '/cafes/warm-loft-interior.png'],
      },
    };

    return (cafes || []).map(cafe => {
      if (defaultHeroMap[cafe.id] && (!cafe.heroImage || cafe.heroImage.includes('unsplash.com'))) {
        return {
          ...cafe,
          heroImage: defaultHeroMap[cafe.id].hero,
          images: defaultHeroMap[cafe.id].images,
        };
      }
      return cafe;
    });
  }

  private sanitizeBookings(bookings: BookingOrder[], cafes: Cafe[]): BookingOrder[] {
    const cafeMap = new Map((cafes || []).map(c => [c.id, c.heroImage]));
    return (bookings || [])
      .filter(b => b.id !== 'FD-712262' && !(b.customerInfo && b.customerInfo.name && b.customerInfo.name.includes('cái loz')))
      .map(b => {
        const currentHero = cafeMap.get(b.cafeId);
        if (currentHero && (!b.cafeHeroImage || b.cafeHeroImage.includes('unsplash.com'))) {
          return {
            ...b,
            cafeHeroImage: currentHero,
          };
        }
        return b;
      });
  }

  private sanitizeTables(cafes: Cafe[], bookings: BookingOrder[]): Cafe[] {
    const activeTableKeys = new Set(
      (bookings || [])
        .filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed')
        .map(b => `${b.cafeId}:${b.tableId}`)
    );
    return (cafes || []).map(cafe => {
      if (cafe.tables) {
        cafe.tables = cafe.tables.map(table => {
          if (table.id === 't-118' && !activeTableKeys.has(`${cafe.id}:${table.id}`)) {
            return { ...table, status: 'available' };
          }
          return table;
        });
      }
      return cafe;
    });
  }

  private sanitizeMenuItems(menus: Record<string, MenuItem[]>): Record<string, MenuItem[]> {
    if (!menus) return MOCK_MENU_ITEMS;
    const result: Record<string, MenuItem[]> = {};
    for (const [cafeId, items] of Object.entries(menus)) {
      result[cafeId] = (items || []).map(item => {
        // If image is an unsplash link or empty, map to updated local /menu/... asset
        if (!item.image || item.image.includes('unsplash.com')) {
          const fallback = MOCK_MENU_ITEMS[cafeId]?.find(m => m.id === item.id);
          if (fallback && fallback.image) {
            return { ...item, image: fallback.image };
          }
        }
        return item;
      });
    }
    return result;
  }

  private loadInitial(): DatabaseSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.cafes) {
          parsed.cafes = this.sanitizeCafeImages(parsed.cafes);
          parsed.cafes = this.sanitizeTables(parsed.cafes, parsed.bookings || []);
        }
        if (parsed && parsed.menus) {
          parsed.menus = this.sanitizeMenuItems(parsed.menus);
        }
        if (parsed && parsed.bookings) {
          parsed.bookings = this.sanitizeBookings(parsed.bookings, parsed.cafes || []);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }

    return this.getDefaultSeed();
  }

  private getDefaultSeed(): DatabaseSchema {
    return {
      users: DEFAULT_USERS,
      cafes: this.sanitizeCafeImages(MOCK_CAFES),
      menus: MOCK_MENU_ITEMS,
      bookings: [],
      promotions: PROMOTIONS.map(p => ({ ...p, isActive: true })),
      systemStats: {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
      },
    };
  }

  /**
   * Fetch latest database from server (data/db.json or static public/db.json)
   */
  public async fetchFromServer(): Promise<void> {
    try {
      let res = await fetch('/api/db');
      if (!res.ok) {
        // Fallback to static db.json on Vercel deployment
        res = await fetch('/db.json');
      }
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.users && serverData.cafes) {
          serverData.cafes = this.sanitizeCafeImages(serverData.cafes);
          serverData.cafes = this.sanitizeTables(serverData.cafes, serverData.bookings || []);
          if (serverData.menus) {
            serverData.menus = this.sanitizeMenuItems(serverData.menus);
          }
          if (serverData.bookings) {
            serverData.bookings = this.sanitizeBookings(serverData.bookings, serverData.cafes);
          }
          this.data = serverData;
          this.saveChanges();
          this.isServerSynced = true;
          this.notify();
          return;
        }
      }
    } catch (err) {
      // In offline or static build, use localStorage
    }
  }

  /**
   * Save database changes to both localStorage and server disk
   */
  private saveChanges(): void {
    this.data.systemStats.lastSaved = new Date().toISOString();
    this.saveLocal();
    this.syncToServer();
    this.notify();
  }

  private saveLocal(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  private async syncToServer(): Promise<void> {
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.data),
      });
    } catch (err) {
      // Fail silently if running outside dev server
    }
  }

  /* ====================== CAFES CRUD ====================== */
  public getCafes(): Cafe[] {
    return this.data.cafes;
  }

  public getCafeById(id: string): Cafe | undefined {
    return this.data.cafes.find(c => c.id === id || c.slug === id);
  }

  public createCafe(cafe: Omit<Cafe, 'id' | 'slug' | 'rating' | 'reviewCount' | 'reviews'>): Cafe {
    const newId = `cafe-${Date.now()}`;
    const slug = cafe.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const newCafe: Cafe = {
      ...cafe,
      id: newId,
      slug,
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      status: 'active',
    };

    this.data.cafes.unshift(newCafe);
    if (!this.data.menus[newId]) {
      this.data.menus[newId] = [];
    }
    this.saveChanges();
    return newCafe;
  }

  public updateCafe(id: string, updates: Partial<Cafe>): Cafe | undefined {
    const index = this.data.cafes.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    this.data.cafes[index] = {
      ...this.data.cafes[index],
      ...updates,
    };
    this.saveChanges();
    return this.data.cafes[index];
  }

  public deleteCafe(id: string): boolean {
    const index = this.data.cafes.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.data.cafes.splice(index, 1);
    delete this.data.menus[id];
    this.saveChanges();
    return true;
  }

  /* ====================== MENU ITEMS CRUD ====================== */
  public getMenuByCafe(cafeId: string): MenuItem[] {
    return this.data.menus[cafeId] || [];
  }

  public createMenuItem(cafeId: string, item: Omit<MenuItem, 'id' | 'cafeId'>): MenuItem {
    if (!this.data.menus[cafeId]) {
      this.data.menus[cafeId] = [];
    }

    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`,
      cafeId,
    };

    this.data.menus[cafeId].push(newItem);
    this.saveChanges();
    return newItem;
  }

  public updateMenuItem(cafeId: string, itemId: string, updates: Partial<MenuItem>): MenuItem | undefined {
    const menu = this.data.menus[cafeId];
    if (!menu) return undefined;

    const index = menu.findIndex(i => i.id === itemId);
    if (index === -1) return undefined;

    menu[index] = { ...menu[index], ...updates };
    this.saveChanges();
    return menu[index];
  }

  public deleteMenuItem(cafeId: string, itemId: string): boolean {
    const menu = this.data.menus[cafeId];
    if (!menu) return false;

    const index = menu.findIndex(i => i.id === itemId);
    if (index === -1) return false;

    menu.splice(index, 1);
    this.saveChanges();
    return true;
  }

  public toggleMenuItemAvailability(cafeId: string, itemId: string): boolean {
    const menu = this.data.menus[cafeId];
    if (!menu) return false;

    const item = menu.find(i => i.id === itemId);
    if (!item) return false;

    item.isAvailable = !item.isAvailable;
    this.saveChanges();
    return item.isAvailable;
  }

  /* ====================== MENU CATEGORIES CRUD ====================== */
  public getMenuCategories(cafeId: string): MenuCategoryConfig[] {
    if (!this.data.menuCategories) {
      this.data.menuCategories = {};
    }
    if (!this.data.menuCategories[cafeId] || this.data.menuCategories[cafeId].length === 0) {
      this.data.menuCategories[cafeId] = [...DEFAULT_MENU_CATEGORIES];
      this.saveChanges();
    }
    return this.data.menuCategories[cafeId];
  }

  public saveMenuCategories(cafeId: string, categories: MenuCategoryConfig[]): MenuCategoryConfig[] {
    if (!this.data.menuCategories) {
      this.data.menuCategories = {};
    }
    this.data.menuCategories[cafeId] = categories;
    this.saveChanges();
    return categories;
  }

  /* ====================== TABLES CRUD ====================== */
  public getTablesByCafe(cafeId: string): TableSeat[] {
    const cafe = this.getCafeById(cafeId);
    return cafe ? cafe.tables : [];
  }

  public createTable(cafeId: string, table: Omit<TableSeat, 'id' | 'cafeId'>): TableSeat | undefined {
    const cafe = this.getCafeById(cafeId);
    if (!cafe) return undefined;

    const newTable: TableSeat = {
      ...table,
      id: `t-${Date.now()}`,
      cafeId,
    };

    cafe.tables.push(newTable);
    this.saveChanges();
    return newTable;
  }

  public updateTable(cafeId: string, tableId: string, updates: Partial<TableSeat>): TableSeat | undefined {
    const cafe = this.getCafeById(cafeId);
    if (!cafe) return undefined;

    const index = cafe.tables.findIndex(t => t.id === tableId);
    if (index === -1) return undefined;

    cafe.tables[index] = { ...cafe.tables[index], ...updates };
    this.saveChanges();
    return cafe.tables[index];
  }

  public deleteTable(cafeId: string, tableId: string): boolean {
    const cafe = this.getCafeById(cafeId);
    if (!cafe) return false;

    const index = cafe.tables.findIndex(t => t.id === tableId);
    if (index === -1) return false;

    cafe.tables.splice(index, 1);
    this.saveChanges();
    return true;
  }

  public updateTableStatus(cafeId: string, tableId: string, status: TableSeat['status']): boolean {
    const cafe = this.getCafeById(cafeId);
    if (!cafe) return false;

    const table = cafe.tables.find(t =>
      t.id === tableId ||
      t.code.toLowerCase() === tableId.toLowerCase() ||
      `${cafeId}-${t.code.toLowerCase()}` === tableId.toLowerCase()
    );
    if (!table) return false;

    table.status = status;
    this.saveChanges();
    return true;
  }

  /* ====================== USERS & AUTH ====================== */
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      createdAt: new Date().toISOString(),
    };

    // If partner is assigned to a cafe
    if (newUser.role === 'partner' && newUser.cafeId) {
      const cafe = this.getCafeById(newUser.cafeId);
      if (cafe) {
        newUser.cafeName = cafe.name;
        cafe.ownerId = newUser.id;
      }
    }

    this.data.users.push(newUser);
    this.saveChanges();
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    // Handle cafeId change
    if (updates.cafeId !== undefined) {
      if (updates.cafeId) {
        const cafe = this.getCafeById(updates.cafeId);
        if (cafe) {
          updates.cafeName = cafe.name;
          cafe.ownerId = userId;
        }
      } else {
        updates.cafeName = undefined;
        if (user.cafeId) {
          const oldCafe = this.getCafeById(user.cafeId);
          if (oldCafe && oldCafe.ownerId === userId) {
            oldCafe.ownerId = undefined;
          }
        }
      }
    }

    Object.assign(user, updates);
    this.saveChanges();
    return user;
  }

  public assignPartnerToCafe(userId: string, cafeId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    // Clear previous assignment
    if (user.cafeId && user.cafeId !== cafeId) {
      const oldCafe = this.getCafeById(user.cafeId);
      if (oldCafe && oldCafe.ownerId === userId) {
        oldCafe.ownerId = undefined;
      }
    }

    if (!cafeId) {
      user.cafeId = undefined;
      user.cafeName = undefined;
      this.saveChanges();
      return true;
    }

    const targetCafe = this.getCafeById(cafeId);
    if (!targetCafe) return false;

    // Ensure role is partner
    user.role = 'partner';
    user.cafeId = targetCafe.id;
    user.cafeName = targetCafe.name;
    targetCafe.ownerId = user.id;

    this.saveChanges();
    return true;
  }

  public updateUserRole(userId: string, newRole: User['role']): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    user.role = newRole;
    if (newRole !== 'partner' && user.cafeId) {
      const oldCafe = this.getCafeById(user.cafeId);
      if (oldCafe && oldCafe.ownerId === userId) {
        oldCafe.ownerId = undefined;
      }
      user.cafeId = undefined;
      user.cafeName = undefined;
    }
    this.saveChanges();
    return true;
  }

  public updateUserStatus(userId: string, status: User['status']): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    user.status = status;
    this.saveChanges();
    return true;
  }

  public deleteUser(userId: string): boolean {
    const index = this.data.users.findIndex(u => u.id === userId);
    if (index === -1) return false;

    const user = this.data.users[index];
    if (user.cafeId) {
      const cafe = this.getCafeById(user.cafeId);
      if (cafe && cafe.ownerId === userId) {
        cafe.ownerId = undefined;
      }
    }

    this.data.users.splice(index, 1);
    this.saveChanges();
    return true;
  }

  /* ====================== BOOKINGS CRUD ====================== */
  public checkAndAutoReleaseExpiredBookings(): BookingOrder[] {
    const now = Date.now();
    const newlyExpired: BookingOrder[] = [];
    let hasChanges = false;

    for (const booking of this.data.bookings) {
      if (booking.bookingStatus === 'confirmed') {
        const [year, month, day] = (booking.date || '').split('-').map(Number);
        const [hour, minute] = (booking.startTime || '').split(':').map(Number);
        if (year && month && day && !isNaN(hour) && !isNaN(minute)) {
          const checkInDate = new Date(year, month - 1, day, hour, minute, 0);
          const checkInTime = checkInDate.getTime();
          const holdEndTime = checkInTime + 15 * 60 * 1000; // 15 phút giữ bàn

          if (now > holdEndTime) {
            booking.bookingStatus = 'expired';
            booking.updatedAt = new Date().toISOString();
            const autoNote = 'Hệ thống tự động giải phóng bàn do quá 15 phút chưa check-in';
            if (!booking.customerInfo.notes?.includes('giải phóng')) {
              booking.customerInfo.notes = booking.customerInfo.notes
                ? `${booking.customerInfo.notes} | ${autoNote}`
                : autoNote;
            }
            newlyExpired.push(booking);
            hasChanges = true;

            // Revert table status to available
            if (booking.cafeId && booking.tableId) {
              const cafe = this.getCafeById(booking.cafeId);
              if (cafe) {
                const table = cafe.tables.find(t =>
                  t.id === booking.tableId ||
                  t.code.toLowerCase() === booking.tableId.toLowerCase() ||
                  `${booking.cafeId}-${t.code.toLowerCase()}` === booking.tableId.toLowerCase()
                );
                if (table && (table.status === 'reserved' || table.status === 'occupied')) {
                  table.status = 'available';
                }
              }
            }
          }
        }
      }
    }

    if (hasChanges) {
      this.saveChanges();
    }

    return newlyExpired;
  }

  public getBookings(): BookingOrder[] {
    this.checkAndAutoReleaseExpiredBookings();
    return this.data.bookings;
  }

  public getBookingsByCafe(cafeId: string): BookingOrder[] {
    this.checkAndAutoReleaseExpiredBookings();
    return this.data.bookings.filter(b => b.cafeId === cafeId);
  }

  public getBookingsByUser(emailOrPhone: string): BookingOrder[] {
    this.checkAndAutoReleaseExpiredBookings();
    return this.data.bookings.filter(
      b => b.customerInfo.email === emailOrPhone || b.customerInfo.phone === emailOrPhone
    );
  }

  public saveBooking(booking: BookingOrder): BookingOrder {
    const existingIndex = this.data.bookings.findIndex(b => b.id === booking.id);
    if (existingIndex > -1) {
      this.data.bookings[existingIndex] = booking;
    } else {
      this.data.bookings.unshift(booking);
    }
    this.saveChanges();
    return booking;
  }

  public updateBookingStatus(
    bookingId: string,
    bookingStatus: BookingOrder['bookingStatus'],
    paymentStatus?: BookingOrder['paymentStatus']
  ): boolean {
    const booking = this.data.bookings.find(b => b.id === bookingId);
    if (!booking) return false;

    booking.bookingStatus = bookingStatus;
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    booking.updatedAt = new Date().toISOString();
    this.saveChanges();
    return true;
  }

  public deleteBooking(bookingId: string): boolean {
    const index = this.data.bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return false;

    const booking = this.data.bookings[index];
    if (booking.cafeId && booking.tableId) {
      const cafe = this.getCafeById(booking.cafeId);
      if (cafe) {
        const table = cafe.tables.find(t =>
          t.id === booking.tableId ||
          t.code.toLowerCase() === booking.tableId.toLowerCase() ||
          `${booking.cafeId}-${t.code.toLowerCase()}` === booking.tableId.toLowerCase()
        );
        if (table && (table.status === 'occupied' || table.status === 'reserved')) {
          table.status = 'available';
        }
      }
    }

    this.data.bookings.splice(index, 1);
    this.saveChanges();
    return true;
  }

  /* ====================== PROMOTIONS CRUD ====================== */
  public getPromotions(): PromotionCode[] {
    return this.data.promotions;
  }

  public createPromotion(promo: PromotionCode): PromotionCode {
    const existingIndex = this.data.promotions.findIndex(p => p.code === promo.code);
    if (existingIndex > -1) {
      this.data.promotions[existingIndex] = promo;
    } else {
      this.data.promotions.push(promo);
    }
    this.saveChanges();
    return promo;
  }

  public deletePromotion(code: string): boolean {
    const index = this.data.promotions.findIndex(p => p.code === code);
    if (index === -1) return false;

    this.data.promotions.splice(index, 1);
    this.saveChanges();
    return true;
  }

  /* ====================== BACKUP & RESTORE ====================== */
  public exportJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr) as DatabaseSchema;
      if (!parsed.users || !parsed.cafes) {
        return { success: false, message: 'Dữ liệu file JSON không đúng cấu trúc FlexiDesk!' };
      }
      this.data = parsed;
      this.saveChanges();
      return { success: true, message: 'Khôi phục dữ liệu từ file thành công!' };
    } catch (e) {
      return { success: false, message: 'File JSON không hợp lệ: ' + String(e) };
    }
  }

  public resetToDefault(): void {
    this.data = this.getDefaultSeed();
    this.saveChanges();
  }
}

export const db = new DatabaseManager();
