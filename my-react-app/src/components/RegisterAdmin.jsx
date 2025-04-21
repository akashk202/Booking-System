// components/RegisterAdmin.jsx
import React, { useState } from 'react';

function RegisterAdmin() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/admin/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Admin registered successfully!');
        setVariant('success');
        localStorage.setItem('token', data.token); // Store token for immediate use
      } else {
        setMessage(data.message || 'Admin registration failed.');
        setVariant('danger');
      }
    } catch (err) {
      setMessage('Server error while registering admin.');
      setVariant('danger');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Register Admin</h2>
      {message && <div className={`alert alert-${variant}`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          className="form-control mb-2"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary">Register Admin</button>
      </form>
    </div>
  );
}

export default RegisterAdmin;
