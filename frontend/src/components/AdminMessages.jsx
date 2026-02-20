import React, { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { messagesAPI } from '../services/api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // string
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await messagesAPI.getAllAdmin();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('AdminMessages error:', e);

      // ✅ show real error text (super important)
      setError(e?.message || 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchMessages, 10000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const sorted = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [messages]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Customer contact messages</p>

          {error && (
            <div className="mt-2 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
              {error}
              <div className="mt-1 text-xs opacity-80">
                Tip: if it says 401/403 → your admin token is missing/expired in localStorage authToken.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto refresh
          </label>

          <button
            onClick={fetchMessages}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center py-10 justify-center text-gray-600">
          <FiRefreshCw className="animate-spin mr-2" />
          Loading messages...
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No messages yet.</div>
      ) : (
        <div className="space-y-4">
          {sorted.map((m) => (
            <div key={m.id} className="border rounded-xl p-4 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="font-semibold text-gray-900">
                  {m.name} <span className="text-gray-500 font-normal">({m.email})</span>
                </div>
                <div className="text-sm text-gray-500">
                  {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                </div>
              </div>
              <p className="mt-3 text-gray-700 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
