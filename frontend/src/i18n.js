import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import fa from './locales/fa.json';

const LANG_KEY = 'app-lang';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  ar: { translation: ar },
  fa: { translation: fa },
};

const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANG_KEY, lng);
  } catch (_) {}
});

export default i18n;
