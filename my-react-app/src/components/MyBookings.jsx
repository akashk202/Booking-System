import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      } else {
        toast.error(data.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bookings/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // refresh list
      } else {
        toast.error(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error cancelling booking');
    }
  };

  return (
    <div className="container my-5">
      <h4 className="mb-4 text-center">My Bookings</h4>
      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-muted text-center">You have no bookings yet.</p>
      ) : (
        <div className="row">
          {bookings.map((booking) => (
            <div className="col-md-6 mb-4" key={booking._id}>
              <div className="card shadow-sm p-3">
                <h5 className="card-title">{booking.roomId?.name || 'Room'}</h5>
                <p className="card-text">
                  <strong>From:</strong> {new Date(booking.dateFrom).toLocaleDateString()}<br />
                  <strong>To:</strong> {new Date(booking.dateTo).toLocaleDateString()}<br />
                  <strong>Status:</strong> {booking.status}
                </p>
                {booking.status === 'booked' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
