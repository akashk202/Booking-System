import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') {
      return <Navigate to="/" />;
    }
  } catch (err) {
    console.error('Invalid token');
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedAdminRoute;
