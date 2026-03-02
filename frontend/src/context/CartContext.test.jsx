import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cart).toEqual([]);
    expect(result.current.getCartCount()).toBe(0);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = { id: 1, name: 'Kebab', price: 12.99 };

    act(() => {
      result.current.addToCart(item);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toEqual({ id: 1, name: 'Kebab', price: 12.99, quantity: 1 });
    expect(result.current.getCartCount()).toBe(1);
    expect(result.current.getCartTotal()).toBe(12.99);
  });

  it('increments quantity when adding same item again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = { id: 1, name: 'Kebab', price: 12.99 };

    act(() => {
      result.current.addToCart(item);
      result.current.addToCart(item);
    });

    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.getCartCount()).toBe(2);
    expect(result.current.getCartTotal()).toBe(25.98);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = { id: 1, name: 'Kebab', price: 12.99 };

    act(() => {
      result.current.addToCart(item);
    });
    expect(result.current.cart).toHaveLength(1);

    act(() => {
      result.current.removeFromCart(1);
    });
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const item = { id: 1, name: 'Kebab', price: 12.99 };

    act(() => {
      result.current.addToCart(item);
      result.current.addToCart(item); // quantity 2
    });

    act(() => {
      result.current.updateQuantity(1, 1); // add 1
    });
    expect(result.current.cart[0].quantity).toBe(3);

    act(() => {
      result.current.updateQuantity(1, -2); // subtract 2
    });
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart({ id: 1, name: 'A', price: 5 });
      result.current.addToCart({ id: 2, name: 'B', price: 10 });
    });
    expect(result.current.cart).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.cart).toEqual([]);
    expect(result.current.getCartCount()).toBe(0);
  });

  it('persists cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart({ id: 1, name: 'Kebab', price: 12.99 });
    });

    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(1);
    expect(stored[0].quantity).toBe(1);
  });
});
