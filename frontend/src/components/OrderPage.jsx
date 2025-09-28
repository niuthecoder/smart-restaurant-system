import React, { useState } from 'react';
import { ordersAPI } from '../services/api';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiCreditCard, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const OrderPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    delivery: 'delivery'
  });

  const [currentStep, setCurrentStep] = useState(1);

  const getTax = () => getCartTotal() * 0.08;
  const getDeliveryFee = () => customerInfo.delivery === 'delivery' ? 2.99 : 0;
  const getGrandTotal = () => getCartTotal() + getTax() + getDeliveryFee();

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => { // Added async here
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Your cart is empty! Add some items first.');
      return;
    }

    try {
      // Prepare order data for backend
      const orderData = {
        customerInfo: customerInfo,
        items: cart,
        total: getGrandTotal(),
        orderType: customerInfo.delivery,
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      console.log('📦 Submitting order to backend:', orderData);
      
      // Send to Spring Boot backend
      const result = await ordersAPI.createOrder(orderData);
      
      alert(`🎉 Order placed successfully! Order ID: ${result.id}`);
      
      // Clear cart and reset form
      clearCart();
      setCurrentStep(1);
      setCustomerInfo({
        name: '', email: '', phone: '', address: '', delivery: 'delivery'
      });
      
    } catch (error) {
      console.error('❌ Order submission failed:', error);
      alert('❌ Failed to place order. Please try again.');
    }
  }; // Fixed: Removed the duplicate code that was after this function

  if (cart.length === 0 && currentStep === 1) {
    return (
      <section className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-xl text-gray-600 mb-8">Add some delicious burgers to get started!</p>
          <a 
            href="#menu" 
            onClick={(e) => { e.preventDefault(); window.location.hash = 'menu'; }}
            className="bg-primary-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-600 transition-all"
          >
            Browse Menu
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= step 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 transition-all ${
                    currentStep > step ? 'bg-primary-500' : 'bg-gray-300'
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
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiShoppingCart className="mr-3 text-primary-500" />
                  Your Order ({getCartCount()} items)
                </h2>

                {/* Cart Items */}
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{item.image}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-primary-600 font-bold">${item.price}</p>
                          {item.isOffer && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Special Offer</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-all"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="font-semibold text-gray-900 min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-all"
                        >
                          <FiPlus size={14} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all ml-2"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
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
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${getGrandTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-600 transition-all transform hover:scale-105 mt-6"
                >
                  Continue to Checkout
                </button>
              </div>
            )}

            {/* Customer Information Step */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Delivery Information</h2>
                
                <form className="space-y-6">
                  {/* Delivery Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Order Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setCustomerInfo({...customerInfo, delivery: 'delivery'})}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          customerInfo.delivery === 'delivery' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <FiTruck className="text-2xl mb-2 mx-auto" />
                        <div className="font-semibold">Delivery</div>
                        <div className="text-sm text-gray-600">$2.99 fee</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerInfo({...customerInfo, delivery: 'pickup'})}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          customerInfo.delivery === 'pickup' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <FiShoppingCart className="text-2xl mb-2 mx-auto" />
                        <div className="font-semibold">Pickup</div>
                        <div className="text-sm text-gray-600">Free</div>
                      </button>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    {customerInfo.delivery === 'delivery' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={customerInfo.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="123 Main Street, City, State ZIP"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      Back to Cart
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 bg-primary-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-600 transition-all"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiCreditCard className="mr-3 text-primary-500" />
                  Payment Information
                </h2>

                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Holder *</label>
                      <input
                        type="text"
                        placeholder="JOHN DOE"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <div className="flex items-center text-yellow-800">
                      <div className="text-lg mr-2">⚠️</div>
                      <div className="text-sm">
                        <strong>Test Mode:</strong> This is a demo. No real payment will be processed.
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      Back to Details
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 transition-all transform hover:scale-105"
                    >
                      Place Order - ${getGrandTotal().toFixed(2)}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
              
              {/* Cart Items Preview */}
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="mr-2">{item.image}</span>
                      <span className="truncate max-w-[120px]">{item.name}</span>
                      <span className="text-gray-500 ml-1">x{item.quantity}</span>
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
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${getGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="mt-4 p-3 bg-primary-50 rounded-xl text-center">
                <div className="text-sm text-primary-700">
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
}; // This closing brace was missing

export default OrderPage;