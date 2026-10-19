export interface PromotionCode {
  code: string;
  name: string;
  description: string;
  discountType: 'fixed' | 'percent';
  value: number; // e.g. 20000 (fixed) or 15 (15%)
  minOrder: number;
}

export const PROMOTIONS: PromotionCode[] = [
  {
    code: 'FLEXI20',
    name: 'Chào Bạn Mới – Giảm 20.000đ',
    description: 'Giảm ngay 20.000đ cho đơn đặt chỗ và đồ uống đầu tiên từ 60.000đ.',
    discountType: 'fixed',
    value: 20000,
    minOrder: 60000,
  },
  {
    code: 'CHILLDESK',
    name: 'Khởi Nghiệp Sáng Tạo – Giảm 15%',
    description: 'Giảm 15% tổng tiền cho đơn làm việc từ 100.000đ.',
    discountType: 'percent',
    value: 15,
    minOrder: 100000,
  },
  {
    code: 'COFFEEHAPPY',
    name: 'Happy Hour Cà Phê – Giảm 30.000đ',
    description: 'Giảm 30.000đ cho đơn từ 150.000đ.',
    discountType: 'fixed',
    value: 30000,
    minOrder: 150000,
  }
];

export function applyDiscountCode(codeStr: string, subtotal: number): { valid: boolean; discountAmount: number; message: string } {
  const cleanCode = codeStr.trim().toUpperCase();
  const promo = PROMOTIONS.find(p => p.code === cleanCode);

  if (!promo) {
    return { valid: false, discountAmount: 0, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };
  }

  if (subtotal < promo.minOrder) {
    return { 
      valid: false, 
      discountAmount: 0, 
      message: `Đơn hàng tối thiểu để áp dụng mã này là ${new Intl.NumberFormat('vi-VN').format(promo.minOrder)}đ.` 
    };
  }

  let discount = 0;
  if (promo.discountType === 'fixed') {
    discount = promo.value;
  } else {
    discount = Math.round((subtotal * promo.value) / 100);
  }

  return {
    valid: true,
    discountAmount: Math.min(discount, subtotal),
    message: `Áp dụng thành công: ${promo.name}!`
  };
}
