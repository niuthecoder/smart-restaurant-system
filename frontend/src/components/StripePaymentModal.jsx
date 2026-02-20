import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiX } from 'react-icons/fi';
import { paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';

function PaymentForm({ orderId, clientSecret, amount, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
      });
      if (error) {
        toast.error(error.message || 'Payment failed');
      } else {
        toast.success('Payment processing... Order will update when complete.');
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      toast.error(err?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          Cancel
        </button>
        <button type="submit" disabled={!stripe || loading} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50">
          {loading ? 'Processing...' : `Pay $${(amount || 0).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentModal({ orderId, amount, onSuccess, onClose }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [config, intentRes] = await Promise.all([
          paymentsAPI.config().catch(() => ({ publishableKey: '', stripeConfigured: false })),
          paymentsAPI.createIntent(orderId),
        ]);
        if (cancelled) return;
        const pk = config?.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
        if (!pk) {
          setError('Stripe not configured. Add app.stripe.publishable-key or VITE_STRIPE_PUBLISHABLE_KEY.');
          return;
        }
        if (!intentRes?.clientSecret) {
          setError(intentRes?.error || 'Could not create payment');
          return;
        }
        setPublishableKey(pk);
        setClientSecret(intentRes.clientSecret);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to initialize payment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Payment</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><FiX /></button>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={onClose} className="w-full py-2 bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  if (loading || !clientSecret || !publishableKey) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  const stripePromise = loadStripe(publishableKey);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Pay Order #{orderId}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><FiX /></button>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm orderId={orderId} clientSecret={clientSecret} amount={amount} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}
