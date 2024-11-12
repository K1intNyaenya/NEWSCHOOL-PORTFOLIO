import React, { useState } from 'react';

const UserCredentials = ({ user, setUser }) => {
  const [errors, setErrors] = useState({ username: '', password: '' });

  const handleInputChange = (field, value) => {
    setUser({ ...user, [field]: value });
    
    // Basic validation for required fields
    if (value.trim() === '') {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: `${field} is required.` }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
    }
  };

  return (
    <fieldset>
      <legend>User Credentials</legend>
      
      <div className="form-row">
        <label htmlFor="username">Username *</label>
        <input
          type="text"
          id="username"
          value={user.username || ''}
          onChange={(e) => handleInputChange('username', e.target.value)}
          autoComplete="current-username"
          aria-label="Username"
          required
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div className="form-row">
        <label htmlFor="password">Password *</label>
        <input
          type="password"
          id="password"
          value={user.password || ''}
          onChange={(e) => handleInputChange('password', e.target.value)}
          autoComplete="current-password"
          aria-label="Password"
          required
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
    </fieldset>
  );
};

export default UserCredentials;
