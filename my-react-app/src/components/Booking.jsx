import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { toast, ToastContainer } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';

export default function Booking() {
  const location = useLocation();
  const selectedRoom = location.state?.room;

  const [bookings, setBookings] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const API = 'http://localhost:3000/api/bookings';

  // Number of nights between dates
  const computeNights = () => {
    if (!startDate || !endDate) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((endDate - startDate) / msPerDay);
  };

  useEffect(() => {
    if (!selectedRoom) {
      toast.error('No room selected. Please choose a room from the dashboard.');
      return;
    }
    if (token) fetchBookings();
    else toast.error('Please login to view and make bookings.');
  }, [token, selectedRoom]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data);
      else toast.error(data.message || 'Failed to fetch bookings.');
    } catch (err) {
      console.error(err);
      toast.error('Error fetching bookings.');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate || startDate >= endDate) {
      toast.error('Please select a valid date range.');
      return;
    }
    setLoading(true);
    try {
      const url = `${API}/check-availability?roomId=${selectedRoom._id}` +
                  `&dateFrom=${startDate.toISOString()}` +
                  `&dateTo=${endDate.toISOString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAvailability(data.available);
        toast.success(data.available
          ? 'Room is available!'
          : 'Room is not available.');
      } else {
        toast.error(data.message || 'Failed to check availability.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error checking availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!availability) {
      toast.error('Please check availability first.');
      return;
    }
    const nights = computeNights();
    if (!nights || guests < 1) {
      toast.error('Invalid booking details.');
      return;
    }
    setBookingLoading(true);
    try {
      const totalAmount = nights * selectedRoom.price;
      const res = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: selectedRoom._id,
          dateFrom: startDate.toISOString(),
          dateTo:   endDate.toISOString(),
          guests,
          totalAmount,
          specialRequests
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Booking successful!');
        // reset
        setAvailability(null);
        setStartDate(null);
        setEndDate(null);
        setSpecialRequests('');
        fetchBookings();
      } else {
        toast.error(data.message || 'Booking failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error creating booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Booking cancelled.');
        fetchBookings();
      } else {
        toast.error('Failed to cancel booking.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error cancelling booking.');
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h2 className="text-center mb-4 text-warning">
        Book: {selectedRoom?.name || 'Room'}
      </h2>

      <div className="card shadow p-4 mb-5">
        <div className="row g-3">
          <div className="col-md-3">
            <label>Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              className="form-control"
              minDate={new Date()}
              placeholderText="Select start"
            />
          </div>
          <div className="col-md-3">
            <label>End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              className="form-control"
              minDate={startDate || new Date()}
              placeholderText="Select end"
            />
          </div>
          <div className="col-md-2">
            <label>Guests</label>
            <input
              type="number"
              className="form-control"
              value={guests}
              min={1}
              onChange={e => setGuests(+e.target.value || 1)}
            />
          </div>
          <div className="col-md-4">
            <label>Special Requests</label>
            <textarea
              className="form-control"
              rows={2}
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              placeholder="Any special requests?"
            />
          </div>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            className="btn btn-outline-warning"
            onClick={checkAvailability}
            disabled={loading}
          >
            {loading ? 'Checking…' : 'Check Availability'}
          </button>
          <button
            className="btn btn-warning"
            onClick={handleBooking}
            disabled={!availability || bookingLoading}
          >
            {bookingLoading ? 'Booking…' : 'Book Now'}
          </button>
        </div>
      </div>

      <h3 className="text-warning mb-3">My Bookings</h3>
      {loading ? (
        <div className="text-center">Loading bookings…</div>
      ) : (
        <ul className="list-group">
          {bookings.map(b => (
            <li
              key={b._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{b.roomId?.name || 'Room'}</strong> |{' '}
                {new Date(b.dateFrom).toLocaleDateString()} →{' '}
                {new Date(b.dateTo).toLocaleDateString()} | Guests: {b.guests}
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => cancelBooking(b._id)}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
