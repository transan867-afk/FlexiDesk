import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Cafe, CustomerInfo, PaymentMethod, TableSeat } from '../types';
import { storageService } from '../services/storageService';
import { calculateFinancials } from '../utils/formatters';
import { applyDiscountCode } from '../data/promotionsData';
import { useCart } from './CartContext';

interface BookingDraftState {
  cafe: Cafe | null;
  table: TableSeat | null;
  date: string;
  startTime: string; // e.g. "08:15", "09:42", "14:30"
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  discountCode: string;
  discountAmount: number;
}

interface BookingContextType {
  cafe: Cafe | null;
  table: TableSeat | null;
  date: string;
  startTime: string;
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  discountCode: string;
  discountAmount: number;

  // Financial calculations
  drinkTotal: number;
  seatFee: number;
  subtotal: number;
  totalAmount: number;
  depositAmount: number;
  remainingAtCafe: number;

  // Actions
  setCafe: (cafe: Cafe) => void;
  selectTable: (table: TableSeat | null) => void;
  setDate: (date: string) => void;
  setStartTime: (time: string) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  resetBooking: () => void;
  validateForCheckout: () => { isValid: boolean; errors: string[] };
}

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getCurrentTimeString = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { items: cartItems } = useCart();

  const [state, setState] = useState<BookingDraftState>(() => {
    return storageService.getBookingDraft<BookingDraftState>({
      cafe: null,
      table: null,
      date: getTodayString(),
      startTime: getCurrentTimeString(),
      customerInfo: {
        name: '',
        phone: '',
        email: '',
        notes: '',
      },
      paymentMethod: 'deposit_10_percent',
      discountCode: '',
      discountAmount: 0,
    });
  });

  useEffect(() => {
    storageService.setBookingDraft(state);
  }, [state]);

  const setCafe = (cafe: Cafe) => {
    setState(prev => ({
      ...prev,
      cafe,
      table: prev.cafe?.id === cafe.id ? prev.table : null,
    }));
  };

  const selectTable = (table: TableSeat | null) => {
    setState(prev => ({ ...prev, table }));
  };

  const setDate = (date: string) => {
    setState(prev => ({ ...prev, date }));
  };

  const setStartTime = (startTime: string) => {
    setState(prev => ({ ...prev, startTime }));
  };

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setState(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        ...info,
      },
    }));
  };

  const setPaymentMethod = (paymentMethod: PaymentMethod) => {
    setState(prev => ({ ...prev, paymentMethod }));
  };

  // Re-calculate financials (FlexiDesk does not limit duration, seat fee is flat)
  const financials = useMemo(() => {
    return calculateFinancials({
      cartItems,
      seatFee: state.table?.hourlyRate || 0,
      paymentMethod: state.paymentMethod,
      discountAmount: state.discountAmount,
    });
  }, [cartItems, state.table, state.paymentMethod, state.discountAmount]);

  const applyPromo = (code: string) => {
    const rawSubtotal = (financials.drinkTotal || 0) + (financials.seatFee || 0);
    const result = applyDiscountCode(code, rawSubtotal);
    if (result.valid) {
      setState(prev => ({
        ...prev,
        discountCode: code.toUpperCase().trim(),
        discountAmount: result.discountAmount,
      }));
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.message };
    }
  };

  const removePromo = () => {
    setState(prev => ({
      ...prev,
      discountCode: '',
      discountAmount: 0,
    }));
  };

  const resetBooking = () => {
    setState({
      cafe: null,
      table: null,
      date: getTodayString(),
      startTime: getCurrentTimeString(),
      customerInfo: {
        name: '',
        phone: '',
        email: '',
        notes: '',
      },
      paymentMethod: 'deposit_10_percent',
      discountCode: '',
      discountAmount: 0,
    });
    storageService.clearBookingDraft();
  };

  const validateForCheckout = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!state.cafe) {
      errors.push('Vui lòng chọn một quán cà phê.');
    }
    if (!state.table) {
      errors.push('Vui lòng chọn chỗ ngồi / bàn làm việc trên sơ đồ.');
    }
    if (!state.date) {
      errors.push('Vui lòng chọn ngày đặt chỗ.');
    }
    if (!state.startTime) {
      errors.push('Vui lòng chọn giờ bắt đầu check-in.');
    }
    if (!state.customerInfo.name.trim()) {
      errors.push('Vui lòng nhập họ và tên của bạn.');
    }
    if (!state.customerInfo.phone.trim()) {
      errors.push('Vui lòng nhập số điện thoại liên hệ.');
    } else if (!/^[0-9+() -]{9,15}$/.test(state.customerInfo.phone.trim())) {
      errors.push('Số điện thoại không hợp lệ.');
    }
    if (state.customerInfo.email.trim() && !/^\S+@\S+\.\S+$/.test(state.customerInfo.email.trim())) {
      errors.push('Email không hợp lệ.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return (
    <BookingContext.Provider
      value={{
        ...state,
        drinkTotal: financials.drinkTotal,
        seatFee: financials.seatFee,
        subtotal: financials.subtotal,
        totalAmount: financials.totalAmount,
        depositAmount: financials.depositAmount,
        remainingAtCafe: financials.remainingAtCafe,
        setCafe,
        selectTable,
        setDate,
        setStartTime,
        updateCustomerInfo,
        setPaymentMethod,
        applyPromo,
        removePromo,
        resetBooking,
        validateForCheckout,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
