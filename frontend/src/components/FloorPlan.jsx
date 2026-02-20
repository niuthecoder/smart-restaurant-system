// Simple floor plan: grid of tables (occupied / available). For Admin or Waiter.
import React, { useState, useEffect } from 'react';
import { waiterAPI } from '../services/api';

const FloorPlan = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    waiterAPI.getTables()
      .then((data) => setTables(Array.isArray(data) ? data : []))
      .catch(() => setTables([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading tables...</div>;

  const bySalon = tables.reduce((acc, t) => {
    const s = t.salon || 'Other';
    if (!acc[s]) acc[s] = [];
    acc[s].push(t);
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Floor plan</h2>
      {Object.entries(bySalon).map(([salon, list]) => (
        <div key={salon}>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">{salon}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {list.map((t) => (
              <div
                key={t.id}
                className={`rounded-lg p-3 text-center border-2 ${
                  t.occupied ? 'bg-red-100 border-red-400 text-red-800' : 'bg-green-100 border-green-400 text-green-800'
                }`}
              >
                <div className="font-bold">T{t.number}</div>
                <div className="text-xs">{t.capacity} seats</div>
                <div className="text-xs mt-1">{t.occupied ? 'Occupied' : 'Free'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloorPlan;
