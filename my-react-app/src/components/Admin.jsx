import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [roomData, setRoomData] = useState({ name: '', description: '', price: '' });
  const [adminData, setAdminData] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Check if the user is an admin
  const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;

  if (!isAdmin) {
    return <Navigate to="/" />; // Redirect to home if not admin
  }

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setMessage('');
      } else {
        setVariant('danger');
        setMessage(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setVariant('danger');
      setMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Create a new room
  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/admin/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });
      const data = await res.json();
      if (res.ok) {
        setVariant('success');
        setMessage('✅ Room created successfully!');
        setRoomData({ name: '', description: '', price: '' });
      } else {
        setVariant('danger');
        setMessage(data.message || 'Failed to create room');
      }
    } catch (err) {
      setVariant('danger');
      setMessage('Failed to create room');
    }
  };

  // Register a new admin
  const registerAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/admin/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });
      const data = await res.json();
      if (res.ok) {
        setVariant('success');
        setMessage('✅ Admin registered successfully!');
        setAdminData({ name: '', email: '', phone: '', password: '' });
      } else {
        setVariant('danger');
        setMessage(data.message || 'Failed to register admin');
      }
    } catch (err) {
      setVariant('danger');
      setMessage('Failed to register admin');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🛠️ Admin Panel</h2>

      {message && (
        <div className={`alert alert-${variant}`} role="alert">
          {message}
        </div>
      )}

      {/* Create Room */}
      <div className="card p-4 mb-5 shadow-sm">
        <h4 className="mb-3">📦 Create New Room</h4>
        <form onSubmit={createRoom}>
          <div className="mb-3">
            <label className="form-label">Room Name</label>
            <input
              type="text"
              className="form-control"
              value={roomData.name}
              onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              value={roomData.description}
              onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              value={roomData.price}
              onChange={(e) => setRoomData({ ...roomData, price: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>Create Room</button>
        </form>
      </div>

      {/* Register Admin */}
      <div className="card p-4 mb-5 shadow-sm">
        <h4 className="mb-3">👤 Register New Admin</h4>
        <form onSubmit={registerAdmin}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={adminData.name}
              onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={adminData.email}
              onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              value={adminData.phone}
              onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={adminData.password}
              onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>Register Admin</button>
        </form>
      </div>

      {/* Show Registered Users */}
      <div className="card p-4 shadow-sm">
        <h4 className="mb-3">👥 Registered Users</h4>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="list-group">
            {users.map((user) => (
              <li key={user._id} className="list-group-item">
                <strong>{user.name}</strong> – {user.email} – <span className="badge bg-secondary">{user.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Admin;
