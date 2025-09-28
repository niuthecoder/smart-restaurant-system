import React, { useState } from 'react';
import { FiUsers, FiClock, FiCalendar, FiCheck, FiX } from 'react-icons/fi';

const BookTable = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [bookingInfo, setBookingInfo] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    email: '',
    specialRequests: ''
  });
  const [bookingStep, setBookingStep] = useState(1); // 1: Select table, 2: Booking form

  // Table data
  const tables = [
    { id: 1, seats: 4, type: 'standard', position: { top: '20%', left: '15%' } },
    { id: 2, seats: 4, type: 'standard', position: { top: '20%', left: '35%' } },
    { id: 3, seats: 4, type: 'standard', position: { top: '20%', left: '55%' } },
    { id: 4, seats: 4, type: 'standard', position: { top: '20%', left: '75%' } },
    { id: 5, seats: 6, type: 'large', position: { top: '50%', left: '25%' } },
    { id: 6, seats: 4, type: 'vip', position: { top: '50%', left: '45%' } },
    { id: 7, seats: 4, type: 'vip', position: { top: '50%', left: '65%' } },
    { id: 8, seats: 4, type: 'vip', position: { top: '70%', left: '15%' } },
    { id: 9, seats: 4, type: 'vip', position: { top: '70%', left: '35%' } },
    { id: 10, seats: 4, type: 'vip', position: { top: '70%', left: '75%' } }
  ];

  // Available time slots
  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  const handleInputChange = (e) => {
    setBookingInfo({
      ...bookingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setBookingInfo(prev => ({
      ...prev,
      guests: Math.min(prev.guests, table.seats)
    }));
  };

  const handleBookTable = (e) => {
    e.preventDefault();
    
    if (!selectedTable) {
      alert('Please select a table first!');
      return;
    }

    // Here you would connect to your backend
    alert(`🎉 Table booked successfully!\n\nTable ${selectedTable.id} (${selectedTable.seats} seats)\n${bookingInfo.date} at ${bookingInfo.time}\nFor ${bookingInfo.guests} guests`);
    
    // Reset form
    setSelectedTable(null);
    setBookingInfo({
      date: '',
      time: '',
      guests: 2,
      name: '',
      phone: '',
      email: '',
      specialRequests: ''
    });
    setBookingStep(1);
  };

  const getTableColor = (table) => {
    switch (table.type) {
      case 'vip': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'large': return 'bg-gradient-to-br from-blue-400 to-blue-600';
      default: return 'bg-gradient-to-br from-primary-400 to-primary-600';
    }
  };

  const getTableLabel = (table) => {
    switch (table.type) {
      case 'vip': return 'VIP';
      case 'large': return 'Large';
      default: return 'Standard';
    }
  };

  return (
    <section id="book-table" className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Book a <span className="text-primary-500">Table</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Reserve your spot for an unforgettable dining experience at Burger House
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Table Selection */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {bookingStep === 1 ? 'Select Your Table' : 'Confirm Your Booking'}
            </h3>

            {bookingStep === 1 ? (
              <>
                {/* Table Layout Visualization */}
                <div className="relative bg-gray-100 rounded-2xl h-96 mb-6 border-2 border-gray-200">
                  {/* Restaurant Layout Elements */}
                  <div className="absolute inset-4 bg-green-100 rounded-lg border border-green-200">
                    {/* Windows */}
                    <div className="absolute top-4 left-4 right-4 h-8 bg-blue-100 rounded-t-lg border-b border-blue-200"></div>
                    
                    {/* Tables */}
                    {tables.map(table => (
                      <div
                        key={table.id}
                        onClick={() => handleTableSelect(table)}
                        className={`absolute w-16 h-16 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-110 ${
                          selectedTable?.id === table.id 
                            ? 'ring-4 ring-green-400 scale-110' 
                            : 'hover:ring-2 hover:ring-white'
                        } ${getTableColor(table)}`}
                        style={table.position}
                      >
                        <div className="flex flex-col items-center justify-center h-full text-white">
                          <FiUsers className="mb-1" />
                          <span className="text-xs font-bold">{table.seats}</span>
                          <span className="text-[10px] opacity-90">{getTableLabel(table)}</span>
                        </div>
                      </div>
                    ))}

                    {/* Kitchen Area */}
                    <div className="absolute bottom-4 left-4 right-4 h-12 bg-red-100 rounded-b-lg border-t border-red-200 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-semibold">Kitchen</span>
                    </div>
                  </div>
                </div>

                {/* Table Legend */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center justify-center p-3 bg-primary-500 rounded-lg text-white">
                    <FiUsers className="mr-2" />
                    <span>Standard (4 seats)</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-blue-500 rounded-lg text-white">
                    <FiUsers className="mr-2" />
                    <span>Large (6 seats)</span>
                  </div>
                  <div className="flex items-center justify-center p-3 bg-yellow-500 rounded-lg text-white">
                    <FiUsers className="mr-2" />
                    <span>VIP (4 seats)</span>
                  </div>
                </div>

                <button
                  onClick={() => selectedTable && setBookingStep(2)}
                  disabled={!selectedTable}
                  className={`w-full py-4 rounded-xl font-semibold transition-all transform ${
                    selectedTable 
                      ? 'bg-primary-500 text-white hover:bg-primary-600 hover:scale-105' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedTable ? `Book Table ${selectedTable.id}` : 'Select a Table to Continue'}
                </button>
              </>
            ) : (
              /* Booking Form */
              <form onSubmit={handleBookTable} className="space-y-6">
                {/* Selected Table Info */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Selected Table</h4>
                      <p className="text-sm text-gray-600">
                        Table {selectedTable.id} • {selectedTable.seats} seats • {getTableLabel(selectedTable)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                    >
                      Change Table
                    </button>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiCalendar className="inline mr-2" />
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={bookingInfo.date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiClock className="inline mr-2" />
                      Time *
                    </label>
                    <select
                      name="time"
                      value={bookingInfo.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUsers className="inline mr-2" />
                    Number of Guests * (Max: {selectedTable?.seats})
                  </label>
                  <select
                    name="guests"
                    value={bookingInfo.guests}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[...Array(selectedTable?.seats || 6).keys()].map(i => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingInfo.name}
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
                      value={bookingInfo.phone}
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
                      value={bookingInfo.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={bookingInfo.specialRequests}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Any special requirements or celebrations?"
                  ></textarea>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 transition-all transform hover:scale-105"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column - Restaurant Info */}
          <div className="space-y-6">
            {/* Restaurant Hours */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Restaurant Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Thursday</span>
                  <span className="font-semibold">11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Friday - Saturday</span>
                  <span className="font-semibold">11:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-semibold">12:00 PM - 9:00 PM</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Book With Us?</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-3" />
                  <span>Guanteed table reservation</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-3" />
                  <span>VIP seating options available</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-3" />
                  <span>Special occasion arrangements</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-3" />
                  <span>15-minute grace period</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="mb-4">Our team is happy to assist with your reservation:</p>
              <div className="space-y-2">
                <div>📞 (555) 123-BURGER</div>
                <div>✉️ reservations@burgerhouse.com</div>
                <div>🕒 Available 9AM-9PM daily</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookTable;