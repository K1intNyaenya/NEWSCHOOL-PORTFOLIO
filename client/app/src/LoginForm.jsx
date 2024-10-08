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
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false); // Set loading to false once login is done
    }
  };

  // Function to toggle themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light-theme' ? 'dark-theme' : 'light-theme'));
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
            disabled={loading} // Disable input during loading
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading} // Disable input during loading
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}> {/* Disable button while loading */}
          {loading ? 'Logging in...' : 'Login'} {/* Change button text when loading */}
        </button>
      </form>

      {/* Loading bar or spinner */}
      {loading && <div className="loading-bar">Loading...</div>} {/* Display loading bar when loading */}

      {/* Theme switch button */}
      <div className="theme-toggle">
        <button onClick={toggleTheme} disabled={loading}>
          Switch to {theme === 'light-theme' ? 'Dark' : 'Light'} Theme
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
