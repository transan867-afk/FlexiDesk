import React from 'react';
import { Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { formatDateVN } from '../../utils/formatters';

export const TimeSlotPicker: React.FC = () => {
  const {
    date,
    startTime,
    setDate,
    setStartTime,
  } = useBooking();

  const minDate = new Date().toISOString().split('T')[0];

  // Quick preset suggestions for fast pick, while allowing any exact minute via the time input
  const quickTimePresets = ['08:00', '09:15', '10:30', '13:45', '15:20', '18:30'];

  const handleSetCurrentTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setStartTime(`${h}:${m}`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFD9E2]/80 shadow-card">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-[#FCECEF] text-[#FF5C8D] font-extrabold px-2.5 py-1 rounded-full border border-[#FFD9E2]">
            Bước 1
          </span>
          <span className="text-xs bg-[#FEF0C7] text-[#9A3412] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
            <Sparkles className="w-3 h-3 text-[#FF6433]" /> Không Giới Hạn Thời Gian
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-[#2E1A12]">
          Chọn Ngày & Giờ Bắt Đầu Check-in
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Bạn có thể tùy ý chọn giờ đến chính xác từng phút. Chỗ ngồi được giữ trọn vẹn cả ngày làm việc không hạn chế thời lượng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Date Selection */}
        <div>
          <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Calendar className="w-4 h-4 text-[#FF5C8D]" />
            Ngày đến quán
          </label>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm font-bold p-3.5 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D] text-[#2E1A12]"
          />
          <span className="text-[11px] text-stone-500 mt-1.5 block font-medium">
            {formatDateVN(date)}
          </span>
        </div>

        {/* Flexible Minute-by-Minute Time Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#2E1A12] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FF5C8D]" />
              Giờ bắt đầu check-in (Tùy chỉnh từng phút)
            </label>
            <button
              type="button"
              onClick={handleSetCurrentTime}
              className="text-[11px] font-bold text-[#FF5C8D] hover:underline"
            >
              Lấy giờ hiện tại
            </button>
          </div>

          <div className="relative">
            <input
              type="time"
              step="60"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-base sm:text-lg font-black p-3.5 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] focus:outline-none focus:ring-2 focus:ring-[#FF5C8D] text-[#2E1A12]"
            />
          </div>

          {/* Quick chip suggestions */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-stone-400 font-bold uppercase">Gợi ý nhanh:</span>
            {quickTimePresets.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setStartTime(t)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                  startTime === t
                    ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                    : 'bg-[#FFF9EE] hover:bg-[#FCECEF] text-[#2E1A12] border border-[#FFD9E2]/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Unlimited Time & Table Hold Guarantee Banner */}
      <div className="mt-6 bg-gradient-to-r from-[#FFF9EE] via-[#FCECEF] to-[#FFF9EE] rounded-2xl p-4 border border-[#FFD9E2] flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#2E1A12] font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#FF5C8D] shrink-0" />
          <span>
            Giờ check-in: <strong className="text-[#FF5C8D] text-sm">{startTime}</strong> ngày <strong>{formatDateVN(date)}</strong>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[#FF5C8D] font-bold text-[11px] bg-white px-3 py-1.5 rounded-full border border-[#FFD9E2] shadow-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF5C8D]" />
            <span>Thời gian giữ bàn: <strong>15 phút</strong> sau giờ hẹn</span>
          </div>
          <div className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs">
            ✓ Thời lượng: Sử dụng thoải mái cả ngày
          </div>
        </div>
      </div>

    </div>
  );
};
