import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../components/AuthContext';

function Layout({ children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully!', {
      autoClose: 1000,  
      onClose: () => navigate('/login'), 
    });
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg border-bottom shadow-sm px-4 bg-white">
        <Link to="/" className="navbar-brand fw-bold text-dark fs-4">
          Easy<span className="text-warning">Booking</span>.com
        </Link>

        <div className="ms-auto d-flex gap-3 align-items-center">
          {!user ? (
            <>
              <Link to="/register" className="btn btn-outline-warning">Register</Link>
              <Link to="/login" className="btn btn-warning text-white">Login</Link>
            </>
          ) : (
            <div className="dropdown">
              <button
                className="btn btn-warning rounded-circle d-flex align-items-center justify-content-center"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: '40px', height: '40px' }}
              >
                <span className="fw-bold text-white">{user.role[0].toUpperCase()}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end mt-2" aria-labelledby="userDropdown">
                <li>
                  <Link className="dropdown-item" to="/profile">Your Info</Link>
                </li>
                <li>
                {user.role === 'admin' ? (
                    <Link className="dropdown-item" to="/all-bookings">All Bookings</Link>) : (
                      <Link className="dropdown-item" to="/my-bookings">Your Bookings</Link>
                       )}
                    </li>

                <li><hr className="dropdown-divider" /></li>
                <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
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
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default Layout;
