import React from 'react';
import { useCart } from '../context/CartContext';

const SpecialOffers = () => {
  const { addToCart } = useCart();

  const specialOffers = [
    {
      id: 1001,
      title: "Combo Deal",
      description: "Burger + Fries + Drink",
      price: 19.99,
      originalPrice: 24.99,
      image: "🎯",
      popular: true
    },
    {
      id: 1002,
      title: "Family Pack", 
      description: "4 Burgers + 4 Fries + 4 Drinks",
      price: 49.99,
      originalPrice: 59.99,
      image: "👨‍👩‍👧‍👦"
    },
    {
      id: 1003,
      title: "Date Night",
      description: "2 Burgers + 2 Shakes + 1 Large Fries",
      price: 29.99,
      originalPrice: 36.99,
      image: "💑"
    },
    {
      id: 1004,
      title: "Burger Lover",
      description: "3 Different Burgers + 3 Sides", 
      price: 39.99,
      originalPrice: 47.99,
      image: "😋"
    }
  ];

  const handleAddOffer = (offer) => {
    const offerItem = {
      id: offer.id,
      name: offer.title,
      description: offer.description,
      price: offer.price,
      image: offer.image,
      isOffer: true
    };
    
    addToCart(offerItem);
  };

  return (
    <section id="offers" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Special <span className="text-primary-500">Offers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't miss out on these exclusive deals crafted just for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {specialOffers.map((offer, index) => (
            <div key={offer.id} className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl relative">
              <div className="flex flex-col h-full">
                <div className="text-4xl mb-3 text-center">{offer.image}</div>
                <h3 className="text-xl font-bold mb-2 text-center">{offer.title}</h3>
                <p className="text-primary-100 text-sm mb-4 text-center flex-grow">{offer.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${offer.price}</span>
                    <span className="text-primary-200 line-through text-sm">${offer.originalPrice}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleAddOffer(offer)}
                  className="w-full bg-white text-primary-600 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  Grab Offer
                </button>
              </div>
              
              {offer.popular && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
              )}
              
              <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                SAVE ${(offer.originalPrice - offer.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;