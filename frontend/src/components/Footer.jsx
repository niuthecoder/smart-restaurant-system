import React, { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiHeart, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would connect to your backend newsletter API
      alert(`🎉 Thank you for subscribing with ${email}! You'll receive our latest offers.`);
      setEmail('');
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold text-primary-500">🍔</span>
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                BURGER HOUSE
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Crafting the most delicious burgers in town since 2010. Fresh ingredients, bold flavors, and unforgettable experiences.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-all transform hover:scale-110">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition-all transform hover:scale-110">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-all transform hover:scale-110">
                <FiTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#menu" className="text-gray-300 hover:text-primary-400 transition-colors">Our Menu</a></li>
              <li><a href="#offers" className="text-gray-300 hover:text-primary-400 transition-colors">Special Offers</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#book-table" className="text-gray-300 hover:text-primary-400 transition-colors">Book a Table</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-primary-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <FiMapPin className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">123 Burger Street<br />Food District, NY 10001</span>
              </div>
              <div className="flex items-center">
                <FiPhone className="text-primary-500 mr-3 flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-BURGER</span>
              </div>
              <div className="flex items-center">
                <FiMail className="text-primary-500 mr-3 flex-shrink-0" />
                <span className="text-gray-300">hello@burgerhouse.com</span>
              </div>
              <div className="flex items-start">
                <FiClock className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">Open Daily<br />11:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to get exclusive offers and updates</p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-all transform hover:scale-105"
              >
                {subscribed ? 'Subscribed! 🎉' : 'Subscribe Now'}
              </button>
            </form>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <h4 className="text-center text-gray-400 mb-4">We Accept</h4>
          <div className="flex justify-center space-x-6">
            <div className="text-2xl">💳</div>
            <div className="text-2xl">🅿️</div>
            <div className="text-2xl">📱</div>
            <div className="text-2xl">💰</div>
            <div className="text-2xl">💲</div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Burger House. Made with <FiHeart className="inline text-red-500" /> for burger lovers.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;