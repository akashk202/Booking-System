import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in both email and password', { autoClose: 2000 });
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
        setUser(user);

        // ✅ FIRST show toast, then redirect *after* autoClose finishes
        toast.success('Login successful! Redirecting...', {
          autoClose: 500,
          onClose: () => navigate(from),
        });

      } else {
        toast.error(data.message || 'Login failed', { autoClose: 2000 });
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error connecting to server.', { autoClose: 2000 });
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

      {/* ✅ Toast Container with proper settings */}
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Login;
