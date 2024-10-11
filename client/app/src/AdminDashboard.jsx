import React, { useState, useEffect } from 'react';
import './style/AdminDashboard.css';
import PortfolioCard from './PortfolioCard';  // Use the updated PortfolioCard component
import PersonalDetails from './PersonalDetails';
import EmploymentHistory from './EmploymentHistory';
import UserCredentials from './UserCredentials';
import ApplicationForm from './ApplicationForm'; // Import ApplicationForm component

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    first_name: '',
    second_name: '',
    family_name: '',
    member_title: '',
    employment_history: [
      { employer: '', job_title: '' }, // Placeholder for two jobs
    ],
    member_mobile: '',
    member_email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false); // State for Application Form modal
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/portfolio/NewSchoolMember/');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      const uniquePortfolios = Array.from(new Map(data.map(item => [item.id, item])).values());
      setPortfolios(uniquePortfolios);
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
      setError('Failed to fetch portfolios. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!newUser.first_name) formErrors.first_name = 'First Name is required';
    if (!newUser.member_title) formErrors.member_title = 'Profession is required';
    if (newUser.member_email && !/\S+@\S+\.\S+/.test(newUser.member_email)) {
      formErrors.member_email = 'Email is invalid';
    }
    if (newUser.member_mobile && !/^\+?[1-9]\d{1,14}$/.test(newUser.member_mobile)) {
      formErrors.member_mobile = 'Mobile number is invalid';
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const updatedEmploymentHistory = newUser.employment_history.filter(
      (job) => job.employer && job.job_title
    );

    const payload = {
      ...newUser,
      employment_history: updatedEmploymentHistory,
    };

    const isDuplicateEmail = portfolios.some(
      (member) => member.member_email === payload.member_email
    );

    if (isDuplicateEmail) {
      setError('Email already exists. Please use a different email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8080/portfolio/NewSchoolMember/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Error Response:', errorResponse);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    
      const newMember = await response.json();
      setPortfolios(prevPortfolios => [...prevPortfolios, newMember]);
    
      setNewUser({
        first_name: '',
        second_name: '',
        family_name: '',
        member_title: '',
        employment_history: [{ employer: '', job_title: '' }],
        member_mobile: '',
        member_email: '',
        username: '',
        password: '',
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

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/portfolio/NewSchoolMember/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedData = await response.json();
      setPortfolios(prevPortfolios => 
        prevPortfolios.map(user => (user.id === updatedData.id ? updatedData : user))
      );
    } catch (error) {
      console.error("Failed to update user:", error);
      setError("Failed to update user. Please try again later.");
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setErrors({});
    setError('');
    setSuccessMessage('');
  };

  const toggleApplicationFormModal = () => {
    setIsApplicationFormOpen(!isApplicationFormOpen); // Toggle Application Form modal
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="controls-container">
        <input
          type="text"
          placeholder="Search by name or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="register-member-button" onClick={toggleModal}>Add New Member</button>
        <button className="open-application-form-button" onClick={toggleApplicationFormModal}>Open Application Form</button>
      </div>
      
      <div className="portfolio-cards">
        {loading ? (
          <p>Loading portfolios...</p>
        ) : (
          portfolios
            .filter(portfolio => {
              const fullName = `${portfolio.first_name} ${portfolio.second_name} ${portfolio.family_name} ${portfolio.member_industry}`.toLowerCase();
              return fullName.includes(searchTerm.toLowerCase());
            })
            .map(portfolio => (
              <PortfolioCard
                key={portfolio.id}
                user={portfolio}
                onUpdate={handleUpdateUser}
              />
            ))
        )}
      </div>
      
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Member</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
              <div className="tabs">
                <button type="button" onClick={() => setActiveTab('personalDetails')}>Personal Details</button>
                <button type="button" onClick={() => setActiveTab('employmentHistory')}>Employment History</button>
                <button type="button" onClick={() => setActiveTab('userCredentials')}>User Credentials</button>
              </div>
              {activeTab === 'personalDetails' && (
                <PersonalDetails user={newUser} setUser={setNewUser} errors={errors} />
              )}
              {activeTab === 'employmentHistory' && (
                <EmploymentHistory user={newUser} setUser={setNewUser} />
              )}
              {activeTab === 'userCredentials' && (
                <UserCredentials user={newUser} setUser={setNewUser} />
              )}
              {error && <span className="error">{error}</span>}
              {successMessage && <span className="success">{successMessage}</span>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </button>
              <button type="button" onClick={toggleModal}>Close</button>
            </form>
          </div>
        </div>
      )}

      {isApplicationFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Application Form</h2>
            <ApplicationForm />
            <button type="button" onClick={toggleApplicationFormModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
