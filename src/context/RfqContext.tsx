'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RfqItem {
  id: string;
  series: string;
  code: string;
  category: string;
  image?: string;
  htoCode?: string;
  quantity: number;
  notes?: string;
}

interface RfqContextType {
  items: RfqItem[];
  totalCount: number;
  addItem: (item: Omit<RfqItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, htoCode?: string) => void;
  updateQuantity: (id: string, qty: number, htoCode?: string) => void;
  clearCart: () => void;
  isItemInCart: (id: string, htoCode?: string) => boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const RfqContext = createContext<RfqContextType | undefined>(undefined);

const STORAGE_KEY = 'belsa_rfq_cart_v1';

export function RfqProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RfqItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load RFQ cart from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save RFQ cart to localStorage:', e);
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<RfqItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity || 1;
    const hto = item.htoCode || '';

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.id === item.id && (it.htoCode || '') === hto
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      } else {
        return [...prev, { ...item, quantity: qty, htoCode: hto }];
      }
    });
  };

  const removeItem = (id: string, htoCode?: string) => {
    const hto = htoCode || '';
    setItems((prev) =>
      prev.filter((it) => !(it.id === id && (it.htoCode || '') === hto))
    );
  };

  const updateQuantity = (id: string, qty: number, htoCode?: string) => {
    if (qty <= 0) {
      removeItem(id, htoCode);
      return;
    }
    const hto = htoCode || '';
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id && (it.htoCode || '') === hto) {
          return { ...it, quantity: qty };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isItemInCart = (id: string, htoCode?: string) => {
    const hto = htoCode || '';
    return items.some((it) => it.id === id && (it.htoCode || '') === hto);
  };

  const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <RfqContext.Provider
      value={{
        items,
        totalCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isItemInCart,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </RfqContext.Provider>
  );
}

export function useRfq() {
  const context = useContext(RfqContext);
  if (!context) {
    throw new Error('useRfq must be used within an RfqProvider');
  }
  return context;
}
