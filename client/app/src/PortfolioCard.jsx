import React, { useState } from 'react';
import './style/PortfolioCard.css';

const PortfolioCard = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState({ ...user });

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Handle changes in employment history for each job
  const handleJobChange = (index, field, value) => {
    const updatedJobs = [...editUser.employment_history];
    updatedJobs[index][field] = value;
    setEditUser({ ...editUser, employment_history: updatedJobs });
  };

  // Handle adding a new job entry
  const handleAddJob = () => {
    const newJob = { employer: '', job_title: '' }; // New job template
    setEditUser((prevState) => ({
      ...prevState,
      employment_history: [...prevState.employment_history, newJob], // Add new job
    }));
  };

  // Handle Save Changes and exclude password if not set
  const handleSaveChanges = () => {
    const { password, ...updatedUserWithoutPassword } = editUser;

    // Only include password if it's been set
    const updatedUser = password ? editUser : updatedUserWithoutPassword;

    onUpdate(updatedUser); // Trigger the onUpdate function passed from the parent component (AdminDashboard)
    setIsEditing(false); // Close the edit mode
  };

  return (
    <div className="portfolio-card">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editUser.first_name}
            onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
            placeholder="First Name"
          />
          <input
            type="text"
            value={editUser.family_name}
            onChange={(e) => setEditUser({ ...editUser, family_name: e.target.value })}
            placeholder="Last Name"
          />
          <input
            type="text"
            value={editUser.member_title}
            onChange={(e) => setEditUser({ ...editUser, member_title: e.target.value })}
            placeholder="Title"
          />
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

          <button onClick={handleSaveChanges}>Save</button>
          <button onClick={toggleEditMode}>Cancel</button>
        </div>
      ) : (
        <div>
          <h2>{user.first_name} {user.family_name}</h2>
          <p className="user-title">{user.member_title}</p>
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
      )}
    </div>
  );
};

export default PortfolioCard;