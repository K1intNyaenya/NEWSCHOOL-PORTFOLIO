import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './style/Lform.css'; // Your CSS file with themes
import { login } from './authService';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [theme, setTheme] = useState('light-theme'); // Theme state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    setLoading(true); // Set loading to true when login starts

    try {
      await login(username, password); // Use the login function from authService

      // Clear form fields
      setUsername('');
      setPassword('');

      // Redirect to dashboard or home page
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false); // Set loading to false once login is done
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      <h2>New School HR Login</h2>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
              <label>Member Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading} 
              />
              <span className="input-icon">👤</span>
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading} 
              />
              <span className="input-icon">🔒</span>
            </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}> {/* Disable button while loading */}
          {loading ? 'Logging in...' : 'Login'} {/* Change button text when loading */}
        </button>
      </form>

      {/* Loading bar or spinner */}
      {loading && <div className="loading-bar">Loading...</div>} {/* Display loading bar when loading */}

    </div>
  );
}

export default LoginForm;
