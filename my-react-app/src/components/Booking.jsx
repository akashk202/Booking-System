import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function Booking() {
  const location = useLocation();
  const selectedRoom = location.state?.room;

  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ startDate: '', endDate: '', guests: 1 });
  const [availability, setAvailability] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!selectedRoom) {
      setMessage('No room selected. Please choose a room from the dashboard.');
      return;
    }

    if (token) {
      fetchBookings();
    } else {
      setMessage('Please log in to view and make bookings.');
    }
  }, [token, selectedRoom]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      } else {
        setMessage(data.message || 'Failed to fetch bookings.');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
      setMessage('Error fetching bookings.');
    }
  };

  const checkAvailability = async () => {
    const { startDate, endDate } = form;

    if (!startDate || !endDate) {
      setMessage('Please fill out all fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setMessage('Start date cannot be later than end date.');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/bookings/check-availability?roomId=${selectedRoom._id}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setAvailability(data.available);
      setMessage(data.available ? 'Room is available!' : 'Room is not available.');
    } catch (err) {
      console.error('Error checking availability:', err.message);
      setMessage('Error checking availability.');
    }
  };

  const handleBooking = async () => {
    const { startDate, endDate, guests } = form;

    if (!startDate || !endDate || guests <= 0) {
      setMessage('Please fill out all fields before booking.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId: selectedRoom._id, startDate, endDate, guests }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Booking successful!');
        fetchBookings();
      } else {
        setMessage(data.message || 'Booking failed.');
      }
    } catch (err) {
      console.error('Error creating booking:', err.message);
      setMessage('Error creating booking.');
    }
  };

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage('Booking cancelled');
        fetchBookings();
      } else {
        setMessage('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err.message);
      setMessage('Error cancelling booking.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-warning">Book: {selectedRoom?.name || 'Room'}</h2>

      <div className="card p-4 mb-4">
        <div className="form-group mt-3">
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>

        <div className="form-group mt-3">
          <label>End Date</label>
          <input
            type="date"
            className="form-control"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>

        <div className="form-group mt-3">
          <label>Guests</label>
          <input
            type="number"
            className="form-control"
            min={1}
            value={form.guests}
            onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) })}
          />
        </div>

        <div className="d-flex gap-3 mt-4">
          <button className="btn btn-outline-warning" onClick={checkAvailability}>
            Check Availability
          </button>
          <button className="btn btn-warning" onClick={handleBooking} disabled={!availability}>
            Book Now
          </button>
        </div>

        {availability !== null && (
          <p className={`mt-3 ${availability ? 'text-success' : 'text-danger'}`}>
            {availability ? 'Room is available!' : 'Room is not available.'}
          </p>
        )}
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <h3 className="text-warning">My Bookings</h3>
      <ul className="list-group">
        {bookings.map((b) => (
          <li key={b._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{b.roomId?.name || 'N/A'}</strong> from <b>{b.startDate?.slice(0, 10)}</b> to{' '}
              <b>{b.endDate?.slice(0, 10)}</b> | Guests: {b.guests}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => cancelBooking(b._id)}>
              Cancel
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Booking;
