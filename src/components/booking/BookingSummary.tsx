import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useCart } from '../../context/CartContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { ShoppingBag, Trash2, Tag, Check, AlertCircle, ShieldCheck } from 'lucide-react';

export const BookingSummary: React.FC<{ hideCheckoutButton?: boolean; onProceedToCheckout?: () => void }> = ({
  hideCheckoutButton = false,
  onProceedToCheckout,
}) => {
  const {
    cafe,
    table,
    date,
    startTime,
    paymentMethod,
    setPaymentMethod,
    drinkTotal,
    seatFee,
    subtotal,
    discountCode,
    discountAmount,
    totalAmount,
    depositAmount,
    remainingAtCafe,
    applyPromo,
    removePromo,
  } = useBooking();

  const { items: cartItems, updateQuantity, removeItem } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    if (res.success) {
      setPromoMessage({ type: 'success', text: res.message });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setPromoMessage(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FFD9E2]/80 shadow-card sticky top-24">
      <h3 className="text-lg font-extrabold text-[#2E1A12] mb-4 flex items-center justify-between">
        <span>Tóm Tắt Đặt Chỗ</span>
        <span className="text-xs bg-[#FCECEF] text-[#FF5C8D] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#FFD9E2]">
          ✓ Không giới hạn giờ
        </span>
      </h3>

      {/* Cafe & Table preview */}
      <div className="bg-[#FFF9EE] p-4 rounded-2xl mb-4 text-xs space-y-1.5 border border-[#FFD9E2]/70">
        <div className="flex justify-between font-bold text-[#2E1A12]">
          <span>Quán:</span>
          <span className="text-[#FF5C8D] font-black truncate max-w-[180px] text-right">
            {cafe ? cafe.name : 'Chưa chọn quán'}
          </span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Chỗ ngồi:</span>
          <span className="font-semibold text-[#2E1A12]">
            {table ? `${table.name} (${table.code})` : 'Chưa chọn bàn'}
          </span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Thời gian check-in:</span>
          <span className="font-semibold text-[#2E1A12]">
            Từ {startTime} (Tự do đến trễ/sớm)
          </span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Ngày:</span>
          <span className="font-semibold text-[#2E1A12]">{formatDateVN(date)}</span>
        </div>
      </div>

      {/* Selected Drinks / Items */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
          <span>Đồ uống đã chọn ({cartItems.length})</span>
          <ShoppingBag className="w-3.5 h-3.5" />
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-4 bg-rose-50/60 rounded-2xl border border-dashed border-rose-200 text-xs text-rose-700">
            <span className="font-bold block">Chưa chọn món nước nào (Bắt buộc)</span>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Vui lòng bấm "+ Thêm" vào ít nhất 1 món ở thực đơn bên cạnh.
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-stone-900 leading-tight">
                    {item.menuItem.name}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {[item.selectedSize, item.selectedSugar, item.selectedIce].filter(Boolean).join(' • ')}
                  </div>
                </div>

                {/* Quantity buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center font-bold text-[11px]"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center font-bold text-[11px]"
                  >
                    +
                  </button>
                  <span className="font-bold text-[#FF5C8D] w-16 text-right ml-1">
                    {formatVND(item.totalPrice)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-stone-300 hover:text-rose-500 ml-1 p-0.5"
                    title="Xóa món"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promo Code Input */}
      <div className="mb-5 pt-3 border-t border-stone-100">
        {discountCode ? (
          <div className="flex items-center justify-between bg-[#FCECEF] text-[#FF5C8D] border border-[#FFD9E2] p-2.5 rounded-xl text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF5C8D]" />
              <span>Mã <strong>{discountCode}</strong> (-{formatVND(discountAmount)})</span>
            </div>
            <button
              onClick={removePromo}
              className="text-stone-400 hover:text-rose-500 text-[11px] font-bold"
            >
              Hủy
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <input
              type="text"
              placeholder="Mã giảm giá (FLEXI20, CHILLDESK)..."
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] focus:outline-none focus:ring-1 focus:ring-[#FF5C8D] uppercase"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#2E1A12] hover:bg-[#4A2B1E] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Áp dụng
            </button>
          </form>
        )}

        {promoMessage && (
          <div className={`mt-2 text-[11px] font-semibold flex items-center gap-1 ${
            promoMessage.type === 'success' ? 'text-[#FF5C8D]' : 'text-brand-coral'
          }`}>
            {promoMessage.type === 'success' ? <Check className="w-3 h-3 text-[#FF5C8D]" /> : <AlertCircle className="w-3 h-3" />}
            <span>{promoMessage.text}</span>
          </div>
        )}
      </div>

      {/* Payment Method Switcher */}
      <div className="mb-5 space-y-2 pt-3 border-t border-stone-100">
        <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block">
          Chọn chính sách thanh toán
        </label>

        <div
          onClick={() => setPaymentMethod('deposit_10_percent')}
          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'deposit_10_percent'
              ? 'border-[#FF5C8D] bg-[#FCECEF]/60'
              : 'border-stone-200 bg-white hover:bg-[#FFF9EE]/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'deposit_10_percent'}
                onChange={() => setPaymentMethod('deposit_10_percent')}
                className="text-[#FF5C8D] focus:ring-[#FF5C8D] accent-[#FF5C8D]"
              />
              <span className="text-xs font-bold text-[#2E1A12]">
                Đặt cọc 10% giữ chỗ (Khuyên dùng)
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#FF5C8D] bg-white px-2 py-0.5 rounded-full border border-[#FFD9E2]">
              Linh hoạt
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 pl-5">
            Chỉ thanh toán trước 10% để giữ chỗ ngồi. 90% còn lại thanh toán tại quầy khi check-in.
          </p>
        </div>

        <div
          onClick={() => setPaymentMethod('full_advance')}
          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'full_advance'
              ? 'border-[#FF5C8D] bg-[#FCECEF]/60'
              : 'border-stone-200 bg-white hover:bg-[#FFF9EE]/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'full_advance'}
              onChange={() => setPaymentMethod('full_advance')}
              className="text-[#FF5C8D] focus:ring-[#FF5C8D] accent-[#FF5C8D]"
            />
            <span className="text-xs font-bold text-[#2E1A12]">
              Thanh toán toàn bộ 100% trước
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 pl-5">
            Thanh toán trọn gói, đến quán chỉ cần đưa mã QR và nhận chỗ & đồ uống ngay.
          </p>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-2 pt-4 border-t border-stone-200 text-xs">
        <div className="flex justify-between text-stone-600">
          <span>Tiền đồ uống:</span>
          <span>{formatVND(drinkTotal)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Phí đặt chỗ ngồi (Không giới hạn):</span>
          <span>{seatFee > 0 ? formatVND(seatFee) : '0 đ (Miễn phí)'}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-brand-coral font-semibold">
            <span>Giảm giá ({discountCode}):</span>
            <span>-{formatVND(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-extrabold text-[#2E1A12] pt-2 border-t border-stone-100">
          <span>Tổng tiền đơn:</span>
          <span className="text-[#FF5C8D]">{formatVND(totalAmount)}</span>
        </div>

        {/* Deposit breakdown if 10% */}
        {paymentMethod === 'deposit_10_percent' ? (
          <div className="bg-[#FFF9EE] p-3 rounded-2xl space-y-1.5 mt-2 border border-[#FFD9E2]/70">
            <div className="flex justify-between font-extrabold text-xs text-[#2E1A12]">
              <span>Số tiền cần thanh toán trước (10% cọc):</span>
              <span className="text-sm font-black text-[#FF5C8D]">{formatVND(depositAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-600">
              <span>Còn lại thanh toán tại quán (90%):</span>
              <span className="font-bold text-[#2E1A12]">{formatVND(remainingAtCafe)}</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFF9EE] p-3 rounded-2xl flex justify-between font-extrabold text-xs text-[#2E1A12] mt-2 border border-[#FFD9E2]/70">
            <span>Số tiền thanh toán trước (100%):</span>
            <span className="text-sm font-black text-[#FF5C8D]">{formatVND(totalAmount)}</span>
          </div>
        )}
      </div>

      {/* Checkout Button */}
      {!hideCheckoutButton && onProceedToCheckout && (
        <div className="mt-6 space-y-2">
          {(!table || cartItems.length === 0) && (
            <div className="text-[11px] font-semibold text-rose-700 bg-[#FCECEF] p-2.5 rounded-xl border border-[#FFD9E2] flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF5C8D]" />
              <span>
                {!table && cartItems.length === 0
                  ? 'Vui lòng chọn cả chỗ ngồi & ít nhất 1 món nước'
                  : !table
                  ? 'Vui lòng chọn một chỗ ngồi trên sơ đồ'
                  : 'Vui lòng chọn ít nhất 1 món nước'}
              </span>
            </div>
          )}

          <button
            onClick={onProceedToCheckout}
            disabled={!table || cartItems.length === 0}
            className={`w-full font-extrabold text-sm py-4 rounded-full transition-all flex items-center justify-center gap-2 ${
              table && cartItems.length > 0
                ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white shadow-pink-200 shadow-lg transform hover:-translate-y-0.5 cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {table && cartItems.length > 0
                ? `Tiếp tục xác nhận (${cartItems.length} món + Bàn ${table.code})`
                : 'Tiếp tục đến xác nhận đặt chỗ'}
            </span>
          </button>
        </div>
      )}

    </div>
  );
};
