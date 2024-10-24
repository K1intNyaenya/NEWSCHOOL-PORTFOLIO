import React, { useState, useEffect } from 'react';
import './style/PortfolioCard.css';

const PortfolioCard = ({ user, onUpdate, uploadProfileImage, fetchProfileImage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState({ ...user });
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profile_image_url || '');

  // Fetch the profile image when the component loads if needed
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        if (!user.profile_image_url) {
          const response = await fetchProfileImage(editUser.id); // Fetch profile image from backend
          if (response && response.profile_image_url) {
            setProfileImageUrl(response.profile_image_url); // Set the fetched profile image URL
          }
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (editUser.id && !profileImageUrl) {
      loadProfileImage(); // Trigger image loading when component is mounted if no image already
    }
  }, [editUser.id, fetchProfileImage, profileImageUrl]);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleJobChange = (index, field, value) => {
    const updatedJobs = [...editUser.employment_history];
    updatedJobs[index][field] = value;
    setEditUser({ ...editUser, employment_history: updatedJobs });
  };

  const handleAddJob = () => {
    const newJob = { employer: '', job_title: '' };
    setEditUser((prevState) => ({
      ...prevState,
      employment_history: [...prevState.employment_history, newJob],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser({
          ...editUser,
          profile_image: reader.result, // Set Base64 image string for preview
        });
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  };

  const handleSaveImage = async () => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result; // Convert image to Base64
        const response = await uploadProfileImage(editUser.id, base64Image); // Call the API to upload the image

        // After successful upload, update the profile image URL
        if (response && response.profile_image_url) {
          setProfileImageUrl(response.profile_image_url);
        }
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const handleSaveDetails = async () => {
    onUpdate(editUser); // Trigger the parent component's update function
    setIsEditing(false); // Exit edit mode
  };

  return (
    <div className="portfolio-card">
      {isEditing ? (
        <div className="card-content">
          <div className="left-section">
            <div className="profile-image-container">
              {/* Display profile image */}
              <img
                src={editUser.profile_image || profileImageUrl || 'https://via.placeholder.com/80'}
                alt={`${editUser.first_name} ${editUser.family_name}`}
                className="profile-image"
              />
              <input
                type="file"
                id="profileImageUpload"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <h2>{editUser.first_name} {editUser.family_name}</h2>
            <p className="user-title">{editUser.member_title}</p>
          </div>

          <div className="right-section">
            <input
              type="text"
              value={editUser.member_mobile}
              onChange={(e) => setEditUser({ ...editUser, member_mobile: e.target.value })}
              placeholder="Mobile"
            />
            <input
              type="email"
              value={editUser.member_email}
              onChange={(e) => setEditUser({ ...editUser, member_email: e.target.value })}
              placeholder="Email"
            />
            <h4>Employment History:</h4>
            {editUser.employment_history.length > 0 ? (
              editUser.employment_history.map((job, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={job.employer}
                    onChange={(e) => handleJobChange(index, 'employer', e.target.value)}
                    placeholder="Employer"
                  />
                  <input
                    type="text"
                    value={job.job_title}
                    onChange={(e) => handleJobChange(index, 'job_title', e.target.value)}
                    placeholder="Job Title"
                  />
                </div>
              ))
            ) : (
              <p>No employment history available.</p>
            )}

            <button onClick={handleAddJob}>Add Employment History</button>
            <button onClick={handleSaveDetails}>Save Details</button> {/* Save user details */}
            <button onClick={handleSaveImage}>Save Image</button> {/* Save profile image */}
            <button onClick={toggleEditMode}>Cancel</button>
          </div>
        </div>
      ) : (
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
            <button onClick={toggleEditMode}>Edit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;
