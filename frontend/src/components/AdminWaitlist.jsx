import React, { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { waitlistAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminWaitlist = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    waitlistAPI.list()
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleNotify = async (id) => {
    try {
      await waitlistAPI.setStatus(id, 'NOTIFIED');
      load();
    } catch (e) {
      toast.error('Failed');
    }
  };

  const waiting = entries.filter((e) => e.status === 'WAITING');

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Waitlist</h2>
      <div className="space-y-3">
        {waiting.length === 0 && <p className="text-gray-500">No one waiting.</p>}
        {waiting.map((e) => (
          <div key={e.id} className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <div>
              <p className="font-semibold">{e.guestName}</p>
              <p className="text-sm text-gray-600">{e.guestPhone} · Party of {e.partySize}</p>
              {e.notes && <p className="text-sm text-gray-500">{e.notes}</p>}
            </div>
            <button onClick={() => handleNotify(e.id)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <FiCheckCircle /> Notify
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminWaitlist;
