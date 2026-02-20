import React, { useState, useEffect, useRef } from 'react';
import { ordersAPI } from '../services/api';
import { FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';

function requestNotificationPermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  try { Notification.requestPermission(); } catch (_) {}
}

function showOrderNotification(orderId, status) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const msg = status === 'READY' ? 'Your order is ready for pickup!' : 'Your order has been completed. Thank you!';
  try {
    new Notification(`Order #${orderId}`, { body: msg, icon: '/logo-pomegranate.png' });
  } catch (_) {}
}

function getOrderIdFromHash() {
  const hash = window.location.hash || '';
  const q = hash.indexOf('?');
  if (q === -1) return null;
  const params = new URLSearchParams(hash.slice(q));
  const id = params.get('id');
  const n = parseInt(id, 10);
  return Number.isFinite(n) ? n : null;
}

const STATUS_LABELS = {
  PENDING: { label: 'Order received', color: 'text-yellow-600', icon: FiClock },
  PREPARING: { label: 'Being prepared', color: 'text-orange-600', icon: FiTruck },
  READY: { label: 'Ready for pickup/serve', color: 'text-green-600', icon: FiCheckCircle },
  COMPLETED: { label: 'Completed', color: 'text-gray-600', icon: FiCheckCircle },
};

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState(getOrderIdFromHash);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onHash = () => setOrderId(getOrderIdFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const prevStatusRef = useRef(null);
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setOrder(null);
      setError('No order ID');
      return;
    }
    requestNotificationPermission();
    let cancelled = false;
    const poll = async (isFirst) => {
      if (isFirst) { setLoading(true); setError(null); }
      try {
        const o = await ordersAPI.getOrder(orderId);
        if (!cancelled) {
          setOrder(o);
          const status = (o?.status || '').toUpperCase();
          if ((status === 'READY' || status === 'COMPLETED') && prevStatusRef.current !== status) {
            if (prevStatusRef.current !== null) showOrderNotification(orderId, status);
            prevStatusRef.current = status;
          }
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Order not found');
      } finally {
        if (!cancelled && isFirst) setLoading(false);
      }
    };
    poll(true);
    const interval = setInterval(() => poll(false), 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [orderId]);

  if (!orderId) {
    return (
      <section className="min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Track Your Order</h2>
          <p className="text-gray-600">Enter your order ID or use the link from your confirmation.</p>
          <a href="#order" className="mt-4 inline-block text-primary-500 hover:underline">Place an order</a>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading order #{orderId}...</p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <a href="#order" className="text-primary-500 hover:underline">Back to order</a>
        </div>
      </section>
    );
  }

  const status = (order.status || 'PENDING').toUpperCase();
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.PENDING;
  const Icon = statusInfo.icon;

  return (
    <section className="min-h-screen py-20 px-4 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order #{order.id}</h2>
        <p className="text-gray-500 text-sm mb-6">{order.orderType || 'Order'}</p>

        {'Notification' in window && Notification.permission === 'default' && (
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="w-full mb-4 px-4 py-2 text-sm bg-amber-50 border border-amber-200 rounded-lg text-amber-800 hover:bg-amber-100"
          >
            🔔 Enable browser notifications for order updates
          </button>
        )}
        <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${status === 'READY' || status === 'COMPLETED' ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <Icon className={`text-2xl ${statusInfo.color}`} />
          <div>
            <p className="font-semibold text-gray-900">{statusInfo.label}</p>
            <p className="text-sm text-gray-600">Status: {status}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex justify-between text-gray-700">
              <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
              <span>${((item.priceAtOrder || item.menuItem?.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <a href="#menu" className="text-center text-primary-500 hover:underline">Browse menu</a>
          {(status === 'COMPLETED' || status === 'READY') && (
            <a href="#reviews" className="text-center text-amber-600 hover:underline text-sm">Leave a review</a>
          )}
        </div>
      </div>
    </section>
  );
}
