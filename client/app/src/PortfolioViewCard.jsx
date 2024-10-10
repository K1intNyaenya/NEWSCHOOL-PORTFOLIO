import React from 'react';
import './style/PortfolioCard.css';

function PortfolioViewCard({ user }) {
  return (
    <div className="portfolio-card">
      <img src={user.profileImage} alt={`${user.first_name} ${user.family_name}`} className="user-image" />
      <h2>{user.first_name} {user.family_name}</h2>
      <h4>{user.member_title}</h4>
      <p>{user.member_industry}</p>
      <p><strong>Industry:</strong> {user.member_industry}</p>
      <div className="employment-history">
        <h4>Employment History:</h4>
        <ul>
          {user.employment_history.map((job, index) => (
            <li key={index}>
              {job.job_title} at {job.employer}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PortfolioViewCard;
