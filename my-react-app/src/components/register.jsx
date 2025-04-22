import { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });



    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
    const phoneRegex = /^[0-9]{10}$/; 
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{5,}$/;
    const name = formData.name.trim(); 
    const nameRegex = /^[A-Za-z][A-Za-z\s]{4,}$/;

  const validateForm = () => {
    const errors = {};
    
    if (!name) {
      errors.name = "Name cannot be empty or just spaces.";
    } else if (!nameRegex.test(name)) {
      errors.name = "Name must be at least 5 characters, start with a letter, and only contain letters and spaces.";
    } else if (/(\w)\1\1/.test(name)) {
      errors.name = "Name cannot contain the same character repeated 3 times in a row.";
    }
  
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Invalid email format.";
    }
  
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      errors.phone = "Phone must contain only numbers.";
    }
  
    if (!formData.password || !passwordRegex.test(formData.password)) {
      errors.password = "Password must be at least 5 characters long, include letters, a number, and a symbol.";
    }
  
    if (Object.keys(errors).length > 0) {
      // Optional: Set error messages in state
      setMessage(Object.values(errors)[0]); // Show the first error
      setVariant('danger');
      return false;
    }
  
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setVariant('success');
        setMessage('Registration successful!');
      } else {
        setVariant('danger');
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setVariant('danger');
      setMessage('Error connecting to the server.');
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <div
        className="p-4 shadow rounded bg-white"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <h3 className="text-center mb-4" style={{ color: '#343a40' }}>Register</h3>

        {message && (
          <div className={`alert alert-${variant}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control"
              style={{ borderRadius: '0.5rem' }}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-warning w-100 text-white fw-bold"
            style={{ borderRadius: '0.5rem' }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
