import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { waitlistAPI } from '../services/api';

const WaitlistPage = () => {
  const { t } = useTranslation();
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await waitlistAPI.join({ guestName, guestPhone, guestEmail: guestEmail || undefined, partySize, notes });
      setSubmitted(true);
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setPartySize(2);
      setNotes('');
    } catch (err) {
      setError(err?.message || 'Failed to join waitlist');
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('waitlist.title')}</h1>
        <p className="text-gray-600 mb-6">{t('waitlist.subtitle')}</p>
        {submitted && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">{t('waitlist.success')}</div>
        )}
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('waitlist.name')} *</label>
            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('waitlist.phone')} *</label>
            <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('waitlist.emailOptional')}</label>
            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('waitlist.partySize')}</label>
            <input type="number" min="1" max="20" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('waitlist.notes')}</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="High chair, etc." />
          </div>
          <button type="submit" className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600">
            {t('waitlist.join')}
          </button>
        </form>
      </div>
    </section>
  );
};

export default WaitlistPage;
