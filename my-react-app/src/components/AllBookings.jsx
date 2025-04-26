import React, { useEffect, useState } from 'react';

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/bookings/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bookings/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Booking cancelled successfully!');
        fetchBookings(); // refresh
      } else {
        alert('Failed to cancel booking.');
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const viewPdf = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bookings/report/${bookingId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open PDF.');
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">📖 All Bookings</h3>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p>Loading bookings...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Room</th>
                <th>Date From</th>
                <th>Date To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.userId?.name || 'Unknown'}</td>
                  <td>{booking.roomId?.name || 'Unknown'}</td>
                  <td>{new Date(booking.dateFrom).toLocaleDateString()}</td>
                  <td>{new Date(booking.dateTo).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        booking.status === 'cancelled' ? 'bg-danger' : 
                        booking.status === 'pending' ? 'bg-warning' : 
                        'bg-success'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger me-2"
                      onClick={() => cancelBooking(booking._id)}
                      disabled={booking.status === 'cancelled'}
                    >
                      ❌ Cancel
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => viewPdf(booking._id)}
                    >
                      📄 View PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center">
          <p>No bookings found.</p>
        </div>
      )}
    </div>
  );
}

export default AllBookings;
