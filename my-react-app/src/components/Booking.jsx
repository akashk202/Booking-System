import React, { useEffect, useState } from 'react';

function Booking() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ roomId: '', startDate: '', endDate: '', guests: 1 });
  const [availability, setAvailability] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRooms();
    if (token) {
      fetchBookings();
    } else {
      setMessage('Please log in to view and make bookings.');
    }
  }, [token]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/rooms');
      if (!res.ok) {
        const error = await res.json();
        console.error('Error fetching rooms:', error.message);
        return;
      }
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err.message);
    }
  };

  const fetchBookings = async () => {
    if (!token) {
      setMessage('Please log in to view and make bookings.');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) {
        const error = await res.json();
        console.error('Failed to fetch bookings:', error.message);
        setMessage(error.message || 'Failed to fetch bookings.');
        return;
      }
  
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err.message);
      setMessage('Error fetching bookings. Please try again later.');
    }
  };

  const checkAvailability = async () => {
    const { roomId, startDate, endDate } = form;

    if (!roomId || !startDate || !endDate) {
      setMessage('Please fill out all fields before checking availability.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setMessage('Start date cannot be later than end date.');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/bookings/check-availability?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}`
      );

      const data = await res.json();
      setAvailability(data.available);
      if (data.available) {
        setMessage('Room is available!');
      } else {
        setMessage('Room is not available for the selected dates.');
      }
    } catch (err) {
      console.error('Error checking availability:', err.message);
      setMessage('Error checking availability. Please try again later.');
    }
  };

  const handleBooking = async () => {
    const { roomId, startDate, endDate, guests } = form;

    if (!roomId || !startDate || !endDate || guests <= 0) {
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
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Booking successful!');
        fetchBookings();
      } else {
        setMessage(data.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error('Error creating booking:', err.message);
      setMessage('Error creating booking. Please try again later.');
    }
  };
  

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMessage('Booking cancelled');
        fetchBookings();
      } else {
        setMessage('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err.message);
      setMessage('Error cancelling booking. Please try again later.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-warning">Book a Room</h2>

      <div className="card p-4 mb-4">
        <div className="form-group">
          <label>Select Room</label>
          <select
            className="form-control"
            value={form.roomId}
            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
          >
            <option value="">Choose a room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

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
            value={form.guests}
            min={1}
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
        <strong>{b.roomId?.name || 'N/A'}</strong> from <b>{b.startDate?.slice(0, 10) || 'N/A'}</b> to{' '}
        <b>{b.endDate?.slice(0, 10) || 'N/A'}</b> | Guests: {b.guests}
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
