import React from 'react';

const Hero = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Animated Badge */}
        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 animate-pulse">
          <span className="text-white font-semibold">🔥 Fresh & Delicious</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in">
          BURGER
          <span className="block text-yellow-300">HOUSE</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Crafting the most delicious burgers in town with premium ingredients and bold flavors that ignite your taste buds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
          <button onClick={() => window.location.hash = 'menu'}
             className="bg-white text-primary-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            >
            🍔 ORDER NOW
            </button>
         <button 
            onClick={() => window.location.hash = 'book-table'}
            className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all transform hover:scale-105"
            >
            📅 BOOK TABLE
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 text-white">
          <div>
            <div className="text-3xl font-bold">50+</div>
            <div className="text-white/80">Burger Varieties</div>
          </div>
          <div>
            <div className="text-3xl font-bold">15min</div>
            <div className="text-white/80">Avg. Wait Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold">4.9★</div>
            <div className="text-white/80">Customer Rating</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;