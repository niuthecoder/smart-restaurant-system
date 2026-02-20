import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiClock, FiStar, FiUsers, FiAward } from 'react-icons/fi';

const About = () => {
  const { t } = useTranslation();
  return (
    <section id="about" className="relative py-20 persian-pattern-bg">
      <div className="persian-corners max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-mono-900 mb-4 persian-section-title">
            {t('about.title')}
          </h2>
          <span className="persian-title-band" aria-hidden />
          <p className="text-lg text-mono-600 max-w-2xl mx-auto mt-6">
            {t('about.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="font-display text-2xl font-bold text-mono-900 mb-6">
              {t('about.storyTitle')}
            </h3>
            <div className="space-y-4 text-mono-600 leading-relaxed">
              <p>{t('about.story1')}</p>
              <p>{t('about.story2')}</p>
              <p>{t('about.story3')}</p>
            </div>
            <div className="mt-8 p-6 bg-mono-50 rounded-sm border border-mono-200 persian-card">
              <p className="text-mono-700 italic mb-4">"{t('about.quote')}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-mono-700 text-mono-100 font-semibold text-sm shrink-0 flex items-center justify-center">
                  NK
                </div>
                <div>
                  <div className="font-semibold text-mono-900">{t('about.founderName')}</div>
                  <div className="text-mono-600 text-sm">{t('about.founderTitle')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-sm h-96 overflow-hidden border border-mono-200 bg-mono-100 group">
              <img
                src="/images/menu/pic.png"
                alt={t('about.founderName')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: FiUsers, value: '50K+', label: t('about.statsCustomers') },
                { icon: FiStar, value: '4.9', label: t('about.statsRating') },
                { icon: FiClock, value: '13', label: t('about.statsYears') },
                { icon: FiAward, value: '12', label: t('about.statsAwards') },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="persian-card bg-mono-50 p-5 rounded-sm border border-mono-200 text-center">
                  <Icon className="text-mono-500 w-6 h-6 mx-auto mb-2" />
                  <div className="text-xl font-bold text-mono-900">{value}</div>
                  <div className="text-mono-600 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="persian-card bg-mono-50 rounded-sm border border-mono-200 p-8">
          <h3 className="font-display text-2xl font-bold text-center text-mono-900 mb-8">{t('about.valuesTitle')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-mono-200 rounded-sm hover:border-mono-400 transition-colors">
              <div className="text-3xl mb-3">🌱</div>
              <h4 className="font-display text-lg font-bold text-mono-900 mb-2">{t('about.value1Title')}</h4>
              <p className="text-mono-600 text-sm">{t('about.value1Text')}</p>
            </div>
            <div className="text-center p-6 border border-mono-200 rounded-sm hover:border-mono-400 transition-colors">
              <div className="text-3xl mb-3">👨‍🍳</div>
              <h4 className="font-display text-lg font-bold text-mono-900 mb-2">{t('about.value2Title')}</h4>
              <p className="text-mono-600 text-sm">{t('about.value2Text')}</p>
            </div>
            <div className="text-center p-6 border border-mono-200 rounded-sm hover:border-mono-400 transition-colors">
              <div className="text-3xl mb-3">❤️</div>
              <h4 className="font-display text-lg font-bold text-mono-900 mb-2">{t('about.value3Title')}</h4>
              <p className="text-mono-600 text-sm">{t('about.value3Text')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
