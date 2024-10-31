import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './style/Lform.css';
import { login } from './authService';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light-theme');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // Call login function and get the user's role
        const role = await login(username, password);
        
        // Clear form inputs
        setUsername('');
        setPassword('');

        // Navigate to the correct dashboard based on role
        if (role === 'admin') {
            navigate('/admin-dashboard');
        } else {
            navigate('/dashboard');
        }
    } catch (error) {
        console.error('Login error:', error.message);
        setError(error.message);
    } finally {
        setLoading(false);
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
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {loading && <div className="loading-bar">Loading...</div>}
    </div>
  );
}

export default LoginForm;
