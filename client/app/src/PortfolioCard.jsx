import React, { useState } from 'react';
import './style/PortfolioCard.css'; // Ensure this CSS file exists and is properly linked

function PortfolioCard({ user }) {
  const [showDetails, setShowDetails] = useState(false); // State to toggle details

  const handleToggleDetails = () => {
    setShowDetails(!showDetails); // Toggle the employment history
  };

  return (
    <div className="portfolio-card">
      <img 
        src={user.image || 'path/to/default-image.jpg'} 
        alt={`${user.first_name} ${user.family_name}`} 
        className="user-image" 
      />
      <h2>{user.first_name} {user.family_name}</h2>
      <p>{user.member_title}</p>
      <p>{user.member_years_of_experience} years of experience</p>
      <p>Mobile: {user.member_mobile}</p>
      <p>Email: {user.member_email}</p>
      
      {/* Toggle button to show/hide employment history */}
      <button type="button" onClick={handleToggleDetails}>
        {showDetails ? 'Hide Details' : 'View Details'}
      </button>

      {/* Employment History - statically rendered */}
      {showDetails && (
        <div className="employment-history">
          <h4>Employment History:</h4>
          {user.previous_employer1 || user.previous_jobtitle1 ? (
            <ul>
              <li>{user.previous_employer1} - {user.previous_jobtitle1}</li>
              <li>{user.previous_employer2} - {user.previous_jobtitle2}</li>
              <li>{user.previous_employer3} - {user.previous_jobtitle3}</li>
              <li>{user.previous_employer4} - {user.previous_jobtitle4}</li>
              <li>{user.previous_employer5} - {user.previous_jobtitle5}</li>
            </ul>
          ) : (
            <p>No employment history available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfolioCard;
