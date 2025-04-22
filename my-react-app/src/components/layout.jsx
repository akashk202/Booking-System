import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg border-bottom shadow-sm px-4 bg-white">
        <Link to="/" className="navbar-brand fw-bold text-dark fs-4">
          Easy<span className="text-warning">Booking</span>.com
        </Link>

        <div className="ms-auto d-flex gap-3">
          <Link to="/register" className="btn btn-outline-warning">
            Register
          </Link>
          <Link to="/login" className="btn btn-warning text-white">
            Login
          </Link>
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
    </div>
  );
}

export default Layout;
