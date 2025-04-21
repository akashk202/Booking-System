import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
  }

  return (
    <div className="container mt-5">
      <h2>Welcome to the Dashboard!</h2>

      {user ? (
        <>
          <p>Logged in as <strong>{user.role}</strong></p>

          {user.role === 'admin' && (
            <div className="mt-4">
              <Link to="/admin" className="btn btn-warning">Go to Admin Panel</Link>
            </div>
          )}
        </>
      ) : (
        <p>User info not found. Please log in again.</p>
      )}
    </div>
  );
}

export default Dashboard;
