import React, { useState, useEffect } from 'react';
import './style/AdminDashboard.css';
import PortfolioCard from './PortfolioCard'; // Import the PortfolioCard component

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
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await fetch("http://127.0.0.1:8080/portfolio/NewSchoolMember/");
        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);
        const data = await response.json();
        setPortfolios(data);
      } catch (error) {
        console.error("Failed to fetch portfolios:", error);
        setError("Failed to load portfolios. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchPortfolios();
  }, []);

  const validateForm = () => {
    const formErrors = {};
    if (!newUser.first_name) formErrors.first_name = 'First Name is required';
    if (!newUser.member_title) formErrors.member_title = 'Profession is required';
    if (newUser.member_email && !/\S+@\S+\.\S+/.test(newUser.member_email)) {
      formErrors.member_email = 'Email is invalid';
    }
    if (newUser.member_mobile && !/^\d{10}$/.test(newUser.member_mobile)) {
      formErrors.member_mobile = 'Mobile should be 10 digits';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const updatedCompanies = newUser.previous_jobs.filter(
      (job) => job.employer && job.jobtitle
    );

    const payload = {
      ...newUser,
      previous_jobs: updatedCompanies,
    };

    try {
      const response = await fetch("http://127.0.0.1:8080/portfolio/NewSchoolMember/add", {
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

      setPortfolios((prev) => [
        ...prev,
        {
          id: newPortfolio.id,
          name: `${newPortfolio.first_name} ${newPortfolio.second_name} ${newPortfolio.family_name}`,
          profession: newPortfolio.member_title,
          yearsOfExperience: newPortfolio.member_years_of_experience,
          companies: newPortfolio.previous_jobs,
          image: 'https://via.placeholder.com/150', // Placeholder image
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

      setIsModalOpen(false);
      setSuccessMessage("New member added successfully!");
    } catch (error) {
      console.error("Failed to add user:", error);
      setError("Failed to add user. Please try again later.");
    } finally {
      setIsSubmitting(false);
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
          aria-label="Search for users"
        />
        <button className="add-member-btn" onClick={toggleModal}>
          Add User
        </button>
      </div>

      {loading ? (
        <p>Loading portfolios...</p>
      ) : (
        <div className="portfolios">
          {portfolios
            .filter((user) => {
              const userName = user.name ? user.name.toLowerCase() : ''; // Guard against undefined
              return userName.includes(searchTerm.toLowerCase());
            })
            .map((user) => (
              <PortfolioCard key={user.id} user={user} />
            ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Member</h3>
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
                        placeholder="Email"
                        value={newUser.member_email}
                        onChange={(e) => setNewUser({ ...newUser, member_email: e.target.value })}
                      />
                      {errors.member_email && <span className="error">{errors.member_email}</span>}
                    </div>
                  </fieldset>
                </div>
              )}

              {activeTab === 'employmentHistory' && (
                <div>
                  <fieldset>
                    <legend>Employment History</legend>
                    {newUser.previous_jobs.map((job, index) => (
                      <div key={index}>
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
                        <div className="form-row">
                          <button type="button" onClick={() => removeJobField(index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="form-row">
                      <button type="button" onClick={addJobField}>
                        Add Job
                      </button>
                    </div>
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

            {error && <div className="error">{error}</div>}
            {successMessage && <div className="success">{successMessage}</div>}

            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={toggleModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleAddUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
