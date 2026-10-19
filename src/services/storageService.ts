const STORAGE_KEYS = {
  CART: 'flexidesk_cart',
  CURRENT_BOOKING_DRAFT: 'flexidesk_booking_draft',
  BOOKINGS_HISTORY: 'flexidesk_bookings_history',
  RESERVED_TABLES: 'flexidesk_reserved_tables',
};

export const storageService = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data === null) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage key "${key}":`, e);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing localStorage key "${key}":`, e);
    }
  },

  getCart<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.CART, defaultValue);
  },

  setCart<T>(cart: T): void {
    this.setItem(STORAGE_KEYS.CART, cart);
  },

  clearCart(): void {
    this.removeItem(STORAGE_KEYS.CART);
  },

  getBookingDraft<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.CURRENT_BOOKING_DRAFT, defaultValue);
  },

  setBookingDraft<T>(draft: T): void {
    this.setItem(STORAGE_KEYS.CURRENT_BOOKING_DRAFT, draft);
  },

  clearBookingDraft(): void {
    this.removeItem(STORAGE_KEYS.CURRENT_BOOKING_DRAFT);
  },

  getBookingsHistory<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.BOOKINGS_HISTORY, defaultValue);
  },

  setBookingsHistory<T>(history: T): void {
    this.setItem(STORAGE_KEYS.BOOKINGS_HISTORY, history);
  },

  getReservedTables(): Record<string, boolean> {
    return this.getItem<Record<string, boolean>>(STORAGE_KEYS.RESERVED_TABLES, {});
  },

  markTableReserved(tableKey: string): void {
    const reserved = this.getReservedTables();
    reserved[tableKey] = true;
    this.setItem(STORAGE_KEYS.RESERVED_TABLES, reserved);
  },

  releaseTable(tableKey: string): void {
    const reserved = this.getReservedTables();
    delete reserved[tableKey];
    this.setItem(STORAGE_KEYS.RESERVED_TABLES, reserved);
  }
};
