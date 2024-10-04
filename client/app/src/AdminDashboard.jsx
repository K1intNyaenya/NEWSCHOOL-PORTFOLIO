import React, { useState, useEffect } from 'react';
import './style/AdminDashboard.css';

function PortfolioCard({ user }) {
  return (
    <div className="portfolio-card">
      <img src={user.image} alt={user.name} className="user-image" />
      <h2>{user.name}</h2>
      <p>{user.profession}</p>
      <p>{user.yearsOfExperience} years of experience</p>
      <h4>Companies Worked For:</h4>
      <ul>
        {user.companies.map((company, index) => (
          <li key={index}>
            {company.name} - {company.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminDashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    first_name: '',
    second_name: '',
    family_name: '',
    member_title: '',
    member_years_of_experience: '',
    previous_jobs: [{ employer: '', jobtitle: '' }],
    member_mobile: '',
    member_email: '',
    member_address: '',
    member_linkedin: '',
    member_twitter: '',
  });
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personalDetails'); // Tracks the active tab

  // Simulate fetching portfolios from an API
  useEffect(() => {
    const fetchPortfolios = async () => {
      const data = [
        {
          id: 1,
          name: 'Nelson Ogudha',
          profession: 'Data Analyst',
          yearsOfExperience: 8,
          companies: [
            { name: 'Google', title: 'Senior Analyst' },
            { name: 'Microsoft', title: 'Business Analyst' },
          ],
          image: 'https://via.placeholder.com/150',
        },
        {
          id: 2,
          name: 'Clinton Ombui',
          profession: 'Software Engineer',
          yearsOfExperience: 5,
          companies: [
            { name: 'Facebook', title: 'Software Engineer' },
            { name: 'Airbnb', title: 'Product Manager' },
          ],
          image: 'https://via.placeholder.com/150',
        },
      ];
      setPortfolios(data);
    };
    fetchPortfolios();
  }, []);

  const validateForm = () => {
    let formErrors = {};

    if (!newUser.first_name) formErrors.first_name = 'First Name is required';
    if (!newUser.member_title) formErrors.member_title = 'Profession is required';
    if (newUser.member_email && !/\S+@\S+\.\S+/.test(newUser.member_email))
      formErrors.member_email = 'Email is invalid';
    if (newUser.member_mobile && !/^\d{10}$/.test(newUser.member_mobile))
      formErrors.member_mobile = 'Mobile should be 10 digits';

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleAddUser = () => {
    if (!validateForm()) return;

    const updatedCompanies = newUser.previous_jobs.filter(
      (job) => job.employer && job.jobtitle
    );

    setPortfolios([
      ...portfolios,
      {
        id: portfolios.length + 1,
        name: `${newUser.first_name} ${newUser.second_name} ${newUser.family_name}`,
        profession: newUser.member_title,
        yearsOfExperience: newUser.member_years_of_experience,
        companies: updatedCompanies,
        image: 'https://via.placeholder.com/150', // Placeholder image
        mobile: newUser.member_mobile,
        email: newUser.member_email,
      },
    ]);

    // Reset form fields
    setNewUser({
      first_name: '',
      second_name: '',
      family_name: '',
      member_title: '',
      member_years_of_experience: '',
      previous_jobs: [{ employer: '', jobtitle: '' }],
      member_mobile: '',
      member_email: '',
      member_address: '',
      member_linkedin: '',
      member_twitter: '',
    });

    setIsModalOpen(false); // Close modal after adding user
  };

  const handleJobChange = (index, field, value) => {
    const updatedJobs = [...newUser.previous_jobs];
    updatedJobs[index][field] = value;
    setNewUser({ ...newUser, previous_jobs: updatedJobs });
  };

  const addJobField = () => {
    setNewUser({
      ...newUser,
      previous_jobs: [...newUser.previous_jobs, { employer: '', jobtitle: '' }],
    });
  };

  const removeJobField = (index) => {
    const updatedJobs = [...newUser.previous_jobs];
    updatedJobs.splice(index, 1);
    setNewUser({ ...newUser, previous_jobs: updatedJobs });
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-header">
        <input
          type="text"
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <button className="add-member-btn" onClick={toggleModal}>
          Add User
        </button>
      </div>

      {/* Modal for adding new users */}
{isModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <h3>Add New Member</h3>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={activeTab === 'personalDetails' ? 'active' : ''}
          onClick={() => setActiveTab('personalDetails')}
        >
          Personal Details
        </button>
        <button
          className={activeTab === 'employmentHistory' ? 'active' : ''}
          onClick={() => setActiveTab('employmentHistory')}
        >
          Employment History
        </button>
        <button
          className={activeTab === 'socialLinks' ? 'active' : ''}
          onClick={() => setActiveTab('socialLinks')}
        >
          Social Links
        </button>
      </div>

      {/* Tab Contents */}
      <div className="tab-content">
        {activeTab === 'personalDetails' && (
          <div>
            <fieldset>
              <legend>Personal Details</legend>
              <div className="form-row">
                <label>First Name *</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                />
                {errors.first_name && <span className="error">{errors.first_name}</span>}
              </div>
              <div className="form-row">
                <label>Second Name</label>
                <input
                  type="text"
                  placeholder="Second Name"
                  value={newUser.second_name}
                  onChange={(e) => setNewUser({ ...newUser, second_name: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Family Name</label>
                <input
                  type="text"
                  placeholder="Family Name"
                  value={newUser.family_name}
                  onChange={(e) => setNewUser({ ...newUser, family_name: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Mobile</label>
                <input
                  type="text"
                  placeholder="Mobile"
                  value={newUser.member_mobile}
                  onChange={(e) => setNewUser({ ...newUser, member_mobile: e.target.value })}
                />
                {errors.member_mobile && <span className="error">{errors.member_mobile}</span>}
              </div>
              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.member_email}
                  onChange={(e) => setNewUser({ ...newUser, member_email: e.target.value })}
                />
                {errors.member_email && <span className="error">{errors.member_email}</span>}
              </div>
              <div className="form-row">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Address"
                  value={newUser.member_address}
                  onChange={(e) => setNewUser({ ...newUser, member_address: e.target.value })}
                />
              </div>
              </fieldset>

              {/* Footer with Next and Close buttons */}
              <div className="modal-footer">
              <button className="close-modal-btn" onClick={toggleModal}>
                  Close
                </button>
                <button className="next-btn" onClick={() => setActiveTab('employmentHistory')}>
                  Next
                </button>
              </div>
              </div>
        )}

        {activeTab === 'employmentHistory' && (
          <div>
            <fieldset>
              <legend>Employment History</legend>
              {newUser.previous_jobs.map((job, index) => (
                <div key={index} className="job-history-entry">
                  <div className="form-row">
                    <label>Employer</label>
                    <input
                      type="text"
                      placeholder="Employer"
                      value={job.employer}
                      onChange={(e) => handleJobChange(index, 'employer', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Job Title</label>
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={job.jobtitle}
                      onChange={(e) => handleJobChange(index, 'jobtitle', e.target.value)}
                    />
                  </div>
                  <button className="remove-job-btn" onClick={() => removeJobField(index)}>
                    Remove
                  </button>
                  <button className="add-job-btn" onClick={addJobField}>
                   Prev JobTitles
                  </button>
                  </div>
              ))}
              
              </fieldset>

                  {/* Footer with Next and Close buttons */}
               <div className="modal-footer">
                  <button className="close-modal-btn" onClick={toggleModal}>
                      Close
                    </button>
                    <button className="next-btn" onClick={() => setActiveTab('socialLinks')}>
                      Next
                    </button>
                  </div>
                </div>
        )}

        {activeTab === 'socialLinks' && (
          <div>
            <fieldset>
              <legend>Social Links</legend>
              <div className="form-row">
                <label>LinkedIn</label>
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={newUser.member_linkedin}
                  onChange={(e) => setNewUser({ ...newUser, member_linkedin: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Twitter</label>
                <input
                  type="text"
                  placeholder="Twitter URL"
                  value={newUser.member_twitter}
                  onChange={(e) => setNewUser({ ...newUser, member_twitter: e.target.value })}
                />
              </div>
            </fieldset>
          </div>
        )}
      </div>

      {/* Show the Add Member button only when the Social Links tab is active */}
      {activeTab === 'socialLinks' && (
        <button className="submit-btn" onClick={handleAddUser}>
          Add Member
        </button>
      )}
    </div>
  </div>
)}
{/* Render Portfolio Cards */}
      <div className="portfolio-grid">
        {portfolios
          .filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.profession.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((user) => (
            <PortfolioCard key={user.id} user={user} />
          ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
