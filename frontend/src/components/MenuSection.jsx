import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { fetchMenuItems } from '../data/mockData';

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const { addToCart } = useCart();

  const categories = ["burgers", "chicken", "fries", "drinks", "desserts"];

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        setBackendStatus('checking');
        
        console.log('🔄 Loading menu items...');
        const items = await fetchMenuItems();
        
        setMenuItems(items);
        setBackendStatus('connected');
        console.log('✅ Menu loaded successfully');
      } catch (error) {
        console.error('Error loading menu:', error);
        setBackendStatus('disconnected');
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  const handleAddToCart = (item) => {
    addToCart(item);
    const button = document.getElementById(`add-${item.id}`);
    if (button) {
      button.classList.add('animate-ping');
      setTimeout(() => button.classList.remove('animate-ping'), 300);
    }
  };

  if (loading) {
    return (
      <section id="menu" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🍔</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Loading Menu...</h2>
          <div className="animate-pulse text-gray-600">
            {backendStatus === 'checking' && 'Connecting to Spring Boot backend...'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Backend Status Indicator */}
        <div className={`text-center mb-6 p-3 rounded-lg ${
          backendStatus === 'connected' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          {backendStatus === 'connected' ? (
            <span>✅ Connected to Spring Boot Backend</span>
          ) : (
            <span>⚠️ Using demo data - Backend not available</span>
          )}
        </div>

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary-500">Menu</span>
          </h2>
          <p className="text-xl text-gray-600">
            {backendStatus === 'connected' 
              ? `Loaded ${menuItems.length} items from Spring Boot` 
              : `Showing ${menuItems.length} demo items`
            }
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                activeCategory === category
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)} 
              <span className="ml-2 text-sm opacity-75">
                ({menuItems.filter(item => item.category === category).length})
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="relative">
                <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-t-2xl h-32 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                {item.featured && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    POPULAR
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <span className="text-2xl font-bold text-primary-600">${item.price}</span>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                
                <button
                  id={`add-${item.id}`}
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all transform hover:scale-105"
                >
                  Add to Cart 🛒
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;