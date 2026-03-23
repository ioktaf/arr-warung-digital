"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  CART_STORAGE_KEY,
  clampCartQuantity,
  createCartItem,
  sanitizeCartItem,
} from "@/lib/cart";
import type { CartItem, Product } from "@/types/domain";

type CartContextValue = {
  items: CartItem[];
  isReady: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);

      if (!raw) {
        setIsReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;

      if (!Array.isArray(parsed)) {
        setIsReady(true);
        return;
      }

      setItems(
        parsed.flatMap((item) => {
          const sanitized = sanitizeCartItem(item);
          return sanitized ? [sanitized] : [];
        }),
      );
    } catch {
      setItems([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  function addItem(product: Product, quantity: number) {
    setItems((currentItems) => {
      const nextItem = createCartItem(product, quantity);

      if (nextItem.quantity <= 0) {
        return currentItems;
      }

      const existingItem = currentItems.find(
        (item) => item.productId === product.id,
      );

      if (!existingItem) {
        return [...currentItems, nextItem];
      }

      return currentItems.map((item) => {
        if (item.productId !== product.id) {
          return item;
        }

        return {
          ...createCartItem(product, item.quantity),
          quantity: clampCartQuantity(item.quantity + quantity, product.stock),
        };
      });
    });
  }

  function setItemQuantity(productId: string, quantity: number) {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.productId !== productId) {
          return [item];
        }

        if (quantity <= 0) {
          return [];
        }

        return [
          {
            ...item,
            quantity: clampCartQuantity(quantity, item.stock),
          },
        ];
      }),
    );
  }

  function removeItem(productId: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isReady,
        itemCount,
        subtotal,
        addItem,
        setItemQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
