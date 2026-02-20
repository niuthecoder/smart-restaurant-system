import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiCheck, FiClock, FiTruck, FiX, FiRefreshCw, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real orders from Spring Boot - FIXED VERSION
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching orders from backend...');
      
      // Use adminAPI instead of direct fetch
      const ordersData = await adminAPI.getOrders();
      const list = Array.isArray(ordersData) ? ordersData : (ordersData?.content ?? []);
      setOrders(list);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError('Failed to fetch orders. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status with real API call
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      await adminAPI.updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Refresh orders
    } catch (err) {
      console.error('❌ Error updating order:', err);
      setError('Failed to update order status.');
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || (order.status || '').toUpperCase() === filter
  );

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING': return 'bg-blue-100 text-blue-800';
      case 'READY': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'PENDING': return <FiClock className="mr-2" />;
      case 'PREPARING': return <FiShoppingCart className="mr-2" />;
      case 'READY': return <FiCheck className="mr-2" />;
      case 'COMPLETED': return <FiTruck className="mr-2" />;
      default: return <FiClock className="mr-2" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiRefreshCw className="animate-spin text-4xl text-primary-500" />
        <span className="ml-3 text-lg">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Real orders from your Spring Boot backend</p>
          <p className="text-sm text-green-600">✅ Backend Connected - {orders.length} orders loaded</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
          
          {['all', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                  <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} flex items-center`}>
                    {getStatusIcon(order.status)}
                    {order.status || 'PENDING'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  {order.tableId && (
                    <div className="flex items-center">
                      <FiUser className="mr-2" />
                      <span>Table {order.tableId}</span>
                    </div>
                  )}
                  {order.customerName && (
                    <div className="flex items-center">
                      <FiUser className="mr-2" />
                      <span>{order.customerName}</span>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="flex items-center">
                      <FiPhone className="mr-2" />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}
                  {order.deliveryAddress && (
                    <div className="flex items-center">
                      <FiMapPin className="mr-2" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>
                
                {order.totalAmount && (
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4 lg:mt-0 flex-wrap">
                {((order.status || '').toUpperCase() === 'PENDING') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Start Preparing
                  </button>
                )}
                {((order.status || '').toUpperCase() === 'PREPARING') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'READY')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Mark Ready
                  </button>
                )}
                {((order.status || '').toUpperCase() === 'READY') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Complete Order
                  </button>
                )}
                <button 
                  onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <FiX className="inline" /> Cancel
                </button>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Order Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center text-sm">
                      <span>
                        {item.quantity}x {item.itemName || `Item ${item.id}`}
                        {item.priceAtOrder && <span className="text-gray-500 ml-2">(${item.priceAtOrder} each)</span>}
                      </span>
                      <span className="font-semibold">
                        ${item.subtotal ? item.subtotal.toFixed(2) : (item.priceAtOrder * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.totalAmount && (
                    <div className="flex justify-between items-center font-bold border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No orders matching filter'}
          </h3>
          <p className="text-gray-600">
            {orders.length === 0 
              ? 'Orders will appear here when customers place them.' 
              : 'Try changing your filter criteria.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;