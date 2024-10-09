// UserCredentials.js
import React from 'react';

const UserCredentials = ({ user, setUser }) => {
  return (
    <fieldset>
      <legend>User Credentials</legend>
      <div className="form-row">
        <label>Username *</label>
        <input
          type="text"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Password *</label>
        <input
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
      </div>
    </fieldset>
  );
};

export default UserCredentials;
