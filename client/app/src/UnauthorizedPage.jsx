// UnauthorizedPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './style/UnauthorizedPage.css'; // Import the CSS for styling

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleGoHome = () => {
    navigate('/'); // Navigate to the home/login page
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Login Again Tokens Experied</h1>
        <div className="button-group">
          <button onClick={handleGoBack} className="btn">
            Go Back
          </button>
          <button onClick={handleGoHome} className="btn">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
