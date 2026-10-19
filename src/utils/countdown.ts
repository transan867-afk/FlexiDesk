/**
 * Utility to calculate countdown to check-in time and table hold grace period (thời gian giữ bàn)
 * Đếm ngược theo giờ check-in mà khách hàng chọn (date + startTime), không phụ thuộc thời điểm đặt chỗ.
 */

export interface BookingCountdownState {
  status: 'upcoming' | 'holding' | 'expired';
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  formatted: string;
  label: string;
  holdTimeEndFormatted: string;
  holdMinutes: number;
}

export function parseCheckInTimestamp(dateStr: string, timeStr: string): number | null {
  if (!dateStr || !timeStr) return null;

  let year = 0;
  let month = 0;
  let day = 0;

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number);
    if (parts[0] > 1000) {
      // YYYY-MM-DD
      [year, month, day] = parts;
    } else {
      // DD-MM-YYYY
      [day, month, year] = parts;
    }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(Number);
    if (parts[2] > 1000) {
      // DD/MM/YYYY
      [day, month, year] = parts;
    } else {
      // YYYY/MM/DD
      [year, month, day] = parts;
    }
  }

  const timeParts = timeStr.trim().split(':').map(Number);
  const hour = isNaN(timeParts[0]) ? 0 : timeParts[0];
  const minute = isNaN(timeParts[1]) ? 0 : timeParts[1];

  if (!year || !month || !day) return null;

  const d = new Date(year, month - 1, day, hour, minute, 0);
  return d.getTime();
}

export function calculateBookingCountdown(
  dateStr: string,
  timeStr: string,
  _createdAtStr?: string, // Không tính theo thời điểm đặt chỗ nữa
  holdMinutes = 15
): BookingCountdownState {
  const holdMin = holdMinutes;
  const totalHoldSeconds = holdMin * 60; // 15 phút = 900 giây

  const checkInTime = parseCheckInTimestamp(dateStr, timeStr);
  if (!checkInTime) {
    return {
      status: 'expired',
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSecondsRemaining: 0,
      formatted: '00:00',
      label: 'Đã hoàn tất',
      holdTimeEndFormatted: '--:--',
      holdMinutes: holdMin,
    };
  }

  // Hạn chót giữ bàn: Giờ check-in khách chọn + 15 phút
  const holdEndTime = checkInTime + totalHoldSeconds * 1000;
  const holdEndDate = new Date(holdEndTime);
  const holdEndH = String(holdEndDate.getHours()).padStart(2, '0');
  const holdEndM = String(holdEndDate.getMinutes()).padStart(2, '0');
  const holdTimeEndFormatted = `${holdEndH}:${holdEndM}`;

  const now = Date.now();

  // 1. ĐÃ QUÁ 15 PHÚT SAU GIỜ CHECK-IN: Hết hạn giữ bàn
  if (now > holdEndTime) {
    return {
      status: 'expired',
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSecondsRemaining: 0,
      formatted: '00:00',
      label: 'Đã hết thời gian giữ bàn (15 phút sau giờ check-in)',
      holdTimeEndFormatted,
      holdMinutes: holdMin,
    };
  }

  // 2. ĐANG TRONG 15 PHÚT GIỮ BÀN SAU GIỜ CHECK-IN (checkInTime <= now <= holdEndTime):
  // Đếm ngược từng giây lùi về 00:00 tính theo giờ check-in mà khách đã chọn
  if (now >= checkInTime) {
    const secUntilHoldEnd = Math.max(0, Math.floor((holdEndTime - now) / 1000));
    const remainingSec = Math.min(totalHoldSeconds, secUntilHoldEnd);
    const minutes = Math.floor(remainingSec / 60);
    const seconds = remainingSec % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return {
      status: 'holding',
      hours: 0,
      minutes,
      seconds,
      totalSecondsRemaining: remainingSec,
      formatted,
      label: `Đang giữ bàn: còn ${minutes} phút ${seconds} giây (đến ${holdTimeEndFormatted})`,
      holdTimeEndFormatted,
      holdMinutes: holdMin,
    };
  }

  // 3. CHƯA ĐẾN GIỜ CHECK-IN KHÁCH CHỌN (now < checkInTime):
  // Bàn được đảm bảo giữ chỗ. Toàn bộ 15 phút giữ bàn được bảo lưu nguyên vẹn, bắt đầu tính từ giờ check-in
  return {
    status: 'upcoming',
    hours: 0,
    minutes: holdMin,
    seconds: 0,
    totalSecondsRemaining: totalHoldSeconds,
    formatted: `${String(holdMin).padStart(2, '0')}:00`,
    label: `Sắp đến giờ check-in (${timeStr}) - Quán giữ bàn 15 phút (đến ${holdTimeEndFormatted})`,
    holdTimeEndFormatted,
    holdMinutes: holdMin,
  };
}
