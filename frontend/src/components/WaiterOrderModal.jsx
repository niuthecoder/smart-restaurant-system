// src/components/WaiterOrderModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FiX, FiMinus, FiPlus, FiShoppingCart, FiRefreshCw } from 'react-icons/fi';
import { menuAPI, waiterAPI } from '../services/api';

const WaiterOrderModal = ({ isOpen, onClose, table, onOrderCreated }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [qtyById, setQtyById] = useState({}); // { [menuItemId]: quantity }
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset modal state when opening/closing or table changes
  useEffect(() => {
    if (!isOpen) return;
    setQtyById({});
    setCustomerName('');
    setCustomerPhone('');
    setError('');
  }, [isOpen, table?.id]);

  const fetchMenu = async () => {
    try {
      setLoadingMenu(true);
      setError('');
      const data = await menuAPI.getMenuItems(); // GET /api/menuitems
      const list = Array.isArray(data) ? data : [];
      // only available items (optional)
      setMenuItems(list.filter((x) => x.available !== false));
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to load menu');
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const setQty = (id, next) => {
    setQtyById((prev) => {
      const n = Math.max(0, Number(next) || 0);
      if (n === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: n };
    });
  };

  const selectedItems = useMemo(() => {
    const map = new Map(menuItems.map((m) => [m.id, m]));
    return Object.entries(qtyById)
      .map(([id, q]) => ({
        menuItemId: Number(id),
        quantity: Number(q),
        menuItem: map.get(Number(id)),
      }))
      .filter((x) => x.quantity > 0 && x.menuItem);
  }, [qtyById, menuItems]);

  const total = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + (it.menuItem?.price || 0) * it.quantity, 0);
  }, [selectedItems]);

  const handleSubmit = async () => {
    if (!table?.id) return;

    if (selectedItems.length === 0) {
      setError('Pick at least 1 item.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // ✅ matches your WaiterController DTO:
      // CreateOrderRequest { tableId, customerName, customerPhone, orderType, deliveryAddress, items:[{menuItemId, quantity}] }
      const payload = {
        tableId: table.id,
        customerName: customerName.trim() || `Table ${table.number || table.id}`,
        customerPhone: customerPhone.trim() || null,
        orderType: 'DINE_IN',
        deliveryAddress: null,
        items: selectedItems.map((it) => ({
          menuItemId: it.menuItemId,
          quantity: it.quantity,
        })),
      };

      const created = await waiterAPI.createOrder(payload);

      // let parent refresh
      if (typeof onOrderCreated === 'function') onOrderCreated(created);

      onClose?.();
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !submitting && onClose?.()}
      />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Take Order — Table {table?.number ?? table?.id}
              </h2>
              <p className="text-sm text-gray-600">Select items and submit to kitchen/admin</p>
            </div>

            <button
              onClick={() => !submitting && onClose?.()}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>

          {/* body */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* left: menu */}
            <div className="lg:col-span-2 p-5 border-r">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-gray-900">Menu</div>
                <button
                  onClick={fetchMenu}
                  disabled={loadingMenu || submitting}
                  className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm disabled:opacity-50"
                >
                  <FiRefreshCw className={loadingMenu ? 'animate-spin mr-2' : 'mr-2'} />
                  Refresh
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {loadingMenu ? (
                <div className="flex items-center justify-center py-12 text-gray-600">
                  <FiRefreshCw className="animate-spin mr-2" />
                  Loading menu...
                </div>
              ) : menuItems.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No menu items found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-auto pr-1">
                  {menuItems.map((m) => {
                    const q = qtyById[m.id] || 0;
                    return (
                      <div key={m.id} className="border rounded-xl p-4 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-gray-900">{m.name}</div>
                            <div className="text-sm text-gray-500">{m.category}</div>
                          </div>
                          <div className="font-bold text-gray-900">${Number(m.price).toFixed(2)}</div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            ID: {m.id} {m.available === false ? '(Unavailable)' : ''}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setQty(m.id, q - 1)}
                              disabled={submitting || q <= 0}
                              className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                            >
                              <FiMinus />
                            </button>
                            <div className="min-w-[28px] text-center font-semibold">{q}</div>
                            <button
                              onClick={() => setQty(m.id, q + 1)}
                              disabled={submitting}
                              className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 disabled:opacity-50"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* right: summary */}
            <div className="p-5">
              <div className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <FiShoppingCart />
                Order Summary
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Customer name (optional)</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Niusha"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 0555..."
                  />
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-gray-50 max-h-[35vh] overflow-auto">
                {selectedItems.length === 0 ? (
                  <div className="text-sm text-gray-500">No items selected.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map((it) => (
                      <div key={it.menuItemId} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{it.menuItem?.name}</div>
                          <div className="text-xs text-gray-500">
                            ${Number(it.menuItem?.price || 0).toFixed(2)} × {it.quantity}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900">
                          ${(Number(it.menuItem?.price || 0) * it.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-xl font-bold text-gray-900">${total.toFixed(2)}</div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || selectedItems.length === 0}
                className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Order'}
              </button>

              <button
                onClick={() => !submitting && onClose?.()}
                disabled={submitting}
                className="mt-3 w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <p className="mt-3 text-xs text-gray-500">
                This is demo flow: order will be saved and visible in Admin Orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterOrderModal;
