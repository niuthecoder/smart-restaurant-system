import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { apiKeysAPI } from '../services/api';

const AdminApiKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiKeysAPI.list();
      setKeys(Array.isArray(data) ? data : []);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setCreatedKey(null);
    try {
      const res = await apiKeysAPI.create(newName.trim() || 'API Key');
      setCreatedKey(res);
      setNewName('');
      load();
    } catch (err) {
      setError(err?.message || 'Failed');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this key? It will stop working immediately.')) return;
    try {
      await apiKeysAPI.revoke(id);
      load();
    } catch (err) {
      setError(err?.message || 'Failed');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">API keys</h2>
      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">{error}</div>}
      {createdKey && (
        <div className="mb-4 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <p className="font-semibold text-amber-800 dark:text-amber-200">Save this key; it won&apos;t be shown again.</p>
          <code className="block mt-2 p-2 bg-white dark:bg-gray-800 rounded break-all">{createdKey.key}</code>
        </div>
      )}
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Key name"
          className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800"
        />
        <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2">
          <FiPlus /> Create key
        </button>
      </form>
      <div className="space-y-2">
        {keys.length === 0 && <p className="text-gray-500">No API keys. Create one to use X-API-Key header for API access.</p>}
        {keys.map((k) => (
          <div key={k.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
            <span className="font-medium">{k.name}</span>
            <span className="text-sm text-gray-500">Created {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : ''}</span>
            <button onClick={() => handleRevoke(k.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
              <FiTrash2 /> Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminApiKeys;
