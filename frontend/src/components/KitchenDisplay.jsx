// Kitchen display: PENDING → PREPARING → READY. Large, clear layout for kitchen staff.
import React, { useState, useEffect, useMemo } from 'react';
import { FiRefreshCw, FiClock, FiCheckCircle, FiPrinter, FiLogOut } from 'react-icons/fi';
import { waiterAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_ORDER = ['PENDING', 'PREPARING', 'READY'];

const KitchenDisplay = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      const data = await waiterAPI.getActiveOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSetStatus = async (orderId, status) => {
    try {
      await waiterAPI.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const normalized = useMemo(() => {
    return (Array.isArray(orders) ? orders : []).map((o) => {
      const itemsArr = Array.isArray(o.items) ? o.items : [];
      const itemsText = itemsArr.length === 0
        ? 'No items'
        : itemsArr.map((it) => {
            const name = it?.itemName || it?.menuItem?.name || 'Item';
            const qty = Number(it?.quantity ?? 0);
            return `${qty}× ${name}`;
          }).join(' • ');
      return {
        ...o,
        id: o.id,
        tableId: o.tableId ?? '—',
        customerName: o.customerName?.trim() || `Table ${o.tableId ?? ''}`,
        status: (o.status || 'PENDING').toUpperCase(),
        itemsText,
        total: typeof o.totalAmount === 'number' ? o.totalAmount : 0,
        notes: o.notes,
      };
    });
  }, [orders]);

  const byStatus = useMemo(() => {
    const map = { PENDING: [], PREPARING: [], READY: [] };
    normalized.forEach((o) => {
      const s = o.status;
      if (map[s]) map[s].push(o);
    });
    return map;
  }, [normalized]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <FiRefreshCw className="animate-spin text-4xl text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-3xl md:text-4xl font-bold">Kitchen</h1>
        <div className="flex gap-2">
          <a href="#waiter-dashboard" className="flex items-center gap-2 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">
            Waiter
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 print:hidden"
          >
            <FiPrinter /> Print
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <FiRefreshCw /> Refresh
          </button>
          {typeof onLogout === 'function' && (
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-700 rounded-lg hover:bg-red-600">
              <FiLogOut /> Logout
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {!error && normalized.length === 0 && (
        <p className="text-gray-400 mb-4 text-center">No active orders. Create orders from the Waiter dashboard.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="rounded-xl bg-gray-800 p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {status === 'PENDING' && <FiClock className="text-yellow-400" />}
              {status === 'PREPARING' && <FiClock className="text-orange-400" />}
              {status === 'READY' && <FiCheckCircle className="text-green-400" />}
              {status}
              <span className="text-gray-400 font-normal">({byStatus[status]?.length ?? 0})</span>
            </h2>
            <div className="space-y-4">
              {(byStatus[status] || []).map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-700 rounded-lg p-4 border-l-4 border-white"
                >
                  <div className="text-lg font-semibold">#{order.id} — Table {order.tableId}</div>
                  <div className="text-gray-300 mt-1">{order.customerName}</div>
                  <div className="mt-2 text-sm text-gray-200">{order.itemsText}</div>
                  {order.notes && (
                    <div className="mt-2 text-amber-300 text-sm">Note: {order.notes}</div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleSetStatus(order.id, 'PREPARING')}
                        className="px-4 py-2 bg-orange-500 rounded-lg font-semibold hover:bg-orange-600"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleSetStatus(order.id, 'READY')}
                        className="px-4 py-2 bg-green-500 rounded-lg font-semibold hover:bg-green-600"
                      >
                        Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDisplay;
