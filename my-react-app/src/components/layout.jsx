import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../components/AuthContext';

function Layout({ children }) {
  const { user, setUser } = useAuth(); // Get user and setUser from context
  const navigate = useNavigate();

  // Optional: Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null); // Update context
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg border-bottom shadow-sm px-4 bg-white">
        <Link to="/" className="navbar-brand fw-bold text-dark fs-4">
          Easy<span className="text-warning">Booking</span>.com
        </Link>

        <div className="ms-auto d-flex gap-3">
          {!user ? (
            <>
              <Link to="/register" className="btn btn-outline-warning">Register</Link>
              <Link to="/login" className="btn btn-warning text-white">Login</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow-1 d-flex justify-content-center align-items-center p-4">
        <div className="container text-center">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 bg-white border-top">
        <small className="text-muted">
          &copy; {new Date().getFullYear()} Easy<span className="text-warning">Booking</span>.com
        </small>
      </footer>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default Layout;