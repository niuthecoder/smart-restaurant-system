import React, { useState, useEffect } from 'react';
import { qrAPI } from '../services/api';
import { tablesAPI } from '../services/api';

const AdminQr = () => {
  const [tables, setTables] = useState([]);
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tablesAPI.getTables()
      .then((data) => setTables(Array.isArray(data) ? data : []))
      .catch(() => setTables([]))
      .finally(() => setLoading(false));
  }, []);

  const loadUrl = (t) => {
    qrAPI.getTableUrl(t.number).then((res) => {
      setUrls((prev) => ({ ...prev, [t.id]: res?.url || res }));
    }).catch(() => setUrls((prev) => ({ ...prev, [t.id]: null })));
  };

  useEffect(() => {
    tables.forEach(loadUrl);
  }, [tables]);

  if (loading) return <div className="p-4">Loading tables...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Table QR codes</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Share the link or scan with a QR app. Each link opens the order page with table pre-filled.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((t) => (
          <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="font-bold text-lg">Table {t.number}</h3>
            {urls[t.id] ? (
              <>
                <a href={urls[t.id]} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 text-sm break-all hover:underline">
                  {urls[t.id]}
                </a>
                <p className="mt-2 text-xs text-gray-500">Open in new tab or generate QR at qr-code-generator.com</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading...</p>
            )}
          </div>
        ))}
      </div>
      {tables.length === 0 && <p className="text-gray-500">No tables. Add tables in Floor Plan.</p>}
    </div>
  );
};

export default AdminQr;
