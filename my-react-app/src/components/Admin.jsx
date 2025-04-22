import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './css/admin.css';
function Admin() {
  const [users, setUsers] = useState([]);
  const [roomData, setRoomData] = useState({ name: '', location:'', description: '',capacity: '', price: '' });
  const [roomImage, setRoomImage] =useState(null);
  const [adminData, setAdminData] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [rooms, setRooms] = useState([]);



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

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data);
      } else {
        setMessage(data.message || 'Failed to fetch rooms');
        setVariant('danger');
      }
    } catch (err) {
      setMessage('Failed to fetch rooms');
      setVariant('danger');
    }
  };
  

  // Create a new room
  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', roomData.name);
      formData.append('location', roomData.location);
      formData.append('description', roomData.description);
      formData.append('capacity', roomData.capacity);
      formData.append('price', roomData.price);
      if (roomImage) formData.append('image', roomImage); // Append image
  
      const res = await fetch('http://localhost:3000/api/admin/room', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        setVariant('success');
        setMessage('✅ Room created successfully!');
        setRoomData({ name: '', location: '', description: '', capacity: '' ,price: ''});
        setRoomImage(null); 
      } else {
        setVariant('danger');
        setMessage(data.message || 'Failed to create room');
      }
    } catch (err) {
      setVariant('danger');
      setMessage('Failed to create room');
    }
  };

  const updateRoom = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', editingRoom.name);
      formData.append('location', editingRoom.location);
      formData.append('description', editingRoom.description);
      formData.append('price', editingRoom.price);
      formData.append('capacity', editingRoom.capacity);
      if (editingRoom.imageFile) {
        formData.append('image', editingRoom.imageFile);
      }
  
      const res = await fetch(`http://localhost:3000/api/admin/room/${editingRoom._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Room updated!');
        setVariant('success');
        setEditingRoom(null);
        fetchRooms(); // <-- Refresh the room list
      } else {
        setMessage(data.message || 'Update failed');
        setVariant('danger');
      }
    } catch (err) {
      setMessage('Update error');
      setVariant('danger');
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
    fetchRooms();;
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🛠️ Admin Panel</h2>

      {message && (
        <div className={`alert alert-${variant}`} role="alert">
          {message}
        </div>
      )}
  

  <form onSubmit={createRoom} encType="multipart/form-data">
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
    <label className="form-label">Location</label>
    <input
      type="text"
      className="form-control"
      value={roomData.location}
      onChange={(e) => setRoomData({ ...roomData, location: e.target.value })}
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
    <label className="form-label">Capacity</label>
    <input
      type="number"
      className="form-control"
      value={roomData.capacity}
      onChange={(e) => setRoomData({ ...roomData, capacity: e.target.value })}
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

  

  <div className="mb-3">
    <label className="form-label">Room Image</label>
    <input
      type="file"
      className="form-control"
      accept="image/*"
      onChange={(e) => setRoomImage(e.target.files[0])}
    />
  </div>

  <button className="btn btn-primary" disabled={loading}>Create Room</button>
</form>

{isAdmin && editingRoom && (
  <form onSubmit={updateRoom} encType="multipart/form-data" className="mt-4">
    <h5>✏️ Edit Room</h5>

    <input
      type="text"
      className="form-control mb-2"
      value={editingRoom.name}
      onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
    />
    <input
      type="text"
      className="form-control mb-2"
      value={editingRoom.location}
      onChange={(e) => setEditingRoom({ ...editingRoom, location: e.target.value })}
    />
    <input
      type="text"
      className="form-control mb-2"
      value={editingRoom.description}
      onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
    />
    <input
      type="number"
      className="form-control mb-2"
      value={editingRoom.capacity}
      onChange={(e) => setEditingRoom({ ...editingRoom, capacity: e.target.value })}
    />
    <input
      type="number"
      className="form-control mb-2"
      value={editingRoom.price}
      onChange={(e) => setEditingRoom({ ...editingRoom, price: e.target.value })}
    />
    <input
      type="file"
      className="form-control mb-2"
      accept="image/*"
      onChange={(e) => setEditingRoom({ ...editingRoom, imageFile: e.target.files[0] })}
    />
    <button className="btn btn-success mt-2">Update Room</button>
  </form>
)}
<div className="row">
{rooms.map((room) => (
  <div key={room._id || room.name}className="col-12 col-md-4 mb-4">
    <div className="card">
      <img
        src={`http://localhost:3000/uploads/${room.image}`}
        alt={room.name}
        className="card-img-top"
      />
      <div className="card-body">
        <h5 className="card-title">{room.name}</h5>
        <p className="card-text">{room.description}</p>
        <p className="card-text">📍 {room.location}</p>
        <p className="card-text">💰 ${room.price}</p>
        <p className="card-text">👥 Capacity: {room.capacity}</p>
        
        {/* Ensure this part is rendering properly */}
        {isAdmin && (
          <button
            className="btn btn-sm btn-outline-warning mt-2"
            onClick={() => setEditingRoom(room)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  </div>
))}
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
