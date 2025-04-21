import { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Basic validation checks
  const validateForm = () => {
    const { name, email, phone, password } = formData;

    // Name validation: should contain only alphabetic characters
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name || !nameRegex.test(name)) {
      setVariant('danger');
      setMessage('Name must only contain letters and spaces');
      return false;
    }

    // Email validation: should contain @ symbol
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!email || !emailRegex.test(email)) {
      setVariant('danger');
      setMessage('Please enter a valid email address');
      return false;
    }

    // Phone validation: should contain only numbers
    const phoneRegex = /^[0-9]+$/;
    if (!phone || !phoneRegex.test(phone)) {
      setVariant('danger');
      setMessage('Phone number should only contain digits');
      return false;
    }

    // Password validation: should contain at least one letter, one number, and one symbol
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!password || !passwordRegex.test(password)) {
      setVariant('danger');
      setMessage('Password must contain at least one letter, one number, and one special character');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform form validation
    if (!validateForm()) return;

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Registration was successful, store the token
        localStorage.setItem('token', data.token);
        setVariant('success');
        setMessage('Registration successful!');
      } else {
        // Show error message if registration fails
        setVariant('danger');
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      // Catch network or server errors
      setVariant('danger');
      setMessage('Error connecting to the server.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      {message && <div className={`alert alert-${variant}`} role="alert">{message}</div>}
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
}

export default Register;
