import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Home.css';

function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/rooms');
        const data = await res.json();

        if (res.ok) {
          setRooms(data);
        } else {
          setMessage('Failed to fetch rooms');
        }
      } catch (err) {
        setMessage('Error fetching rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Handle click on room card
  const handleRoomClick = (room) => {
    // Always redirect to login page when a room card is clicked
    navigate('/login', { state: { room } });
  };

  return (
    <div className="container mt-5">
      {message && <div className="alert alert-danger">{message}</div>}
      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <div className="row">
          {rooms.map((room) => (
            <div key={room._id} className="col-md-4">
              <div
                className="card mb-4 room-card"
                style={{ maxWidth: '400px' }}
                onClick={() => handleRoomClick(room)}  // Handling room click to force login redirect
              >
                <img
                  src={`http://localhost:3000/uploads/${room.image}`}
                  alt={room.name}
                  className="card-img-top room-image"
                  style={{ objectFit: 'cover', height: '200px' }}
                />
                <div className="card-body">
                  <h5 className="card-title text-warning fw-bold">{room.name}</h5>
                  <p className="mb-1"><strong>📍 Location:</strong> {room.location}</p>
                  <p className="mb-1"><strong>💰 Price:</strong> ${room.price}</p>
                  <p className="mb-1"><strong>👥 Capacity:</strong> {room.capacity}</p>
                  <p className="mt-2"><strong>📝 Description:</strong><br />{room.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
