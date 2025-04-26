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
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Booking cancelled successfully!');
        fetchBookings(); // refresh list
      } else {
        alert('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const viewPdf = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}/pdf`, {
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
      <h3>All Bookings</h3>
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length > 0 ? (
        <table className="table table-bordered mt-4">
          <thead>
            <tr>
              <th>User</th>
              <th>Room</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th> {/* 👈 Added Actions column */}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.user?.name || 'Unknown'}</td>
                <td>{booking.room?.name}</td>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.status}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger me-2"
                    onClick={() => cancelBooking(booking._id)}
                    disabled={booking.status === 'cancelled'}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => viewPdf(booking._id)}
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
}

export default AllBookings;
