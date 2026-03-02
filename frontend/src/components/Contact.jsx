import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiInstagram } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { messagesAPI } from '../services/api';

const Contact = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [status, setStatus] = useState({ state: 'idle', msg: '' });

  useEffect(() => {
    if (window.location.hash === '#contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'sending', msg: '' });

    try {
      await messagesAPI.send({
        name: form.name.trim(),
        email: form.email.trim(),
        content: form.content.trim(),
      });

      setStatus({ state: 'success', msg: t('contact.sent') });
      setForm({ name: '', email: '', content: '' });
    } catch (err) {
      setStatus({ state: 'error', msg: err?.message || t('contact.failed') });
    }
  };

  return (
    <section id="contact" className="relative py-20 persian-pattern-bg scroll-mt-20">
      <div className="persian-corners max-w-2xl mx-auto px-4">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />
        <h2 className="font-display text-4xl font-bold text-center text-mono-900 mb-4 persian-section-title">{t('contact.title')}</h2>
        <span className="persian-title-band" aria-hidden />

        <div className="flex justify-center gap-6 mb-10 mt-8">
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-sm border border-mono-200 text-mono-700 hover:bg-mono-100 hover:border-mono-400 transition-colors"
            aria-label="WhatsApp"
          >
            <FaWhatsapp className="text-2xl text-[#25D366]" />
            <span className="font-medium">WhatsApp</span>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-sm border border-mono-200 text-mono-700 hover:bg-mono-100 hover:border-mono-400 transition-colors"
            aria-label="Instagram"
          >
            <FiInstagram className="text-2xl text-mono-700" />
            <span className="font-medium">Instagram</span>
          </a>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label htmlFor="contact-name" className="sr-only">{t('contact.namePlaceholder')}</label>
          <input
            id="contact-name"
            className="w-full border border-mono-200 rounded-sm p-3 bg-mono-50 text-mono-900 placeholder-mono-600 focus:outline-none focus:border-mono-500"
            name="name"
            placeholder={t('contact.namePlaceholder')}
            value={form.name}
            onChange={onChange}
            required
          />
          <label htmlFor="contact-email" className="sr-only">{t('contact.emailPlaceholder')}</label>
          <input
            id="contact-email"
            className="w-full border border-mono-200 rounded-sm p-3 bg-mono-50 text-mono-900 placeholder-mono-600 focus:outline-none focus:border-mono-500"
            name="email"
            type="email"
            placeholder={t('contact.emailPlaceholder')}
            value={form.email}
            onChange={onChange}
            required
          />
          <label htmlFor="contact-message" className="sr-only">{t('contact.messagePlaceholder')}</label>
          <textarea
            id="contact-message"
            className="w-full border border-mono-200 rounded-sm p-3 min-h-[140px] bg-mono-50 text-mono-900 placeholder-mono-600 focus:outline-none focus:border-mono-500"
            name="content"
            placeholder={t('contact.messagePlaceholder')}
            value={form.content}
            onChange={onChange}
            required
          />

          <button
            disabled={status.state === 'sending'}
            className="w-full bg-mono-800 text-mono-50 py-3 rounded-sm font-medium hover:bg-mono-700 disabled:opacity-60 transition-colors"
            type="submit"
          >
            {status.state === 'sending' ? t('contact.sending') : t('contact.send')}
          </button>

          {status.state !== 'idle' && (
            <div
              role="status"
              aria-live="polite"
              className={`p-3 rounded-sm text-center text-sm ${
                status.state === 'success'
                  ? 'bg-mono-200/50 text-mono-800 border border-mono-300'
                  : status.state === 'error'
                  ? 'bg-mono-200/50 text-mono-700 border border-mono-400'
                  : 'bg-mono-100 text-mono-700 border border-mono-200'
              }`}
            >
              {status.msg}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
