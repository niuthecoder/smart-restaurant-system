import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const SpecialOffers = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const specialOffers = [
    { id: 1001, title: "Kebab & Rice Combo", description: "Joojeh Kebab + Zereshk Polo + Doogh", price: 24.99, originalPrice: 29.99, image: "🎯", popular: true },
    { id: 1002, title: "Family Feast", description: "4 Kebabs + 4 Rice + 4 Drinks", price: 59.99, originalPrice: 69.99, image: "👨‍👩‍👧‍👦" },
    { id: 1003, title: "Date Night", description: "2 Kebabs + 2 Rice + Shared Appetizer", price: 34.99, originalPrice: 41.99, image: "💑" },
    { id: 1004, title: "Persian Feast", description: "3 Kebabs + 3 Stews + Sides", price: 49.99, originalPrice: 56.99, image: "😋" },
  ];

  const handleAddOffer = (offer) => {
    addToCart({
      id: offer.id,
      name: offer.title,
      description: offer.description,
      price: offer.price,
      image: offer.image,
      isOffer: true,
    });
  };

  return (
    <section id="offers" className="relative py-20 persian-pattern-bg">
      <div className="persian-corners max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-mono-900 mb-4 persian-section-title">
            {t('offers.title')} {t('offers.titleHighlight')}
          </h2>
          <span className="persian-title-band" aria-hidden />
          <p className="text-lg text-mono-600 max-w-2xl mx-auto mt-6">
            {t('offers.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {specialOffers.map((offer) => (
            <div key={offer.id} className="persian-card bg-mono-50 rounded-sm border border-mono-200 p-6 flex flex-col hover:border-mono-400 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 relative">
              <div className="text-3xl mb-3 text-center">{offer.image}</div>
              <h3 className="text-lg font-bold text-mono-900 mb-2 text-center">{t(`specialOffers.${offer.id}.title`, { defaultValue: offer.title })}</h3>
              <p className="text-mono-600 text-sm mb-4 text-center flex-grow">{t(`specialOffers.${offer.id}.description`, { defaultValue: offer.description })}</p>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <span className="text-xl font-bold text-mono-900">${offer.price}</span>
                <span className="text-mono-400 line-through text-sm">${offer.originalPrice}</span>
              </div>
              <button
                onClick={() => handleAddOffer(offer)}
                className="w-full bg-mono-800 text-mono-50 py-2.5 rounded-sm font-medium hover:bg-mono-700 active:scale-[0.98] transition-all duration-200 text-sm"
              >
                {t('offers.grabOffer')}
              </button>
              {offer.popular && (
                <span className="absolute top-3 right-3 text-mono-500 text-xs font-medium uppercase tracking-wider">{t('offers.popular')}</span>
              )}
              <span className="absolute top-3 left-3 text-mono-500 text-xs">
                {t('offers.save')} ${(offer.originalPrice - offer.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
