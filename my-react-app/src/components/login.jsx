import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        const payload = JSON.parse(atob(token.split('.')[1]));

        const user = {
          id: payload.id,
          role: payload.role,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setVariant('success');
        setMessage('Login successful! Redirecting...');
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
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <div
        className="p-4 shadow rounded bg-white"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <h3 className="text-center mb-4" style={{ color: '#343a40' }}>Login</h3>

        {message && (
          <div className={`alert alert-${variant}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{ borderRadius: '0.5rem' }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={{ borderRadius: '0.5rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 text-white fw-bold"
            style={{ borderRadius: '0.5rem' }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
