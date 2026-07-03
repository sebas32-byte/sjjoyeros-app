import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem('cart_items', JSON.stringify(items)); } catch (e) { /* ignore */ }
  }, [items]);

  function addItem(product, qty = 1) {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        const copy = [...cur];
        copy[idx].quantity += qty;
        return copy;
      }
      return [...cur, { ...product, quantity: qty }];
    });
  }

  function removeItem(productId) {
    setItems((cur) => cur.filter((i) => i.id !== productId));
  }

  function updateQty(productId, qty) {
    setItems((cur) => cur.map((i) => (i.id === productId ? { ...i, quantity: qty } : i)));
  }

  function clear() {
    setItems([]);
  }

  const value = { items, addItem, removeItem, updateQty, clear, count: items.reduce((s, i) => s + (i.quantity || 0), 0) };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
