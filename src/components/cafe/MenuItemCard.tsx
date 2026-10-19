import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { formatVND } from '../../utils/formatters';
import { Plus, Check, Star, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addItem, items } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(
    item.sizes && item.sizes.length > 0 ? item.sizes[0].name : ''
  );
  const [selectedSugar, setSelectedSugar] = useState<string>(
    item.sugarLevels && item.sugarLevels.length > 0 ? item.sugarLevels[0] : ''
  );
  const [selectedIce, setSelectedIce] = useState<string>(
    item.iceLevels && item.iceLevels.length > 0 ? item.iceLevels[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const selectedSizeObj = item.sizes?.find(s => s.name === selectedSize);
  const extraPrice = selectedSizeObj?.extraPrice || 0;
  const currentTotal = (item.price + extraPrice) * quantity;

  // Number of this item currently in cart
  const inCartCount = items
    .filter(i => i.menuItem.id === item.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  // Badge text matching the reference image ("Must try" / "Best seller")
  const badgeText = item.badge || (item.isPopular ? (item.category === 'signature' || item.category === 'tea' ? 'Must try' : 'Best seller') : null);
  const priceNumber = item.price >= 1000 ? Math.round(item.price / 1000) : item.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If item has sizes or customizations, open customization modal
    if (item.sizes || item.sugarLevels || item.iceLevels) {
      setModalOpen(true);
    } else {
      addItem(item, { quantity: 1, extraPrice: 0 });
      triggerFeedback();
    }
  };

  const handleConfirmAdd = () => {
    addItem(item, {
      selectedSize,
      selectedSugar,
      selectedIce,
      extraPrice,
      notes: notes.trim(),
      quantity,
    });
    setModalOpen(false);
    triggerFeedback();
  };

  const triggerFeedback = () => {
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <>
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-[#FFD9E2]/70 shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
        <div>
          {/* Glass Presentation Stage with Ambient Shadow & Stamp Badge */}
          <div
            onClick={() => setModalOpen(true)}
            className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF9EE]/60 to-[#FCECEF]/30 p-2 sm:p-3 border border-[#FFD9E2]/40 group-hover:border-[#FF5C8D]/40 transition-colors flex items-center justify-center cursor-pointer"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover sm:object-contain rounded-xl transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm"
              />
              {/* Soft subtle bottom glass shadow to anchor it to the card */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3/4 h-2.5 bg-[#2E1A12]/10 blur-sm rounded-full pointer-events-none" />
            </div>

            {/* Vintage Stamp Badge (Must try / Best seller) */}
            {badgeText && (
              <div className={`absolute top-2.5 ${badgeText === 'Best seller' ? 'left-2.5 -rotate-6' : 'right-2.5 rotate-6'} z-10 transition-transform group-hover:rotate-0 pointer-events-none`}>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#FF5C8D] bg-white/95 text-[#FF5C8D] font-extrabold text-[11px] tracking-wide shadow-2xs">
                  {badgeText}
                </span>
              </div>
            )}
          </div>

          {/* Item Info: Price -> Name -> Ingredients */}
          <div className="mt-3.5">
            {/* Price: Big bold number with k */}
            <div className="flex items-baseline">
              <span className="font-black text-2xl sm:text-3xl text-[#2E1A12] tracking-tight leading-none">
                {priceNumber}
              </span>
              <span className="font-black text-base sm:text-lg text-[#2E1A12] ml-0.5">
                k
              </span>
            </div>

            {/* Name: Original font */}
            <h4
              onClick={() => setModalOpen(true)}
              className="font-extrabold text-base sm:text-lg text-[#2E1A12] leading-snug group-hover:text-[#FF5C8D] transition-colors mt-1 cursor-pointer line-clamp-1"
            >
              {item.name}
            </h4>

            {/* Ingredients / Description subtext */}
            <p className="text-xs text-stone-500 font-sans mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        {/* Ordering Action Footer */}
        <div className="mt-4 pt-3 border-t border-[#FFD9E2]/50 flex items-center justify-between gap-2">
          {inCartCount > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5C8D] bg-[#FCECEF] px-2.5 py-1 rounded-full border border-[#FFD9E2]">
              <span>Đã chọn:</span>
              <span className="bg-[#FF5C8D] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                {inCartCount}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-stone-400 font-medium">
              {item.sizes && item.sizes.length > 0 ? 'Có chọn size' : 'Tiêu chuẩn'}
            </span>
          )}

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all duration-200 cursor-pointer ${
              addedFeedback
                ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                : 'bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2] hover:bg-gradient-to-r hover:from-[#FF5C8D] hover:to-[#E83D70] hover:text-white hover:border-transparent shadow-2xs'
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã thêm</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#FF5C8D] group-hover:text-white transition-colors" />
                <span>Chọn món</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Customization Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#FFD9E2]">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex gap-4 items-center pb-4 border-b border-[#FFD9E2]/60">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-2xl object-cover border border-[#FFD9E2]"
              />
              <div>
                <h3 className="font-extrabold text-lg text-[#2E1A12]">{item.name}</h3>
                <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                <div className="text-sm font-black text-[#FF5C8D] mt-1">{formatVND(item.price)}</div>
              </div>
            </div>

            <div className="space-y-5 py-4">
              {/* Size Selection */}
              {item.sizes && item.sizes.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-2">
                    Chọn kích cỡ (Size)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {item.sizes.map(size => (
                      <button
                        key={size.name}
                        type="button"
                        onClick={() => setSelectedSize(size.name)}
                        className={`p-3 rounded-2xl text-xs font-semibold border flex items-center justify-between transition-all ${
                          selectedSize === size.name
                            ? 'border-[#FF5C8D] bg-[#FCECEF] text-[#FF5C8D] font-bold shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{size.name}</span>
                        {size.extraPrice > 0 && (
                          <span className="text-[11px] text-stone-500">+{formatVND(size.extraPrice)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Level */}
              {item.sugarLevels && item.sugarLevels.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-2">
                    Lượng đường
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {item.sugarLevels.map(sugar => (
                      <button
                        key={sugar}
                        type="button"
                        onClick={() => setSelectedSugar(sugar)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          selectedSugar === sugar
                            ? 'border-[#FF5C8D] bg-[#FCECEF] text-[#FF5C8D] font-bold shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {sugar}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ice Level */}
              {item.iceLevels && item.iceLevels.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-2">
                    Lượng đá
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {item.iceLevels.map(ice => (
                      <button
                        key={ice}
                        type="button"
                        onClick={() => setSelectedIce(ice)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          selectedIce === ice
                            ? 'border-[#FF5C8D] bg-[#FCECEF] text-[#FF5C8D] font-bold shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {ice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider block mb-2">
                  Ghi chú cho quầy Barista
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Để đá riêng, không dùng đường hóa học..."
                  className="w-full text-xs p-3 rounded-xl border border-[#FFD9E2] bg-[#FFF9EE]/50 focus:outline-none focus:ring-2 focus:ring-[#FF5C8D] text-[#2E1A12]"
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-stone-700 uppercase">Số lượng</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Footer Modal Action */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-stone-500 block">Tổng tiền món:</span>
                <span className="font-extrabold text-base text-[#FF5C8D]">
                  {formatVND(currentTotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#D12B5E] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-pink-200 shadow-md transition-all"
              >
                <span>Thêm vào đơn</span>
                <span>• {formatVND(currentTotal)}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
