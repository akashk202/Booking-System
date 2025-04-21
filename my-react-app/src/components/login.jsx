import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const navigate = useNavigate();

  // Update form data on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.email || !formData.password) {
      setVariant('danger');
      setMessage('Please fill in both email and password');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        const token = data.token;
  
        // ✅ Decode the JWT to extract user info (payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
  
        // Store only necessary user info
        const user = {
          id: payload.id,
          role: payload.role,
        };
  
        // ✅ Store token and decoded user info in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
  
        setVariant('success');
        setMessage('Login successful! Redirecting...');
  
        // Redirect after successful login
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setVariant('danger');
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setVariant('danger');
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      {/* Display message if there's any */}
      {message && <div className={`alert alert-${variant}`} role="alert">{message}</div>}
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
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
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}

export default Login;
