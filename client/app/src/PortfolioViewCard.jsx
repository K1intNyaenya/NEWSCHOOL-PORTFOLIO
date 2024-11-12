import React, { useState, useEffect } from 'react';
import './style/PortfolioCard.css';
import { fetchWithAuth } from './authService';

// Updated default image path to point to "images/default.jpg"
const DEFAULT_PROFILE_IMAGE_URL = 'http://localhost:5173/images/default.jpg';

const PortfolioViewCard = ({ user }) => {
  const [profileImageUrl, setProfileImageUrl] = useState(DEFAULT_PROFILE_IMAGE_URL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/get-profile-image/${user.id}/`);
        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.profile_image_url || DEFAULT_PROFILE_IMAGE_URL);
        } else if (response.status === 404) {
          console.warn(`Profile image not found for user ID ${user.id}, using default image.`);
          setProfileImageUrl(DEFAULT_PROFILE_IMAGE_URL);
        } else {
          console.error('Failed to fetch profile image');
          setProfileImageUrl(DEFAULT_PROFILE_IMAGE_URL);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
        setProfileImageUrl(DEFAULT_PROFILE_IMAGE_URL);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.id) {
      fetchProfileImage();
    }
  }, [user.id]);

  return (
    <div className="portfolio-card">
      <div className="card-content">
        <div className="left-section">
          <div className="profile-image-container">
            {isLoading ? (
              <div className="image-loading">Loading...</div>
            ) : (
              <img
                src={profileImageUrl}
                alt={`${user.first_name} ${user.family_name}'s profile`}
                className="profile-image"
                onError={() => setProfileImageUrl(DEFAULT_PROFILE_IMAGE_URL)}
              />
            )}
          </div>
          <h2>{user.first_name} {user.family_name}</h2>
          <p className="user-title">{user.member_title}</p>
        </div>

        <div className="right-section">
          <div className="info">
            <p><strong>Mobile:</strong> {user.member_mobile || 'N/A'}</p>
            <p><strong>Email:</strong> {user.member_email || 'N/A'}</p>
            <p><strong>Industry:</strong> {user.member_industry || 'N/A'}</p>
            <p><strong>Employment Status:</strong> {user.employment_status || 'N/A'}</p>
            <p><strong>Country:</strong> {user.member_country || 'N/A'}</p>
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
