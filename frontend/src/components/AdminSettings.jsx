import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const AdminSettings = () => {
  const [form, setForm] = useState({
    name: '',
    location: '',
    logoUrl: '',
    primaryColor: '#E63946',
    supportEmail: '',
    timezone: 'America/New_York',
    openTime: '11:00',
    closeTime: '22:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    adminAPI.getRestaurant()
      .then((r) => {
        setForm({
          name: r.name || '',
          location: r.location || '',
          logoUrl: r.logoUrl || '',
          primaryColor: r.primaryColor || '#E63946',
          supportEmail: r.supportEmail || '',
          timezone: r.timezone || 'America/New_York',
          openTime: r.openTime != null ? String(r.openTime).slice(0, 5) : '11:00',
          closeTime: r.closeTime != null ? String(r.closeTime).slice(0, 5) : '22:00',
        });
      })
      .catch(() => setMessage('Failed to load restaurant'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await adminAPI.updateRestaurant({
        ...form,
        openTime: form.openTime || null,
        closeTime: form.closeTime || null,
      });
      setMessage('Saved successfully');
    } catch (err) {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 p-4"><FiRefreshCw className="animate-spin" /> Loading...</div>;

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant settings</h2>
      <p className="text-gray-600 mb-4">Branding and opening hours (shown on the customer site).</p>
      {message && <p className={`mb-4 p-2 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input type="text" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" placeholder="/logo.png or https://..." />
          <p className="text-xs text-gray-500 mt-1">Put your logo (e.g. pomegranate) in frontend/public/ then use /logo.png</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary color</label>
          <input type="text" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" placeholder="#E63946" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Support email</label>
          <input type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Timezone</label>
          <input type="text" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" placeholder="America/New_York" />
          <p className="text-xs text-gray-500 mt-1">Used as restaurant “now” for bookings (e.g. Asia/Tehran, Europe/London). Must match your real local time.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Open time</label>
            <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Close time</label>
            <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50">
          <FiSave /> {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
