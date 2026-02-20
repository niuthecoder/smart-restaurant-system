import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-400 dark:text-gray-500">{t('notFound.title')}</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">{t('notFound.message')}</p>
      <a href="#home" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600">
        <FiHome /> {t('notFound.backHome')}
      </a>
    </div>
  );
};

export default NotFoundPage;
