import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', password: '' });
  const [updateMessage, setUpdateMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      if (user.role === 'user') fetchRooms();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ name: data.name, phone: data.phone || '', address: data.address || '', password: '' });
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setUpdateMessage('Profile updated successfully!');
      } else {
        setUpdateMessage('Failed to update profile.');
      }
    } catch (error) {
      console.error('Update error:', error);
      setUpdateMessage('An error occurred while updating profile.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Welcome to the Dashboard!</h2>

      {user ? (
        <>
          <p>Logged in as <strong>{user.role}</strong></p>

          {/* Profile Update Form */}
          <div className="card mt-4">
            <div className="card-body">
              <h4 className="card-title">Update Profile</h4>
              <form onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-warning">Update Profile</button>
              </form>
              {updateMessage && <p className="mt-3">{updateMessage}</p>}
            </div>
          </div>

          {/* Admin Panel Link */}
          {user.role === 'admin' && (
            <div className="mt-4">
              <Link to="/admin" className="btn btn-warning">Go to Admin Panel</Link>
            </div>
          )}

          {/* User Rooms Display */}
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