import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const AdminAuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAuditLog();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit log</h2>
        <button onClick={load} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
          <FiRefreshCw />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Entity</th>
              <th className="py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-gray-500">No entries</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                  {e.createdAt ? new Date(e.createdAt).toLocaleString() : '-'}
                </td>
                <td className="py-2 pr-4">{e.userName || '-'}</td>
                <td className="py-2 pr-4">{e.action || '-'}</td>
                <td className="py-2 pr-4">{e.entityType} #{e.entityId}</td>
                <td className="py-2">{e.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLog;
