import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ✅ Importing toast from react-toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
    }
  }, []);

  // ✅ Adding a separate useEffect for triggering the toast once the user is set
  useEffect(() => {
    if (user && user.name) {
      toast.success(`Welcome, ${user.name}!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      if (user.role === 'user') fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/rooms', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {/* ✅ Add ToastContainer here to render toasts */}
      <ToastContainer />

      {user ? (
        <>
          {/* ❌ Removed: Welcome to the Dashboard and Logged in as... */}

          {/* ✅ Admin Panel Button */}
          {user.role === 'admin' && (
            <div className="mt-4">
              <Link to="/admin" className="btn btn-warning">Go to Admin Panel</Link>
            </div>
          )}

          {/* ✅ User Room Display */}
          {user.role === 'user' && (
            <div className="mt-5">
              <h4>Available Rooms</h4>
              {loading ? (
                <p>Loading rooms...</p>
              ) : rooms.length > 0 ? (
                <div className="row">
                  {rooms.map((room) => (
                    <div key={room._id} className="col-md-4">
                      <div className="card mb-4">
                        {room.image && (
                          <img
                            src={`http://localhost:3000/uploads/${room.image}`}
                            alt={room.name}
                            className="card-img-top"
                          />
                        )}
                        <div className="card-body">
                          <h5 className="card-title">{room.name}</h5>
                          <p className="card-text">{room.description}</p>
                          <p className="card-text">Price: ${room.price}</p>
                          <Link to="/booking" state={{ room }} className="btn btn-primary">
                            Book this Room
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No rooms available at the moment.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p>User info not found. Please log in again.</p>
      )}
    </div>
  );
}

export default Dashboard;
