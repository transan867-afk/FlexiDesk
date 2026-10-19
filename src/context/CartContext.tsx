import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem } from '../types';
import { storageService } from '../services/storageService';

interface StoredCartData {
  cafeId: string | null;
  cafeName: string | null;
  items: CartItem[];
}

interface CartContextType {
  cafeId: string | null;
  cafeName: string | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (
    menuItem: MenuItem,
    options?: {
      selectedSize?: string;
      selectedSugar?: string;
      selectedIce?: string;
      extraPrice?: number;
      notes?: string;
      quantity?: number;
    }
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  setCafeContext: (cafeId: string, cafeName: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartData, setCartData] = useState<StoredCartData>(() => {
    return storageService.getCart<StoredCartData>({
      cafeId: null,
      cafeName: null,
      items: [],
    });
  });

  useEffect(() => {
    storageService.setCart(cartData);
  }, [cartData]);

  const setCafeContext = (cafeId: string, cafeName: string) => {
    setCartData(prev => {
      // If switching to a different cafe, clear previous items with notification
      if (prev.cafeId && prev.cafeId !== cafeId) {
        return {
          cafeId,
          cafeName,
          items: [],
        };
      }
      return {
        ...prev,
        cafeId,
        cafeName,
      };
    });
  };

  const addItem = (
    menuItem: MenuItem,
    options: {
      selectedSize?: string;
      selectedSugar?: string;
      selectedIce?: string;
      extraPrice?: number;
      notes?: string;
      quantity?: number;
    } = {}
  ) => {
    const qty = options.quantity || 1;
    const extraPrice = options.extraPrice || 0;
    const unitPrice = menuItem.price + extraPrice;

    // Create unique cart item key based on options
    const optionsKey = `${menuItem.id}-${options.selectedSize || ''}-${options.selectedSugar || ''}-${options.selectedIce || ''}`;

    setCartData(prev => {
      const existingIndex = prev.items.findIndex(i => i.id === optionsKey);
      let updatedItems: CartItem[];

      if (existingIndex > -1) {
        updatedItems = prev.items.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + qty;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * unitPrice,
            };
          }
          return item;
        });
      } else {
        const newItem: CartItem = {
          id: optionsKey,
          menuItem,
          quantity: qty,
          selectedSize: options.selectedSize,
          selectedSugar: options.selectedSugar,
          selectedIce: options.selectedIce,
          extraPrice,
          notes: options.notes,
          totalPrice: qty * unitPrice,
        };
        updatedItems = [...prev.items, newItem];
      }

      return {
        ...prev,
        cafeId: menuItem.cafeId,
        items: updatedItems,
      };
    });
  };

  const removeItem = (cartItemId: string) => {
    setCartData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== cartItemId),
    }));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartData(prev => {
      const updated = prev.items
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.menuItem.price + item.extraPrice;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * unitPrice,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      return { ...prev, items: updated };
    });
  };

  const clearCart = () => {
    setCartData({
      cafeId: null,
      cafeName: null,
      items: [],
    });
    storageService.clearCart();
  };

  const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartData.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{
        cafeId: cartData.cafeId,
        cafeName: cartData.cafeName,
        items: cartData.items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setCafeContext,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
