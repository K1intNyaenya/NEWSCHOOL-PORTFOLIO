import React, { useState, useEffect } from 'react';
import './style/PortfolioCard.css';

const PortfolioViewCard = ({ user }) => {
  const [profileImageUrl, setProfileImageUrl] = useState('');

  // Fetch the profile image when the component loads
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8080/portfolio/get-profile-image/${user.id}/`);
        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.profile_image_url); // Set the image URL from backend
        } else {
          console.error('Failed to fetch profile image');
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (user.id) {
      fetchProfileImage(); // Trigger image loading when component is mounted
    }
  }, [user.id]);

  return (
    <div className="portfolio-card">
      <div className="card-content">
        <div className="left-section">
          <div className="profile-image-container">
            {/* Display fetched profile image */}
            <img
              src={profileImageUrl || 'https://via.placeholder.com/80'}
              alt={`${user.first_name} ${user.family_name}`}
              className="profile-image"
            />
          </div>
          <h2>{user.first_name} {user.family_name}</h2>
          <p className="user-title">{user.member_title}</p>
        </div>

        <div className="right-section">
          <div className="info">
            <p><strong>Mobile:</strong> {user.member_mobile}</p>
            <p><strong>Email:</strong> {user.member_email}</p>
            <p><strong>Industry:</strong> {user.member_industry}</p>
          </div>
          <h4>Employment History:</h4>
          {user.employment_history && user.employment_history.length > 0 ? (
            <ul>
              {user.employment_history.map((job, index) => (
                <li key={index}>
                  {job.job_title} at {job.employer}
                </li>
              ))}
            </ul>
          ) : (
            <p>No employment history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioViewCard;
