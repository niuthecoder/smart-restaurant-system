import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const MobileCartBar = () => {
  const { getCartCount, getCartTotal } = useCart();
  const count = getCartCount();

  if (count === 0) return null;

  const isOrderPage = (window.location.hash || '').replace('#', '').startsWith('order');

  if (isOrderPage) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      <div className="mx-3 mb-3">
        <button
          onClick={() => (window.location.hash = 'order')}
          className="w-full flex items-center justify-between bg-mono-900 dark:bg-mono-100 text-mono-50 dark:text-mono-900 px-5 py-3.5 rounded-lg shadow-xl active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {count}
              </span>
            </div>
            <span className="font-semibold text-sm">View Cart</span>
          </div>
          <span className="font-bold">${getCartTotal().toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};

export default MobileCartBar;
