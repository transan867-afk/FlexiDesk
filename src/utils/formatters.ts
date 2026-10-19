import { CartItem, PaymentMethod } from '../types';

/**
 * Format currency to Vietnamese Dong (VNĐ)
 * e.g. 45000 -> "45.000 đ"
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 đ';
  }
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

/**
 * Format date string (YYYY-MM-DD) to friendly Vietnamese date
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${dayName}, ${d}/${m}/${y}`;
}

/**
 * Unique booking ID generator (e.g., FD-892143)
 */
export function generateBookingId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `FD-${randomNum}`;
}

/**
 * Shared central financial calculator for booking & checkout
 * Business rule:
 * - FlexiDesk KHÔNG GIỚI HẠN THỜI GIAN:
 *   + Drink Total: tổng giá trị đồ uống trong giỏ hàng
 *   + Seat Fee: phụ phí chỗ ngồi cố định (0đ đối với bàn thường khi gọi nước, hoặc phụ phí phòng họp riêng)
 *   + Subtotal: Drink Total + Seat Fee
 *   + Total Amount: Subtotal - Discount
 *   + If PaymentMethod is 'deposit_10_percent':
 *       Deposit: 10% of Total Amount
 *       Remaining: 90% payable at cafe upon check-in
 *   + If PaymentMethod is 'full_advance':
 *       Deposit: 100% of Total Amount
 *       Remaining: 0 đ
 */
export function calculateFinancials({
  cartItems,
  seatFee = 0,
  paymentMethod = 'deposit_10_percent',
  discountAmount = 0,
}: {
  cartItems: CartItem[];
  seatFee?: number;
  paymentMethod?: PaymentMethod;
  discountAmount?: number;
}) {
  const drinkTotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const subtotal = drinkTotal + seatFee;
  const appliedDiscount = Math.min(discountAmount, subtotal);
  const totalAmount = Math.max(0, subtotal - appliedDiscount);

  let depositAmount = totalAmount;
  let remainingAtCafe = 0;

  if (paymentMethod === 'deposit_10_percent') {
    // Deposit 10% rounded to nearest thousand VND
    depositAmount = Math.round((totalAmount * 0.1) / 1000) * 1000;
    remainingAtCafe = totalAmount - depositAmount;
  }

  return {
    drinkTotal,
    seatFee,
    subtotal,
    discountAmount: appliedDiscount,
    totalAmount,
    depositAmount,
    remainingAtCafe,
  };
}
