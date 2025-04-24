import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
  const phoneRegex = /^[0-9]{10}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{5,}$/;

  const validateForm = () => {
    const { name, email, phone, password } = formData;
    const trimmedName = name.trim();

    if (!trimmedName && !email && !phone && !password) {
      toast.error("All fields must be filled.");
      return false;
    }

    if (!trimmedName) {
      toast.error("Name cannot be empty or just spaces.");
      return false;
    } else if (/^\s/.test(name)) {
      toast.error("Name cannot start with a blank space.");
      return false;
    } else if (!/^[A-Za-z]/.test(trimmedName)) {
      toast.error("Name must start with a letter.");
      return false;
    } else if (/\d/.test(trimmedName)) {
      toast.error("Name cannot contain numbers.");
      return false;
    } else if (!/^[A-Za-z\s]{5,}$/.test(trimmedName)) {
      toast.error("Name must be at least 5 characters and contain only letters and spaces.");
      return false;
    } else if (/(\w)\1\1/.test(trimmedName)) {
      toast.error("Name cannot contain the same character repeated 3 times in a row.");
      return false;
    }

    if (!email || !emailRegex.test(email)) {
      toast.error("Invalid email format.");
      return false;
    }

    if (!phone || !phoneRegex.test(phone)) {
      toast.error("Phone must contain only numbers.");
      return false;
    }

    if (!password || !passwordRegex.test(password)) {
      toast.error("Password must be at least 5 characters long, include letters, a number, and a symbol.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Registration successful!');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('Error connecting to the server.');
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <div
        className="p-4 shadow rounded bg-white"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <h3 className="text-center mb-4" style={{ color: '#343a40' }}>Register</h3>

        <ToastContainer position="top-center" autoClose={3000} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-warning w-100 text-white fw-bold"
            style={{ borderRadius: '0.5rem' }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
