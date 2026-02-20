// src/components/WaiterDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FiLogOut,
  FiCoffee,
  FiUsers,
  FiShoppingCart,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import WaiterOrderModal from './WaiterOrderModal';
import StripePaymentModal from './StripePaymentModal';
import { waiterAPI, paymentsAPI, getReceiptUrl } from '../services/api';
import toast from 'react-hot-toast';

const WaiterDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('tables');
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [payingOrderAmount, setPayingOrderAmount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tablesData, ordersData] = await Promise.all([
        waiterAPI.getTables(),
        waiterAPI.getActiveOrders(),
      ]);

      setTables(Array.isArray(tablesData) ? tablesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setTables([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateOrder = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const [tipByOrderId, setTipByOrderId] = useState({});

  const handleMarkServed = async (orderId) => {
    const tip = tipByOrderId[orderId] != null ? Number(tipByOrderId[orderId]) : null;
    try {
      await waiterAPI.completeOrder(orderId, tip);
      setTipByOrderId((prev) => ({ ...prev, [orderId]: undefined }));
      fetchData();
    } catch (err) {
      console.error('Error marking order as served:', err);
      toast.error('Failed to mark served');
    }
  };

  const handleSetStatus = async (orderId, status) => {
    try {
      await waiterAPI.updateOrderStatus(orderId, status);
      fetchData();
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update status');
    }
  };

  const getOrderStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
      case 'cooking':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const normalizeOrders = useMemo(() => {
    // This prevents white screen crashes and makes UI consistent
    const arr = Array.isArray(orders) ? orders : [];

    return arr.map((o) => {
      const itemsArr = Array.isArray(o.items) ? o.items : [];
      const itemsText =
        itemsArr.length === 0
          ? 'No items'
          : itemsArr
              .map((it) => {
                const name = it?.itemName || it?.menuItem?.name || 'Item';
                const qty = Number(it?.quantity ?? 0);
                return `${qty}× ${name}`;
              })
              .join(', ');

      const total =
        typeof o.totalAmount === 'number'
          ? o.totalAmount
          : typeof o.totalPrice === 'number'
          ? o.totalPrice
          : 0;

      const status = o.status || 'PENDING';

      return {
        ...o,
        _uiItemsText: itemsText,
        _uiTotal: total,
        _uiStatus: status,
      };
    });
  }, [orders]);

  const renderTables = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 transition-all hover:shadow-xl ${
            table.occupied ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Table {table.number}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                table.occupied ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {table.occupied ? 'Occupied' : 'Available'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Capacity:</span>
              <span className="font-semibold">{table.capacity} people</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${table.occupied ? 'text-red-600' : 'text-green-600'}`}>
                {table.occupied ? 'Busy' : 'Ready'}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleCreateOrder(table)}
            disabled={table.occupied}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              table.occupied
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600 transform hover:scale-105'
            }`}
          >
            <FiPlus className="inline mr-2" />
            Take Order
          </button>
        </div>
      ))}
    </div>
  );

  const renderOrders = () => {
    if (!normalizeOrders || normalizeOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <FiShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No active orders</h3>
          <p className="text-gray-500">Orders will appear here when created</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {normalizeOrders.map((order) => {
          const orderId = order?.id ?? 'N/A';
          const tableId = order?.tableId ?? 'N/A';
          const customerName = order?.customerName?.trim() ? order.customerName : `Table ${tableId}`;
          const status = order?._uiStatus || 'PENDING';

          return (
            <div key={orderId} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{orderId} - Table {tableId}
                  </h3>
                  <p className="text-gray-600">Customer: {customerName}</p>
                  {order?.orderTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.orderTime).toLocaleString()}
                    </p>
                  )}
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusColor(status)}`}>
                  {String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase()}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 font-medium mb-2">Items:</p>
                <p className="text-gray-600">{order._uiItemsText}</p>

                {order?.notes && (
                  <>
                    <p className="text-gray-700 font-medium mt-4 mb-2">Notes:</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{order.notes}</p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-lg font-bold text-primary-600">${Number(order._uiTotal || 0).toFixed(2)}</div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={getReceiptUrl(orderId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Receipt
                  </a>
                  {!order?.paidAt && (
                    <button
                      onClick={() => {
                        setPayingOrderId(orderId);
                        setPayingOrderAmount(order?.totalAmount ?? 0);
                      }}
                      className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
                    >
                      Pay (Stripe)
                    </button>
                  )}
                  {(status || '').toLowerCase() === 'pending' && (
                    <button
                      onClick={() => handleSetStatus(orderId, 'PREPARING')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                    >
                      Start Preparing
                    </button>
                  )}
                  {(status || '').toLowerCase() === 'preparing' && (
                    <button
                      onClick={() => handleSetStatus(orderId, 'READY')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Mark Ready
                    </button>
                  )}
                  {(status || '').toLowerCase() === 'ready' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600">Tip $</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={tipByOrderId[orderId] ?? ''}
                        onChange={(e) => setTipByOrderId((prev) => ({ ...prev, [orderId]: e.target.value }))}
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => handleMarkServed(orderId)}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <FiCheckCircle className="mr-2" />
                        Mark Served
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary-500 text-white p-2 rounded-xl mr-3">
                <FiCoffee className="text-xl" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                  Waiter Dashboard
                </span>
                <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
              <button onClick={onLogout} className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Active Tables</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {tables.filter((t) => t.occupied).length} / {tables.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <FiShoppingCart className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Active Orders</p>
                <h3 className="text-2xl font-bold text-gray-900">{Array.isArray(orders) ? orders.length : 0}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full mr-4">
                <FiClock className="text-2xl text-orange-600" />
              </div>
              <div>
                <p className="text-gray-600">Ready to Serve</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {normalizeOrders.filter((o) => (o._uiStatus || '').toLowerCase() === 'ready').length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === 'tables' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Tables
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiShoppingCart className="inline mr-2" />
              Active Orders ({Array.isArray(orders) ? orders.length : 0})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">{error}</div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-lg text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">{activeTab === 'tables' ? renderTables() : renderOrders()}</div>
        )}
      </div>

      <WaiterOrderModal
        isOpen={isModalOpen}
        table={selectedTable}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTable(null);
        }}
        onOrderCreated={() => {
          fetchData();
        }}
      />

      {payingOrderId && (
        <StripePaymentModal
          orderId={payingOrderId}
          amount={payingOrderAmount}
          onSuccess={fetchData}
          onClose={() => { setPayingOrderId(null); setPayingOrderAmount(0); }}
        />
      )}
    </div>
  );
};

export default WaiterDashboard;
