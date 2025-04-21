import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch the room data when the component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/rooms');
        const data = await res.json();

        if (res.ok) {
          setRooms(data); // Set the room data
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

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="container text-center">

        {/* Show message if there was an error */}
        {message && <div className="alert alert-danger">{message}</div>}

        {/* Display the rooms */}
        {loading ? (
          <p>Loading rooms...</p>
        ) : (
          <div className="mt-4">
            <h3>Available Rooms</h3>
            <ul className="list-group">
              {rooms.map((room) => (
                <li key={room._id} className="list-group-item">
                  <h5>{room.name}</h5>
                  <p>{room.description}</p>
                  <p>Price: ${room.price}</p>
                  <p>Capacity: {room.capacity}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
