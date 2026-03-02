import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext();
const CART_KEY = 'cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) {}
  }, [cart]);

  const addToCart = useCallback((item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, change) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getCartCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount, getCartTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};