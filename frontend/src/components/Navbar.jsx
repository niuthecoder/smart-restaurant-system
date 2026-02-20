import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiSun, FiMoon, FiChevronDown } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'ar', label: 'AR' },
  { code: 'fa', label: 'FA' },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const moreRef = useRef(null);
  const staffRef = useRef(null);
  const { getCartCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { primaryColor } = useBranding();
  const { isDark, toggle: toggleTheme } = useTheme();
  const orderBtnStyle = { backgroundColor: primaryColor || '#2a221c' };

  useEffect(() => {
    const close = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (staffRef.current && !staffRef.current.contains(e.target)) setStaffOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const navigateToOrder = () => {
    window.location.hash = '#order';
    setIsOpen(false);
  };

  const navigateToSection = (section) => {
    window.location.hash = section;
    setIsOpen(false);
    setMoreOpen(false);
    setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleAdminLogout = () => {
    logout();
    window.location.hash = 'home';
    setIsOpen(false);
    setStaffOpen(false);
  };

  const handleAdminLogin = () => {
    window.location.hash = 'admin';
    setIsOpen(false);
    setStaffOpen(false);
  };

  return (
    <nav className="bg-mono-50 dark:bg-mono-900 border-b border-mono-200 dark:border-mono-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center cursor-pointer gap-1.5 shrink-0" onClick={() => navigateToSection('home')}>
            <span className="text-2xl md:text-3xl leading-none" aria-hidden>🍽️</span>
            <span className="font-display text-lg md:text-xl font-bold text-mono-900 dark:text-mono-100 whitespace-nowrap">
              {t('nav.brand')}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <a href="#home" className="px-2.5 py-1.5 text-sm font-medium text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); navigateToSection('home'); }}>{t('nav.home')}</a>
            <a href="#menu" className="px-2.5 py-1.5 text-sm font-medium text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); navigateToSection('menu'); }}>{t('nav.menu')}</a>
            <a href="#offers" className="px-2.5 py-1.5 text-sm font-medium text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); navigateToSection('offers'); }}>{t('nav.offers')}</a>
            <a href="#about" className="px-2.5 py-1.5 text-sm font-medium text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); navigateToSection('about'); }}>{t('nav.about')}</a>
            <div className="relative" ref={moreRef}>
              <button type="button" onClick={() => setMoreOpen(!moreOpen)} className="flex items-center gap-0.5 px-2.5 py-1.5 text-sm font-medium text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors">
                More <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute top-full left-0 mt-1 py-1 w-44 bg-mono-50 dark:bg-mono-800 rounded-sm shadow-soft-lg border border-mono-200 dark:border-mono-700 z-50">
                  <a href="#reviews" className="block px-3 py-2 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-t-sm" onClick={(e) => { e.preventDefault(); navigateToSection('reviews'); }}>{t('nav.reviews')}</a>
                  <a href="#contact" className="block px-3 py-2 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-700" onClick={(e) => { e.preventDefault(); navigateToSection('contact'); }}>{t('nav.contact')}</a>
                  <a href="#book-table" className="block px-3 py-2 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-700" onClick={(e) => { e.preventDefault(); navigateToSection('book-table'); }}>{t('nav.bookTable')}</a>
                  <a href="#waitlist" className="block px-3 py-2 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-b-sm" onClick={(e) => { e.preventDefault(); window.location.hash = 'waitlist'; setMoreOpen(false); }}>{t('nav.waitlist')}</a>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            <div className="flex items-center gap-0.5 border border-mono-200 dark:border-mono-700 rounded-sm p-0.5">
              {LANGUAGES.map(({ code, label }) => (
                <button key={code} type="button" onClick={() => i18n.changeLanguage(code)} className={`px-1.5 py-0.5 text-xs rounded-sm font-medium transition-colors ${i18n.language === code ? 'bg-mono-800 text-mono-50 dark:bg-mono-200 dark:text-mono-900' : 'text-mono-600 dark:text-mono-400 hover:bg-mono-100 dark:hover:bg-mono-800'}`}>{label}</button>
              ))}
            </div>
            <button type="button" onClick={toggleTheme} className="p-1.5 rounded-sm text-mono-600 dark:text-mono-400 hover:bg-mono-100 dark:hover:bg-mono-800" title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="relative" ref={staffRef}>
              <button type="button" onClick={() => setStaffOpen(!staffOpen)} className="flex items-center gap-1 px-2 py-1.5 text-sm text-mono-600 dark:text-mono-400 hover:text-mono-900 dark:hover:text-mono-100 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-800">
                <FiUser size={16} />
                {isAuthenticated ? <span className="max-w-[80px] truncate">{user?.username}</span> : <span>Staff</span>}
                <FiChevronDown className={`w-3.5 h-3.5 ${staffOpen ? 'rotate-180' : ''}`} />
              </button>
              {staffOpen && (
                <div className="absolute top-full right-0 mt-1 py-1 w-44 bg-mono-50 dark:bg-mono-800 rounded-sm shadow-soft-lg border border-mono-200 dark:border-mono-700 z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-xs text-mono-500 border-b border-mono-100 dark:border-mono-700">{t('nav.welcome', { name: user?.username || '' })}</div>
                      {(user?.role === 'WAITER' || user?.role === 'ADMIN') && (
                        <a href="#kitchen" className="flex items-center gap-2 px-3 py-2 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-700" onClick={() => setStaffOpen(false)}>{t('nav.kitchen')}</a>
                      )}
                      <button type="button" onClick={handleAdminLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-mono-600 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-b-sm">
                        <FiLogOut size={14} /> {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={handleAdminLogin} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-t-sm text-left">{t('nav.admin')}</button>
                      <button type="button" onClick={() => { window.location.hash = 'waiter-login'; setStaffOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-b-sm text-left">{t('nav.waiter')}</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <button onClick={navigateToOrder} style={orderBtnStyle} className="text-mono-50 px-5 py-2.5 rounded-sm text-sm font-semibold hover:opacity-95 flex items-center gap-1.5 relative shrink-0 bg-mono-800 dark:bg-mono-700 transition-all hover:shadow-soft active:scale-[0.98]">
              <FiShoppingCart size={18} />
              <span className="hidden lg:inline">{t('nav.orderNow')}</span>
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Cart Badge */}
            {getCartCount() > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </div>
            )}
            
            {/* Admin Indicator (Mobile) */}
            {isAuthenticated && (
              <div className="flex items-center space-x-1 text-sm text-mono-600 dark:text-mono-400">
                <FiUser size={16} />
                <span className="hidden sm:inline">{user?.username}</span>
              </div>
            )}
            
            <button onClick={() => setIsOpen(!isOpen)} className="text-mono-700 dark:text-mono-300">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-mono-50 dark:bg-mono-800 border border-mono-200 dark:border-mono-700 rounded-sm shadow-soft-lg p-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <button type="button" onClick={() => { toggleTheme(); setIsOpen(false); }} className="flex items-center gap-2 text-mono-700 dark:text-mono-300 py-2">
                {isDark ? <FiSun /> : <FiMoon />} {isDark ? 'Light mode' : 'Dark mode'}
              </button>
              <div className="flex gap-2 py-2">
                {LANGUAGES.map(({ code, label }) => (
                  <button key={code} type="button" onClick={() => { i18n.changeLanguage(code); setIsOpen(false); }} className={`px-3 py-1 text-sm rounded-sm ${i18n.language === code ? 'bg-mono-800 text-mono-50 dark:bg-mono-200 dark:text-mono-900' : 'bg-mono-100 dark:bg-mono-700'}`}>{label}</button>
                ))}
              </div>
              <a href="#home" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('home'); }}>{t('nav.home')}</a>
              <a href="#menu" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('menu'); }}>{t('nav.menu')}</a>
              <a href="#offers" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('offers'); }}>{t('nav.offers')}</a>
              <a href="#about" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('about'); }}>{t('nav.about')}</a>
              <a href="#reviews" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('reviews'); }}>{t('nav.reviews')}</a>
              <a href="#contact" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('contact'); }}>{t('nav.contact')}</a>
              <a href="#book-table" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('book-table'); }}>{t('nav.bookTable')}</a>
              <a href="#waitlist" className="text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2" onClick={(e) => { e.preventDefault(); window.location.hash = 'waitlist'; setIsOpen(false); }}>{t('nav.waitlist')}</a>
              
              <div className="border-t border-mono-200 dark:border-mono-700 pt-4 mt-2">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-mono-600 bg-mono-100 dark:bg-mono-700 p-3 rounded-sm">
                      <FiUser className="text-mono-500" />
                      <span>Logged in as: {user?.username}</span>
                    </div>
                    <button 
                      onClick={handleAdminLogout}
                      className="w-full flex items-center justify-center space-x-2 text-mono-600 hover:text-mono-800 font-medium py-2 border border-mono-300 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-700 transition-colors"
                    >
                      <FiLogOut />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleAdminLogin}
                    className="w-full flex items-center justify-center space-x-2 text-mono-700 dark:text-mono-300 hover:text-mono-900 dark:hover:text-mono-100 font-medium py-2 border border-mono-200 rounded-sm hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                  >
                    <span>{t('nav.admin')} Login</span>
                  </button>
                )}
              </div>

              <button onClick={navigateToOrder} style={orderBtnStyle} className="text-mono-50 px-6 py-3 rounded-sm font-medium flex items-center justify-center mt-4 hover:opacity-90 bg-mono-800 dark:bg-mono-700">
                <FiShoppingCart className="mr-2" />
                {t('nav.orderNow')} ({getCartCount()})
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;