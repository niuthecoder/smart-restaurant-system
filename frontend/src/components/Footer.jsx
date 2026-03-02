import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMapPin, FiPhone, FiMail, FiClock, FiHeart, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success(`Thank you for subscribing with ${email}!`);
      setEmail('');
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-mono-900 text-mono-100 border-t border-mono-800">
      <div className="persian-corners persian-corners-on-dark max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">
          <div className="lg:col-span-1">
            <span className="font-display text-xl font-bold text-mono-50">
              {t('nav.brand')}
            </span>
            <p className="text-mono-400 mt-4 mb-6 leading-relaxed text-sm">
              {t('footer.taglineLong')}
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-sm bg-mono-800 flex items-center justify-center text-mono-300 hover:bg-mono-700 hover:text-mono-100 transition-colors">
                <FiFacebook size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-sm bg-mono-800 flex items-center justify-center text-mono-300 hover:bg-mono-700 hover:text-mono-100 transition-colors">
                <FiInstagram size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-sm bg-mono-800 flex items-center justify-center text-mono-300 hover:bg-mono-700 hover:text-mono-100 transition-colors">
                <FiTwitter size={16} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-mono-200 uppercase tracking-wider mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><a href="#menu" className="text-mono-400 hover:text-mono-100 text-sm transition-colors">{t('footer.ourMenu')}</a></li>
              <li><a href="#offers" className="text-mono-400 hover:text-mono-100 text-sm transition-colors">{t('footer.specialOffers')}</a></li>
              <li><a href="#about" className="text-mono-400 hover:text-mono-100 text-sm transition-colors">{t('footer.aboutUs')}</a></li>
              <li><a href="#book-table" className="text-mono-400 hover:text-mono-100 text-sm transition-colors">{t('footer.bookATable')}</a></li>
              <li><a href="#contact" className="text-mono-400 hover:text-mono-100 text-sm transition-colors">{t('footer.contactUs')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-mono-200 uppercase tracking-wider mb-4">{t('footer.contactInfo')}</h3>
            <div className="space-y-3 text-sm text-mono-400">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 shrink-0 text-mono-500" />
                <span>{t('footer.address')}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="shrink-0 text-mono-500" />
                <span>{t('footer.phone')}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="shrink-0 text-mono-500" />
                <span>{t('footer.email')}</span>
              </div>
              <div className="flex items-start gap-3">
                <FiClock className="mt-0.5 shrink-0 text-mono-500" />
                <span>{t('footer.hours')}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-mono-200 uppercase tracking-wider mb-4">{t('footer.newsletter')}</h3>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <label htmlFor="newsletter-email" className="sr-only">{t('footer.newsletter')}</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletterPlaceholder')}
                className="w-full px-3 py-2.5 rounded-sm bg-mono-800 border border-mono-700 text-mono-100 placeholder-mono-400 focus:outline-none focus:border-mono-500 text-sm"
                required
              />
              <button
                type="submit"
                className="w-full bg-mono-700 text-mono-100 py-2.5 rounded-sm font-medium hover:bg-mono-600 transition-colors text-sm"
              >
                {subscribed ? t('footer.subscribed') : t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-mono-800 mt-12 pt-8">
          <p className="text-center text-mono-500 text-xs mb-4">{t('footer.weAccept')}</p>
          <div className="flex justify-center gap-4 text-mono-500 text-lg">
            <span>💳</span><span>🅿️</span><span>📱</span><span>💰</span>
          </div>
        </div>
      </div>
      <div className="border-t border-mono-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-mono-500 text-xs">
            <p>© {currentYear} {t('nav.brand')}. {t('footer.rights')} {t('footer.developedBy') && <span className="mr-2">· {t('footer.developedBy')}</span>}<FiHeart className="inline text-mono-500" /></p>
            <div className="flex gap-6">
              <span className="hover:text-mono-300 transition-colors cursor-default">{t('footer.privacy')}</span>
              <span className="hover:text-mono-300 transition-colors cursor-default">{t('footer.terms')}</span>
              <span className="hover:text-mono-300 transition-colors cursor-default">{t('footer.cookies')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
