import React, { useEffect, useState } from 'react';
import { useAuth } from "./AuthContext";  
import { useNavigate } from 'react-router-dom';
import './css/Profile.css'

function Profile() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = await res.json();
        if (res.ok) {
          setUserInfo(data);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };
  
    fetchUserInfo();
  }, [user]);

  return (
    <div className="profile-card">
  <h4 className="mb-3 text-center">Profile</h4>
  {userInfo ? (
    <>
      <p><strong>Email:</strong> {userInfo.email}</p>
      <p><strong>Registered At:</strong> {new Date(userInfo.createdAt).toLocaleString()}</p>
      <button onClick={() => navigate('/update-profile')}>
        Update Profile
      </button>
    </>
  ) : (
    <p>Loading user info...</p>
  )}
    </div>
  );
}

export default Profile;