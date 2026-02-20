// src/components/AdminBookings.jsx
import React, { useState, useEffect } from 'react';
import { FiCalendar, FiUser, FiPhone, FiMail, FiClock, FiCheck, FiX, FiEdit, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const SALONS = ['SALON_1', 'SALON_2', 'SALON_3'];

const AdminBookings = () => {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [salonFilter, setSalonFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (salonFilter) params.salon = salonFilter;
      if (filter !== 'all') params.status = filter;
      if (search.trim()) params.search = search.trim();
      const reservationsData = await adminAPI.getReservations(params);
      setReservations(reservationsData);
    } catch (err) {
      setError('Failed to fetch reservations.');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filter, dateFilter, salonFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const updateReservationStatus = async (id, newStatus) => {
    try {
      await adminAPI.updateReservationStatus(id, newStatus);
      await fetchReservations();
    } catch (err) {
      setError('Failed to update reservation status.');
      console.error('Error updating reservation:', err);
    }
  };

  const filteredReservations = reservations.filter(reservation => 
    filter === 'all' || reservation.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiRefreshCw className="animate-spin text-4xl text-primary-500" />
        <span className="ml-3 text-lg">Loading reservations...</span>
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
          onClick={fetchReservations}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Table Reservations</h2>
          <p className="text-gray-600">Manage restaurant bookings</p>
          <p className="text-sm text-green-600">✅ {reservations.length} reservations loaded</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone"
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <button type="submit" className="px-3 py-2 bg-gray-200 rounded-lg text-sm">Search</button>
          </form>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <select
            value={salonFilter}
            onChange={(e) => setSalonFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">All salons</option>
            {SALONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={fetchReservations}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
          {['all', 'PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredReservations.map(reservation => (
          <div key={reservation.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2 flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Reservation #{reservation.id}</h3>
                  {reservation.reservationCode && (
                    <span className="text-sm font-mono text-gray-600">({reservation.reservationCode})</span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    reservation.status === 'NO_SHOW' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reservation.status || 'PENDING'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiUser className="mr-2" />
                    <span>{reservation.guestName}</span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="mr-2" />
                    <span>{reservation.guestPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="mr-2" />
                    <span>{new Date(reservation.reservationTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FiUser className="mr-2" />
                    <span>{reservation.guestCount} guests</span>
                  </div>
                </div>
                
                {reservation.guestEmail && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <FiMail className="mr-2" />
                    <span>{reservation.guestEmail}</span>
                  </div>
                )}
                
                {reservation.specialRequests && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Special requests:</strong> {reservation.specialRequests}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                {(!reservation.status || reservation.status === 'PENDING') && (
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                  >
                    <FiCheck className="mr-2" />
                    Confirm
                  </button>
                )}
                {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'NO_SHOW')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                  >
                    Mark NO_SHOW
                  </button>
                )}
                <button
                  onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                >
                  <FiX className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {reservations.length === 0 ? 'No reservations yet' : 'No reservations matching filter'}
          </h3>
          <p className="text-gray-600">
            {reservations.length === 0 
              ? 'Reservations will appear here when customers book tables.' 
              : 'Try changing your filter criteria.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;