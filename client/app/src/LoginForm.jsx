import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Use useNavigate instead
import './style/Lform.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Change this line

  const handleSubmit = (e) => {
    e.preventDefault();

    // Replace with real authentication logic (API call)
    const mockUser = {
      email: 'abc@ensight.pro',
      password: 'abc123',
    };

    if (email === mockUser.email && password === mockUser.password) {
      // Login successful, redirect to dashboard
      navigate('/dashboard'); // Change this line
    } else {
      setError('Invalid credentials, please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>New School HR Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;
