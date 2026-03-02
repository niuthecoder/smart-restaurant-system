import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Food imagery more prominent – lighter overlay for appetite appeal */}
      <img
        src="/images/menu/joje.png"
        alt=""
        width={1920}
        height={1080}
        fetchpriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover scale-105 blur-[1px] select-none pointer-events-none"
        aria-hidden
      />
      <div className="absolute inset-0 bg-mono-900/45" />

      {/* Persian corner frame */}
      <div className="persian-corners absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-mono-400/40 rounded-tl-md" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-mono-400/40 rounded-tr-md" />
        <div className="absolute bottom-24 left-6 w-16 h-16 border-l-2 border-b-2 border-mono-400/40 rounded-bl-md" />
        <div className="absolute bottom-24 right-6 w-16 h-16 border-r-2 border-b-2 border-mono-400/40 rounded-br-md" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-mono-200/95 text-xs tracking-[0.3em] uppercase mb-8 animate-fade-in">
          {t('hero.badge')}
        </p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-4 tracking-tight animate-fade-in">
          {t('hero.title')}
          <span className="block text-mono-200/95 mt-2 text-5xl md:text-7xl lg:text-8xl">{t('hero.titleHighlight')}</span>
        </h1>
        <p className="text-mono-200/90 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in animation-delay-150">
          {t('hero.subtitle')}
        </p>

        {/* Unmissable CTAs – primary vs secondary hierarchy */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center animate-slide-up animation-delay-200">
          <button
            onClick={() => (window.location.hash = 'order')}
            className="cta-primary w-full sm:w-auto bg-mono-100 text-mono-900 px-10 py-4 text-lg font-semibold rounded-sm hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('hero.orderNow')}
          </button>
          <button
            onClick={() => (window.location.hash = 'book-table')}
            className="cta-secondary w-full sm:w-auto border-2 border-mono-200 text-mono-100 px-10 py-4 text-lg font-semibold rounded-sm hover:border-white hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {t('hero.bookTable')}
          </button>
          <button
            onClick={() => {
              window.location.hash = 'menu';
              setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 0);
            }}
            className="cta-secondary w-full sm:w-auto border-2 border-mono-300/60 text-mono-200 px-10 py-4 text-lg font-semibold rounded-sm hover:border-white hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {t('hero.viewMenu')}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-24 text-mono-200/90">
          <div>
            <div className="text-3xl font-bold text-white">50+</div>
            <div className="text-sm mt-1">{t('hero.statsDishes')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">15min</div>
            <div className="text-sm mt-1">{t('hero.statsWait')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">4.9★</div>
            <div className="text-sm mt-1">{t('hero.statsRating')}</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-mono-50 to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
