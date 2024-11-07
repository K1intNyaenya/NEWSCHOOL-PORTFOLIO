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
          const response = await fetchProfileImage(editUser.id);
          if (response && response.profile_image_url) {
            setProfileImageUrl(response.profile_image_url);
          }
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (editUser.id && !profileImageUrl) {
      loadProfileImage();
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
          profile_image: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const response = await uploadProfileImage(editUser.id, base64Image);

        if (response && response.profile_image_url) {
          setProfileImageUrl(response.profile_image_url);
        }
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const handleSaveDetails = async () => {
    onUpdate(editUser);
    setIsEditing(false);
  };

  return (
    <div className="portfolio-card">
      {isEditing ? (
        <div className="card-content">
          <div className="left-section">
            <div className="profile-image-container">
              <img
                src={editUser.profile_image || profileImageUrl || '/images/default.jpg'}
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
            <input
              type="text"
              value={editUser.member_industry}
              onChange={(e) => setEditUser({ ...editUser, member_industry: e.target.value })}
              placeholder="Industry"
            />
            <input
              type="text"
              value={editUser.employment_status}
              onChange={(e) => setEditUser({ ...editUser, employment_status: e.target.value })}
              placeholder="Employment Status"
            />
            <input
              type="text"
              value={editUser.member_country}
              onChange={(e) => setEditUser({ ...editUser, member_country: e.target.value })}
              placeholder="Country"
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
            <button onClick={handleSaveDetails}>Save Details</button>
            <button onClick={handleSaveImage}>Save Image</button>
            <button onClick={toggleEditMode}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="card-content">
          <div className="left-section">
            <div className="profile-image-container">
              <img
                src={profileImageUrl || '/images/default.jpg'}
                alt={`${user.first_name} ${user.family_name}`}
                className="profile-image"
              />
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
            <button onClick={toggleEditMode}>Edit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCard;
