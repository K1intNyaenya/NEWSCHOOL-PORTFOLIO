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
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if form is submitting
  const [error, setError] = useState(''); // Store any error message

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/portfolio/NewSchoolMember/");
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setPortfolios(data); 
      } catch (error) {
        console.error("Failed to fetch portfolios:", error);
      }
    };

    fetchPortfolios();
  }, []);

  if (!Array.isArray(portfolios) || portfolios.length === 0) {
    return <p>No portfolios available</p>;
  }

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

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true); // Set submitting state to true
    setError(''); // Reset any existing error

    const updatedCompanies = newUser.previous_jobs.filter(
      (job) => job.employer && job.jobtitle
    );

    const payload = {
      first_name: newUser.first_name,
      second_name: newUser.second_name,
      family_name: newUser.family_name,
      member_title: newUser.member_title,
      member_years_of_experience: newUser.member_years_of_experience,
      previous_jobs: updatedCompanies,
      member_mobile: newUser.member_mobile,
      member_email: newUser.member_email,
      member_address: newUser.member_address,
      member_linkedin: newUser.member_linkedin,
      member_twitter: newUser.member_twitter,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/portfolio/NewSchoolMember/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const newPortfolio = await response.json();

      setPortfolios([
        ...portfolios,
        {
          id: newPortfolio.id,
          name: `${newPortfolio.first_name} ${newPortfolio.second_name} ${newPortfolio.family_name}`,
          profession: newPortfolio.member_title,
          yearsOfExperience: newPortfolio.member_years_of_experience,
          companies: newPortfolio.previous_jobs,
          image: 'https://via.placeholder.com/150', // Placeholder image
          mobile: newPortfolio.member_mobile,
          email: newPortfolio.member_email,
        },
      ]);

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

    } catch (error) {
      console.error("Failed to add new portfolio:", error);
      setError('Failed to add new member. Please try again later.');
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here, e.g., preview image or send to server
      console.log('Image file selected:', file);
    }
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
                        placeholder="Mobile Number"
                        value={newUser.member_mobile}
                        onChange={(e) => setNewUser({ ...newUser, member_mobile: e.target.value })}
                      />
                      {errors.member_mobile && <span className="error">{errors.member_mobile}</span>}
                    </div>
                    <div className="form-row">
                      <label>Email</label>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={newUser.member_email}
                        onChange={(e) => setNewUser({ ...newUser, member_email: e.target.value })}
                      />
                      {errors.member_email && <span className="error">{errors.member_email}</span>}
                    </div>
                    <div className="form-row">
                      <label>Upload Profile Image</label>
                      <input type="file" onChange={handleImageUpload} />
                    </div>
                  </fieldset>
                </div>
              )}

              {activeTab === 'employmentHistory' && (
                <div>
                  <fieldset>
                    <legend>Employment History</legend>
                    {newUser.previous_jobs.map((job, index) => (
                      <div key={index} className="form-row">
                        <label>Employer</label>
                        <input
                          type="text"
                          placeholder="Employer"
                          value={job.employer}
                          onChange={(e) => handleJobChange(index, 'employer', e.target.value)}
                        />
                        <label>Job Title</label>
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={job.jobtitle}
                          onChange={(e) => handleJobChange(index, 'jobtitle', e.target.value)}
                        />
                        {newUser.previous_jobs.length > 1 && (
                          <button onClick={() => removeJobField(index)}>Remove</button>
                        )}
                      </div>
                    ))}
                    <button onClick={addJobField}>Add Another Job</button>
                  </fieldset>
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
                        placeholder="LinkedIn Profile"
                        value={newUser.member_linkedin}
                        onChange={(e) => setNewUser({ ...newUser, member_linkedin: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <label>Twitter</label>
                      <input
                        type="text"
                        placeholder="Twitter Profile"
                        value={newUser.member_twitter}
                        onChange={(e) => setNewUser({ ...newUser, member_twitter: e.target.value })}
                      />
                    </div>
                  </fieldset>
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>} {/* Error message */}

            <div className="modal-footer">
              <button className="close-btn" onClick={toggleModal}>
                Close
              </button>
              <button className="submit-btn" onClick={handleAddUser} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Displaying the portfolios */}
      <div className="portfolio-grid">
        {portfolios
          .filter(
            (user) =>
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
