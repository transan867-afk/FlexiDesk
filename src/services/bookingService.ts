import { BookingOrder, PaymentGateway, PaymentMethod } from '../types';
import { db } from './databaseService';
import { generateBookingId } from '../utils/formatters';

export const bookingService = {
  /**
   * Save a newly created booking order
   */
  createBooking(order: Omit<BookingOrder, 'id' | 'createdAt' | 'updatedAt' | 'qrCodeData'>): BookingOrder {
    const id = generateBookingId();
    const now = new Date().toISOString();

    const qrPayload = JSON.stringify({
      bookingId: id,
      cafe: order.cafeName,
      table: order.tableName,
      date: order.date,
      time: order.startTime,
      guest: order.customerInfo.name,
      phone: order.customerInfo.phone,
      platform: 'FlexiDesk_MVP_Platform',
    });

    const newBooking: BookingOrder = {
      ...order,
      id,
      qrCodeData: qrPayload,
      createdAt: now,
      updatedAt: now,
    };

    db.saveBooking(newBooking);

    // Update table status in database
    db.updateTableStatus(order.cafeId, order.tableId, 'reserved');

    return newBooking;
  },

  /**
   * Get booking by unique ID
   */
  getBookingById(id: string): BookingOrder | undefined {
    return db.getBookings().find(b => b.id === id);
  },

  /**
   * Get all bookings
   */
  getAllBookings(): BookingOrder[] {
    return db.getBookings();
  },

  /**
   * Get bookings for a specific cafe
   */
  getBookingsByCafe(cafeId: string): BookingOrder[] {
    return db.getBookingsByCafe(cafeId);
  },

  /**
   * Simulate payment transition
   */
  simulatePayment(
    bookingId: string,
    success: boolean,
    gateway: PaymentGateway = 'momo',
    method: PaymentMethod = 'deposit_10_percent'
  ): { success: boolean; booking?: BookingOrder; error?: string } {
    const booking = this.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Không tìm thấy đơn đặt chỗ trong hệ thống.' };
    }

    if (success) {
      booking.paymentStatus = 'paid';
      booking.bookingStatus = 'confirmed';
      booking.paymentGateway = gateway;
      booking.paymentMethod = method;
      db.saveBooking(booking);

      return { success: true, booking };
    } else {
      booking.paymentStatus = 'failed';
      booking.bookingStatus = 'pending_payment';
      db.saveBooking(booking);

      return {
        success: false,
        booking,
        error: 'Giao dịch thanh toán mô phỏng không thành công (Đã ghi nhận trạng thái pending_payment).'
      };
    }
  },

  /**
   * Confirm check-in at cafe counter (for Cafe Owner POS)
   */
  confirmCheckIn(bookingId: string): boolean {
    const booking = this.getBookingById(bookingId);
    if (!booking) return false;

    booking.bookingStatus = 'completed';
    booking.paymentStatus = 'paid';
    booking.remainingAtCafe = 0;
    db.saveBooking(booking);

    // Set table to occupied
    db.updateTableStatus(booking.cafeId, booking.tableId, 'occupied');
    return true;
  },

  /**
   * Cancel an existing booking
   */
  cancelBooking(id: string): boolean {
    const booking = this.getBookingById(id);
    if (!booking) return false;

    db.updateBookingStatus(id, 'cancelled', booking.paymentStatus === 'paid' ? 'refunded' : undefined);

    // Release table
    db.updateTableStatus(booking.cafeId, booking.tableId, 'available');
    return true;
  },

  /**
   * Delete a booking permanently from database
   */
  deleteBooking(id: string): boolean {
    return db.deleteBooking(id);
  }
};
