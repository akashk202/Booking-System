import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home';
import Register from './components/register';
import Login from './components/login';
import Layout from './components/layout';
import Admin from './components/Admin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Dashboard from './components/dashboard';
import Booking from './components/Booking';
import ProtectedRoute from './components/ProtectedRoute';
import UpdateProfile from './components/UpdateProfile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/booking" element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          } />
          
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
        
      </Layout>
    </Router>
  );
}

export default App;
