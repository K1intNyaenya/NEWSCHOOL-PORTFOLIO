import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './style/Lform.css';
import { login } from './authService';

const isDebug = true;

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light-theme');
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isDebug) {
      console.log('Attempting login with:', { username, password });
    }

    try {
      const role = await login(username, password);
      setUsername('');
      setPassword('');
      
      if (isDebug) {
        console.log(`Login successful for user: ${username}, Role: ${role}`);
      }

      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }

      setDebugInfo(`User logged in with role: ${role}`);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      
      if (isDebug) {
        setDebugInfo(`Error encountered: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light-theme' ? 'dark-theme' : 'light-theme';
    setTheme(newTheme);
    if (isDebug) {
      console.log('Theme toggled:', newTheme);
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      <h2>New School HR Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Member Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading} 
          />
          <span className="input-icon" aria-hidden="true">👤</span>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading} 
          />
          <span className="input-icon" aria-hidden="true">🔒</span>
        </div>

        {error && <p className="error" role="alert" aria-live="assertive">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {loading && <div className="loading-bar" aria-live="polite">Loading...</div>}
      
      {isDebug && debugInfo && (
        <div className="debug-info">
          <h4>Debug Information</h4>
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}

export default LoginForm;
