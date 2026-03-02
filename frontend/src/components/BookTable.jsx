import React, { useEffect, useMemo, useState } from 'react';
import { FiUsers, FiClock, FiCalendar, FiCheck } from 'react-icons/fi';
import { reservationsAPI, tablesAPI, availabilityAPI } from '../services/api';
import toast from 'react-hot-toast';

const SALONS = [
  { key: 'SALON_1', label: 'Salon 1 (Non-Smoking)', smokingAllowed: false },
  { key: 'SALON_2', label: 'Salon 2 (Smoking Allowed)', smokingAllowed: true },
  { key: 'SALON_3', label: 'Salon 3 (Smoking Allowed)', smokingAllowed: true },
];

const BookTable = () => {
  const [selectedSalon, setSelectedSalon] = useState('SALON_1');
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);

  const [reservedTableIds, setReservedTableIds] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  const [bookingInfo, setBookingInfo] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: '',
    email: '',
    specialRequests: '',
  });

  const [bookingStep, setBookingStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Available time slots (all options)
  const allTimeSlots = [
    '11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM',
    '5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM'
  ];

  /** True if the given date + time slot is already in the past (browser local time). */
  const isSlotInPast = (dateStr, timeSlot) => {
    if (!dateStr || !timeSlot) return false;
    const [timePart, ampm] = timeSlot.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const slotDate = new Date(dateStr);
    slotDate.setHours(h, m, 0, 0);
    return slotDate.getTime() <= Date.now();
  };

  /** For today, only show slots that are still in the future. */
  const timeSlots = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (bookingInfo.date !== today) return allTimeSlots;
    return allTimeSlots.filter((slot) => !isSlotInPast(today, slot));
  }, [bookingInfo.date]);

  useEffect(() => {
    if (bookingInfo.date && bookingInfo.time && timeSlots.length > 0 && !timeSlots.includes(bookingInfo.time)) {
      setBookingInfo((prev) => ({ ...prev, time: '' }));
    }
  }, [bookingInfo.date, bookingInfo.time, timeSlots]);

  // ------------------------
  // Fetch tables from backend
  // ------------------------
  useEffect(() => {
  const loadTables = async () => {
    try {
      setTablesLoading(true);
      const data = await tablesAPI.getTables(); // /api/tables
      setTables(data || []);
    } catch (e) {
      console.error('Failed to load tables', e);
      setTables([]);
    } finally {
      setTablesLoading(false);
    }
  };

  loadTables();
}, []);
  // If backend doesn't have salon fields yet, derive by table.number
  const normalizedTables = useMemo(() => {
    return (tables || []).map((t) => {
      let salon = t.salon;
      let smokingAllowed = t.smokingAllowed;

      if (!salon) {
        const n = t.number;
        if (n <= 10) { salon = 'SALON_1'; smokingAllowed = false; }
        else if (n <= 20) { salon = 'SALON_2'; smokingAllowed = true; }
        else { salon = 'SALON_3'; smokingAllowed = true; }
      }

      return {
        ...t,
        salon,
        smokingAllowed,
        seats: t.capacity ?? 4,
      };
    });
  }, [tables]);

  const salonTables = useMemo(() => {
    return normalizedTables
      .filter(t => t.salon === selectedSalon)
      .sort((a, b) => a.number - b.number);
  }, [normalizedTables, selectedSalon]);

  const handleInputChange = (e) => {
    setBookingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSalonChange = (salonKey) => {
    setSelectedSalon(salonKey);
    setSelectedTable(null);
    setBookingStep(1);
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setBookingInfo(prev => ({ ...prev, guests: Math.min(prev.guests, table.seats) }));
  };

  const buildReservationPayload = () => {
    const { date, time, guests, name, phone, email, specialRequests } = bookingInfo;

    const [timePart, ampm] = time.split(' ');
    let [hour, minute] = timePart.split(':').map(Number);

    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const time24 = `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}:00`;
    const reservationTime = `${date}T${time24}`;

    return {
      guestName: name,
      guestPhone: phone,
      guestEmail: email,
      tableId: selectedTable?.id, // ✅ DB id
      reservationTime,
      guestCount: Number(guests),
      specialRequests,
    };
  };

  // -------------------------------------------
  // Check reserved tables for selected date/time
  // -------------------------------------------
  useEffect(() => {
    const checkReserved = async () => {
      if (!bookingInfo.date || !bookingInfo.time) {
        setReservedTableIds([]);
        return;
      }

      try {
        const { date, time } = bookingInfo;
        const [timePart, ampm] = time.split(' ');
        let [hour, minute] = timePart.split(':').map(Number);
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const available = await availabilityAPI.getAvailability(date, time24);
        const availableIds = new Set(Array.isArray(available) ? available.map((t) => t.id).filter(Boolean) : []);
        const allTableIds = normalizedTables?.map((t) => t.id) ?? [];
        const reserved = allTableIds.filter((id) => !availableIds.has(id));
        setReservedTableIds(reserved);

        // If currently selected becomes reserved, unselect it
        if (selectedTable?.id && reserved.includes(selectedTable.id)) {
          setSelectedTable(null);
          setBookingStep(1);
        }
      } catch (e) {
        console.error('Reserved check failed:', e);
        setReservedTableIds([]);
      }
    };

    checkReserved();
  }, [bookingInfo.date, bookingInfo.time, normalizedTables, selectedTable?.id]);

  const handleBookTable = async (e) => {
    e.preventDefault();

    if (!selectedTable) return toast.error('Please select a table first!');
    if (reservedTableIds.includes(selectedTable.id)) return toast.error('This table is already booked for that time.');
    if (isSlotInPast(bookingInfo.date, bookingInfo.time)) {
      return toast.error('That date and time are in the past. Please choose a future time.');
    }

    try {
      setSubmitting(true);
      const payload = buildReservationPayload();
      const res = await reservationsAPI.createReservation(payload);
      const code = res?.reservationCode ? ` Reservation code: ${res.reservationCode}` : '';
      toast.success(`Booked! Table ${selectedTable.number} • ${bookingInfo.date} at ${bookingInfo.time}${code}`, { duration: 6000 });

      setSelectedTable(null);
      setBookingInfo({
        date: '',
        time: '',
        guests: 2,
        name: '',
        phone: '',
        email: '',
        specialRequests: '',
      });
      setReservedTableIds([]);
      setBookingStep(1);
    } catch (err) {
      console.error('Failed to create reservation', err);
      const msg = err?.message || String(err);
      const isPast = msg.includes('past') || msg.includes('in the past');
      const isConflict = msg.includes('409') || msg.includes('TABLE_ALREADY_BOOKED') || msg.includes('TIME_SLOT_CONFLICT') || msg.includes('currently in use');
      const isValidation = msg.includes('400') || msg.includes('required');
      const userMsg = isPast
        ? 'That time is in the past. Please choose a future date and time.'
        : isConflict
          ? 'This table (or time slot) is already booked or in use. Please pick another table or time.'
          : isValidation
            ? 'Invalid booking (check date, time, and table). Try again.'
            : `Booking failed: ${msg.length > 80 ? msg.slice(0, 80) + '…' : msg}`;
      toast.error(userMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="book-table" className="relative min-h-screen persian-pattern-bg py-20">
      <div className="persian-corners max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />

        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-mono-900 mb-4 persian-section-title">
            Book a <span className="text-mono-500">Table</span>
          </h2>
          <span className="persian-title-band" aria-hidden />
          <p className="text-lg text-mono-600 max-w-3xl mx-auto mt-6">
            Choose a salon and reserve one of our 30 tables (4 seats each)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Left: Table selection + form */}
          <div className="persian-card bg-mono-50 rounded-sm border border-mono-200 shadow-soft-lg p-8">
            <h3 className="font-display text-2xl font-bold text-mono-900 mb-6">
              {bookingStep === 1 ? 'Select Your Table' : 'Confirm Your Booking'}
            </h3>

            {/* Salon selector */}
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              {SALONS.map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleSalonChange(s.key)}
                  className={`p-3 rounded-sm border-2 text-sm font-semibold transition-all ${
                    selectedSalon === s.key ? 'border-mono-800 bg-mono-100' : 'border-mono-200'
                  }`}
                >
                  <div>{s.label}</div>
                </button>
              ))}
            </div>

            {bookingStep === 1 ? (
              <>
                {tablesLoading ? (
                  <div className="py-10 text-center text-mono-600">Loading tables...</div>
                ) : salonTables.length === 0 ? (
                  <div className="py-10 text-center text-amber-700 bg-amber-50 rounded-sm border border-amber-200">
                    No tables available. Make sure the backend is running (e.g. Docker or <code className="text-sm">mvn spring-boot:run</code>) and the app is using the correct API URL.
                  </div>
                ) : (
                  <>
                    {/* Simple grid of tables */}
                    <div className="grid grid-cols-5 gap-3 mb-6">
                      {salonTables.map(table => {
                        const isReserved = reservedTableIds.includes(table.id);

                        return (
                          <button
                            key={table.id}
                            type="button"
                            disabled={isReserved}
                            onClick={() => !isReserved && handleTableSelect(table)}
                            className={`h-14 rounded-sm border-2 font-bold transition-all ${
                              isReserved
                                ? 'border-mono-200 bg-mono-100 text-mono-400 cursor-not-allowed'
                                : selectedTable?.id === table.id
                                  ? 'border-green-600 bg-green-50'
                                  : 'border-mono-200 bg-mono-50 hover:border-mono-400'
                            }`}
                            title={
                              isReserved
                                ? 'Already booked for selected date/time'
                                : `${table.smokingAllowed ? 'Smoking Allowed' : 'Non-Smoking'}`
                            }
                          >
                            {table.number}
                          </button>
                        );
                      })}
                    </div>

                    {/* Salon info */}
                    <div className="mb-6 p-4 rounded-sm bg-mono-100 border border-mono-200">
                      <div className="text-sm text-mono-700">
                        <strong>Rules:</strong>{' '}
                        {selectedSalon === 'SALON_1'
                          ? 'Non-Smoking only.'
                          : 'Smoking is allowed in this salon.'}
                      </div>
                      <div className="text-sm text-mono-600 mt-1">All tables are 4 seats.</div>
                      <div className="text-xs text-mono-500 mt-1">
                        Tip: pick date & time first to see booked tables disabled.
                      </div>
                    </div>

                    {/* Date/Time quick pick (optional but useful) */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-mono-700 mb-2">
                          <FiCalendar className="inline mr-2" />
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={bookingInfo.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-mono-700 mb-2">
                          <FiClock className="inline mr-2" />
                          Time *
                        </label>
                        <select
                          name="time"
                          value={bookingInfo.time}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => selectedTable && setBookingStep(2)}
                      disabled={!selectedTable}
                      className={`w-full py-4 rounded-sm font-semibold transition-all ${
                        selectedTable
                          ? 'bg-mono-800 text-mono-50 hover:bg-mono-700'
                          : 'bg-mono-200 text-mono-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedTable ? `Book Table ${selectedTable.number}` : 'Select a Table to Continue'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <form onSubmit={handleBookTable} className="space-y-6">
                <div className="bg-mono-100 border border-mono-200 rounded-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-mono-900">Selected Table</h4>
                      <p className="text-sm text-mono-600">
                        Table {selectedTable?.number} • 4 seats • {selectedSalon}
                        {' • '}
                        {selectedTable?.smokingAllowed ? 'Smoking Allowed' : 'Non-Smoking'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="text-mono-600 hover:text-mono-800 text-sm font-semibold"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">
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
                      className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">
                      <FiClock className="inline mr-2" />
                      Time *
                    </label>
                    <select
                      name="time"
                      value={bookingInfo.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-2">
                    <FiUsers className="inline mr-2" />
                    Guests * (Max: 4)
                  </label>
                  <select
                    name="guests"
                    value={bookingInfo.guests}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                  >
                    {[1,2,3,4].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingInfo.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mono-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingInfo.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-mono-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={bookingInfo.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-2">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={bookingInfo.specialRequests}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-sm border border-mono-200 focus:outline-none focus:border-mono-500"
                    placeholder="Birthday, allergies, wheelchair access, etc."
                  />
                </div>

                <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="flex-1 bg-mono-200 text-mono-700 py-4 rounded-sm font-semibold hover:bg-mono-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 bg-mono-800 text-mono-50 py-4 rounded-sm font-semibold transition-all ${
                        submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-mono-700'
                      }`}
                    >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right column (keep yours / you can expand later) */}
          <div className="space-y-6">
            <div className="persian-card bg-mono-50 rounded-sm border border-mono-200 shadow-soft p-6">
              <h3 className="font-display text-xl font-bold text-mono-900 mb-4">Why Book With Us?</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-3" />
                  <span>Guaranteed table reservation</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-3" />
                  <span>Choose salon (smoking / non-smoking)</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-500 mr-3" />
                  <span>Easy booking in seconds</span>
                </div>
              </div>
            </div>

            <div className="bg-mono-800 rounded-sm shadow-soft p-6 text-mono-100">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="mb-4">Our team is happy to assist:</p>
              <div className="space-y-2">
                <div>📞 +1 (555) 123-PERSIAN</div>
                <div>✉️ reservations@saffronhouse.com</div>
                <div>🕒 9AM-9PM daily</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BookTable;
