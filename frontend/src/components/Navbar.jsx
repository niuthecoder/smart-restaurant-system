import React, { useState } from 'react';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const navigateToOrder = () => {
    window.location.hash = '#order';
    setIsOpen(false);
  };

  const navigateToSection = (section) => {
    window.location.hash = section;
    setIsOpen(false);
  };

  const handleAdminLogout = () => {
    logout();
    window.location.hash = 'home';
    setIsOpen(false);
  };

  const handleAdminLogin = () => {
    window.location.hash = 'admin';
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigateToSection('home')}>
            <span className="text-3xl font-bold text-primary-600">🍔</span>
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              BURGER HOUSE
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#home" className="text-gray-700 hover:text-primary-600 font-medium transition-colors" onClick={(e) => { e.preventDefault(); navigateToSection('home'); }}>Home</a>
            <a href="#menu" className="text-gray-700 hover:text-primary-600 font-medium transition-colors" onClick={(e) => { e.preventDefault(); navigateToSection('menu'); }}>Menu</a>
            <a href="#offers" className="text-gray-700 hover:text-primary-600 font-medium transition-colors" onClick={(e) => { e.preventDefault(); navigateToSection('offers'); }}>Offers</a>
            <a href="#about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors" onClick={(e) => { e.preventDefault(); navigateToSection('about'); }}>About</a>
            <a href="#contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors" onClick={(e) => { e.preventDefault(); navigateToSection('contact'); }}>Contact</a>
            <a href="#book-table" className="text-gray-700 hover:text-primary-600 font-medium transition-colors" onClick={(e) => { e.preventDefault(); navigateToSection('book-table'); }}>Book Table</a>
            
            {/* Admin Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiUser className="text-primary-500" />
                  <span>Welcome, {user?.username}</span>
                </div>
                <button 
                  onClick={handleAdminLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAdminLogin}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                <span>🔐</span>
                <span>Admin</span>
              </button>
            )}

            {/* Order Button */}
            <button onClick={navigateToOrder} className="bg-primary-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-600 transition-all transform hover:scale-105 flex items-center relative">
              <FiShoppingCart className="mr-2" />
              Order Now
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <FiUser size={16} />
                <span className="hidden sm:inline">{user?.username}</span>
              </div>
            )}
            
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-xl p-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-primary-600 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('home'); }}>Home</a>
              <a href="#menu" className="text-gray-700 hover:text-primary-600 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('menu'); }}>Menu</a>
              <a href="#offers" className="text-gray-700 hover:text-primary-600 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('offers'); }}>Offers</a>
              <a href="#about" className="text-gray-700 hover:text-primary-600 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('about'); }}>About</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('contact'); }}>Contact</a>
              <a href="#book-table" className="text-gray-700 hover:text-primary-600 font-medium py-2" onClick={(e) => { e.preventDefault(); navigateToSection('book-table'); }}>Book Table</a>
              
              {/* Admin Section (Mobile) */}
              <div className="border-t pt-4 mt-2">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <FiUser className="text-primary-500" />
                      <span>Logged in as: {user?.username}</span>
                    </div>
                    <button 
                      onClick={handleAdminLogout}
                      className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut />
                      <span>Admin Logout</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleAdminLogin}
                    className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-primary-600 font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span>🔐</span>
                    <span>Admin Login</span>
                  </button>
                )}
              </div>

              {/* Order Button (Mobile) */}
              <button onClick={navigateToOrder} className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition-all flex items-center justify-center mt-4">
                <FiShoppingCart className="mr-2" />
                Order Now ({getCartCount()})
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;