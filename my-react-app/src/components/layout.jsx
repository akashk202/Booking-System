import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
        <Link to="/" className="navbar-brand">EasyBooking.com</Link>

        {/* Register and Login buttons positioned at the top-right corner */}
        <div className="navbar-nav ms-auto">
          <Link to="/register" className="nav-link custom-btn">Register</Link>
          <Link to="/login" className="nav-link custom-btn">Login</Link>
        </div>
      </nav>

      {/* Main content area */}
      <main className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="container text-center">
          {children}
        </div>
      </main>

      {/* Optional Footer */}
      <footer className="bg-light text-center py-3 mt-auto">
        <small>&copy; {new Date().getFullYear()} EasyBooking.com</small>
      </footer>
    </div>
  );
}

export default Layout;
