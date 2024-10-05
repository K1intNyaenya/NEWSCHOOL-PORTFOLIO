import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './style/Lform.css';

function LoginForm() {
  const [member_username, setMemberUsername] = useState('');
  const [member_password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/portfolio/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ member_username, member_password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials, please try again.');
      }

      const data = await response.json();
      // Store the token, maybe in localStorage
      localStorage.setItem('token', data.token);
      navigate('/dashboard'); // Redirect to the dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>New School HR Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Member Username:</label>
          <input
            type="text"
            value={member_username}
            onChange={(e) => setMemberUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={member_password}
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
