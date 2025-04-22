import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UpdateProfile() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ ...formData, ...data, password: '' });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setMessage('Profile updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setMessage('Failed to update profile.');
    }
  };

  return (
    <div className="container mt-5">
      <h3>Update Your Profile</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Phone</label>
          <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Address</label>
          <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>New Password</label>
          <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
        </div>
        <button className="btn btn-danger" type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default UpdateProfile;
