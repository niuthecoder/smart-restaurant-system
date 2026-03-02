import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ordersAPI } from '../services/api';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiCreditCard, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { resolveMenuImage } from '../data/menuImageMap';
import toast from 'react-hot-toast';

function getTableIdFromHash() {
  const hash = window.location.hash || '';
  const q = hash.indexOf('?');
  if (q === -1) return null;
  const params = new URLSearchParams(hash.slice(q));
  const t = params.get('table');
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

const OrderPage = () => {
  const { t } = useTranslation();
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
  const [tableFromUrl, setTableFromUrl] = useState(getTableIdFromHash);
  useEffect(() => {
    const onHash = () => setTableFromUrl(getTableIdFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    delivery: tableFromUrl != null ? 'dine_in' : 'delivery'
  });

  const [currentStep, setCurrentStep] = useState(1);

  const [tipPercent, setTipPercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const getTax = () => getCartTotal() * 0.08;
  const getDeliveryFee = () => (customerInfo.delivery === 'delivery' ? 2.99 : 0);
  const getTip = () => getCartTotal() * (tipPercent / 100);
  const getGrandTotal = () => getCartTotal() + getTax() + getDeliveryFee() + getTip();

  const resolvedTableId = customerInfo.delivery === 'dine_in' ? tableFromUrl : null;
  const orderTypeMap = { delivery: 'DELIVERY', pickup: 'PICKUP', dine_in: 'DINE_IN' };

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => {
  e.preventDefault();

  if (cart.length === 0) return toast.error('Your cart is empty!');
  if (submitting) return;
  setSubmitting(true);

  try {
    const payload = {
      tableId: resolvedTableId ?? null,
      customerName: customerInfo.name.trim() || (resolvedTableId ? `Table ${resolvedTableId}` : 'Guest'),
      customerPhone: customerInfo.phone?.trim() || null,
      customerEmail: customerInfo.email?.trim() || null,
      orderType: orderTypeMap[customerInfo.delivery] || 'PICKUP',
      deliveryAddress: customerInfo.delivery === 'delivery' ? customerInfo.address.trim() : null,
      notes: customerInfo.notes?.trim() || null,
      tipAmount: getTip() > 0 ? parseFloat(getTip().toFixed(2)) : null,
      items: cart.map((c) => ({
        menuItemId: c.id,
        menuItemName: c.name,
        quantity: c.quantity || 1,
      })),
    };

    console.log('✅ Order payload:', payload);

    const result = await ordersAPI.createOrder(payload);

    const estMin = customerInfo.delivery === 'dine_in' ? 15 : customerInfo.delivery === 'pickup' ? 20 : 35;
    const estMax = customerInfo.delivery === 'dine_in' ? 25 : customerInfo.delivery === 'pickup' ? 30 : 45;
    toast.success(`Order #${result.id} placed! Estimated ready in ${estMin}-${estMax} min.`, { duration: 6000 });
    if (typeof window !== 'undefined') {
      const recent = JSON.parse(localStorage.getItem('recentOrderIds') || '[]');
      recent.unshift({ id: result.id, at: Date.now() });
      localStorage.setItem('recentOrderIds', JSON.stringify(recent.slice(0, 10)));
      window.location.hash = `order-status?id=${result.id}`;
    }

    clearCart();
    setCurrentStep(1);
    setCustomerInfo({ name: '', email: '', phone: '', address: '', notes: '', delivery: tableFromUrl != null ? 'dine_in' : 'delivery' });
  } catch (error) {
    console.error('❌ Order failed:', error);
    toast.error(error?.message || 'Failed to place order');
  } finally {
    setSubmitting(false);
  }
};

  if (cart.length === 0 && currentStep === 1) {
    const recentIds = (() => {
      try {
        return JSON.parse(localStorage.getItem('recentOrderIds') || '[]');
      } catch { return []; }
    })();
    return (
      <section className="min-h-screen persian-pattern-bg py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-4xl font-bold text-mono-900 mb-4">Your cart is empty</h2>
          <p className="text-lg text-mono-600 mb-8">{t('order.emptyPrompt')}</p>
          <a 
            href="#menu" 
            onClick={(e) => { e.preventDefault(); window.location.hash = 'menu'; }}
            className="bg-mono-800 text-mono-50 px-8 py-3 rounded-sm font-semibold hover:bg-mono-700 transition-all"
          >
            {t('order.browseMenu')}
          </a>
          {recentIds.length > 0 && (
            <div className="mt-8 p-4 bg-mono-50 rounded-sm border border-mono-200 inline-block">
              <p className="text-mono-600 mb-2">Track a recent order:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {recentIds.slice(0, 5).map((r) => (
                  <a
                    key={r.id}
                    href={`#order-status?id=${r.id}`}
                    className="px-3 py-1 bg-mono-100 hover:bg-mono-200 rounded-sm text-sm"
                  >
                    Order #{r.id}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen persian-pattern-bg py-20">
      <div className="persian-corners max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />
        
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4 sm:space-x-8">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all ${
                  currentStep >= step 
                    ? 'bg-mono-800 text-mono-50 shadow-soft' 
                    : 'bg-mono-200 text-mono-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 transition-all ${
                    currentStep > step ? 'bg-mono-800' : 'bg-mono-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart & Order Summary */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="persian-card bg-mono-50 rounded-sm border border-mono-200 shadow-soft-lg p-6 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-mono-900 mb-6 flex items-center">
                  <FiShoppingCart className="mr-3 text-mono-500" />
                  Your Order ({getCartCount()} items)
                </h2>

                {/* Cart Items */}
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-mono-100 rounded-sm">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm overflow-hidden flex items-center justify-center bg-mono-200 shrink-0">
                          {(() => {
                            const imgSrc = resolveMenuImage({ name: item.name, image: item.image }) || item.image;
                            const showImg = imgSrc && (imgSrc.startsWith('/') || imgSrc.startsWith('http'));
                            return showImg ? (
                              <img src={imgSrc} alt={item.name} loading="lazy" decoding="async" width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl sm:text-2xl">{item.image || '🍽️'}</span>
                            );
                          })()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-mono-900 truncate">{item.name}</h3>
                          <p className="text-mono-700 font-bold text-sm">${item.price}</p>
                          {item.isOffer && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-sm">Special Offer</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-mono-200 flex items-center justify-center hover:bg-mono-300 transition-all"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="font-semibold text-mono-900 min-w-[24px] text-center text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-mono-800 text-mono-50 flex items-center justify-center hover:bg-mono-700 transition-all"
                        >
                          <FiPlus size={12} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-8 p-5 bg-mono-100 border border-mono-200 rounded-sm">
                  <h3 className="font-semibold text-mono-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span>${getTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>${getDeliveryFee().toFixed(2)}</span>
                    </div>
                    {tipPercent > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Tip ({tipPercent}%)</span>
                        <span>${getTip().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${getGrandTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-5 bg-mono-50 border border-mono-200 rounded-sm">
                  <p className="text-sm font-medium text-mono-700 mb-3">Add a tip for the team</p>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 10, 15, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPercent(pct)}
                        className={`px-4 py-2 rounded-sm text-sm font-semibold transition-all ${
                          tipPercent === pct
                            ? 'bg-mono-800 text-mono-50'
                            : 'bg-mono-100 text-mono-700 hover:bg-mono-200'
                        }`}
                      >
                        {pct === 0 ? 'No tip' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-mono-800 text-mono-50 py-4 rounded-sm font-semibold hover:bg-mono-700 transition-all mt-6"
                >
                  Continue to Checkout
                </button>
              </div>
            )}

            {/* Customer Information Step */}
            {currentStep === 2 && (
              <div className="persian-card bg-mono-50 rounded-sm border border-mono-200 shadow-soft-lg p-6 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-mono-900 mb-6">Delivery Information</h2>
                
                <form className="space-y-6">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-4">Order Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setCustomerInfo({ ...customerInfo, delivery: 'dine_in' })}
                        className={`p-4 rounded-sm border-2 transition-all ${
                          customerInfo.delivery === 'dine_in' ? 'border-mono-800 bg-mono-100' : 'border-mono-200'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">🍽️</span>
                        <div className="font-semibold">Dine-in</div>
                        <div className="text-sm text-mono-600">
                          {tableFromUrl != null ? `Table ${tableFromUrl}` : 'At restaurant'}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerInfo({ ...customerInfo, delivery: 'delivery' })}
                        className={`p-4 rounded-sm border-2 transition-all ${
                          customerInfo.delivery === 'delivery' ? 'border-mono-800 bg-mono-100' : 'border-mono-200'
                        }`}
                      >
                        <FiTruck className="text-2xl mb-2 mx-auto" />
                        <div className="font-semibold">Delivery</div>
                        <div className="text-sm text-mono-600">$2.99 fee</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerInfo({...customerInfo, delivery: 'pickup'})}
                        className={`p-4 rounded-sm border-2 transition-all ${
                          customerInfo.delivery === 'pickup' 
                            ? 'border-mono-800 bg-mono-100' 
                            : 'border-mono-200'
                        }`}
                      >
                        <FiShoppingCart className="text-2xl mb-2 mx-auto" />
                        <div className="font-semibold">Pickup</div>
                        <div className="text-sm text-mono-600">Free</div>
                      </button>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-mono-700 mb-2">
                        Email <span className="text-mono-500 font-normal">(optional — receive order confirmation by email)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-mono-700 mb-2">Order notes (optional)</label>
                      <textarea
                        name="notes"
                        value={customerInfo.notes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        placeholder="Allergies, special requests..."
                      />
                    </div>
                    {customerInfo.delivery === 'delivery' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-mono-700 mb-2">Delivery Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={customerInfo.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                          placeholder="123 Main Street, City, State ZIP"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-mono-200 text-mono-700 py-4 rounded-sm font-semibold hover:bg-mono-300 transition-all"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customerInfo.name.trim()) return toast.error('Please enter your name.');
                        if (!customerInfo.phone.trim()) return toast.error('Please enter your phone number.');
                        if (customerInfo.delivery === 'delivery' && !customerInfo.address.trim()) return toast.error('Please enter a delivery address.');
                        setCurrentStep(3);
                      }}
                      className="flex-1 bg-mono-800 text-mono-50 py-4 rounded-sm font-semibold hover:bg-mono-700 transition-all"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 3 && (
              <div className="persian-card bg-mono-50 rounded-sm border border-mono-200 shadow-soft-lg p-6 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-mono-900 mb-6 flex items-center">
                  <FiCreditCard className="mr-3 text-mono-500" />
                  Payment Information
                </h2>

                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-2">Card Holder *</label>
                      <input
                        type="text"
                        placeholder="JOHN DOE"
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-mono-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4">
                    <div className="flex items-center text-yellow-800">
                      <div className="text-lg mr-2">⚠️</div>
                      <div className="text-sm">
                        <strong>Test Mode:</strong> Your payment will be marked as accepted and your order will be sent to the restaurant's admin dashboard for processing. No real payment will be processed.
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 bg-mono-200 text-mono-700 py-4 rounded-sm font-semibold hover:bg-mono-300 transition-all"
                    >
                      Back to Details
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-mono-800 text-mono-50 py-4 rounded-sm font-semibold hover:bg-mono-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Placing order...' : `Place Order - $${getGrandTotal().toFixed(2)}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="persian-card bg-mono-50 rounded-sm border border-mono-200 shadow-soft p-6 sticky top-20">
              <h3 className="font-bold text-mono-900 mb-4 text-lg">Order Summary</h3>
              
              {/* Cart Items Preview */}
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const imgSrc = resolveMenuImage({ name: item.name, image: item.image }) || item.image;
                        const showImg = imgSrc && (imgSrc.startsWith('/') || imgSrc.startsWith('http'));
                        return showImg ? (
                          <img src={imgSrc} alt="" loading="lazy" decoding="async" width={24} height={24} className="w-6 h-6 rounded object-cover shrink-0" />
                        ) : (
                          <span className="text-sm">{item.image || '🍽️'}</span>
                        );
                      })()}
                      <span className="truncate max-w-[120px]">{item.name}</span>
                      <span className="text-mono-500 ml-1">x{item.quantity}</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>${getDeliveryFee().toFixed(2)}</span>
                </div>
                {tipPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Tip ({tipPercent}%)</span>
                    <span>${getTip().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${getGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="mt-4 p-3 bg-mono-100 border border-mono-200 rounded-sm text-center">
                <div className="text-sm text-mono-700">
                  🕒 Estimated {customerInfo.delivery === 'delivery' ? 'delivery' : 'pickup'} time: 
                  <strong> 25-35 minutes</strong>
                </div> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 

export default OrderPage;