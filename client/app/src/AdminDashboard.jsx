import React, { useState, useEffect } from 'react';
import './style/AdminDashboard.css';
import PortfolioCard from './PortfolioCard';
import PersonalDetails from './PersonalDetails';
import EmploymentHistory from './EmploymentHistory';
import UserCredentials from './UserCredentials';
import ApplicationForm from './ApplicationForm';
import PendingForm from './PendingForm';
import { fetchWithAuth, isAuthenticated } from './authService';
import { useNavigate } from 'react-router-dom';


const initialNewUser = {
  first_name: '',
  second_name: '',
  family_name: '',
  member_title: '',
  employment_history: [{ employer: '', job_title: '' }],
  member_mobile: '',
  member_email: '',
  username: '',
  password: '',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState(initialNewUser);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [portfolios, setPortfolios] = useState([]);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isPendingFormOpen, setIsPendingFormOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("User not authenticated, redirecting to login.");
      navigate('/');
      return;
    }
  
    fetchPortfolios();
  }, [navigate]);
  

  const fetchPortfolios = async () => {
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8080/portfolio/NewSchoolMember/');
      if (!response.ok) throw new Error('Error fetching portfolios');
      const members = await response.json();

      const membersWithImages = await Promise.all(members.map(async (member) => {
        const imageResponse = await fetchProfileImage(member.id);
        return imageResponse ? { ...member, profile_image_url: imageResponse } : member;
      }));

  
      setPortfolios(membersWithImages);
    } catch (error) {
      setError('Failed to fetch portfolios. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  const togglePendingApplicationsModal = async () => {
    setIsPendingModalOpen(!isPendingModalOpen);
    if (!isPendingModalOpen) {
      try {
        const response = await fetchWithAuth('http://127.0.0.1:8080/portfolio/pending-applications/');
        if (!response.ok) throw new Error('Failed to fetch pending applications');
        const data = await response.json();
        setPendingApplications(data);
      } catch (error) {
        console.error("Error fetching pending applications:", error);
      }
    }
  };


  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsPendingFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsPendingFormOpen(false);
    setSelectedApplication(null);
  };

  const handleApproveApplication = async (application) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/review-application/${application.id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: true,
          member_email: application.member_email,
          username: application.username,
          password: 'temporarypassword123'
        }),
      });
      
      if (response.ok) {
        console.log(`Application ${application.id} approved successfully`);
        setPendingApplications(prevApplications => prevApplications.filter(app => app.id !== application.id));
        setIsPendingFormOpen(false);
        
        const newMemberResponse = await response.json();
        setPortfolios(prevPortfolios => [...prevPortfolios, newMemberResponse]);
        console.log("New member added from approved application:", newMemberResponse);

        await sendPasswordResetLink(application.email);
      } else {
        console.error(`Failed to approve application ${application.id}`);
      }
    } catch (error) {
      console.error("Error approving application:", error);
    }
  };

  const sendPasswordResetLink = async (email) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/send-reset-password-link/${email}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log(`Password reset link sent to ${email}`);
      } else {
        console.error(`Failed to send password reset link to ${email}`);
      }
    } catch (error) {
      console.error("Error sending password reset link:", error);
    }
  };

  const handleRejectApplication = async (id) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/review-application/${id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      });

      if (response.ok) {
        console.log(`Application ${id} rejected successfully`);
        setPendingApplications(prevApplications => prevApplications.filter(app => app.id !== id));
        setIsPendingFormOpen(false);
      } else {
        console.error(`Failed to reject application ${id}`);
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
    }
  };

  const uploadProfileImage = async (memberId, base64Image) => {
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8080/portfolio/upload-profile-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: memberId,
          profileImage: base64Image,
        }),
      });

      if (response.ok) {
        console.log('Profile image uploaded successfully');
      } else {
        console.error('Failed to upload profile image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const fetchProfileImage = async (memberId) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/get-profile-image/${memberId}/`);
      if (response.ok) {
        const data = await response.json(); // { profile_image_url: 'url_to_image' }
        return data.profile_image_url; // Return the actual image URL
      } else {
        console.error('Failed to fetch profile image');
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      return null;
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    const { password, ...userWithoutPassword } = updatedUser;

    const payload = password ? updatedUser : userWithoutPassword;

    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/NewSchoolMember/${updatedUser.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedData = await response.json();

        setPortfolios((prevPortfolios) =>
          prevPortfolios.map((user) =>
            user.id === updatedData.id ? updatedData : user
          )
        );
        setSuccessMessage('Member updated successfully');
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setError('Failed to update user. Please try again later.');
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!newUser.first_name) {
      formErrors.first_name = 'First Name is required';
    }
    if (!newUser.member_title) {
      formErrors.member_title = 'Profession is required';
    }
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

    const updatedEmploymentHistory = newUser.employment_history.filter(job => job.employer && job.job_title);
    const payload = { ...newUser, employment_history: updatedEmploymentHistory };

    if (portfolios.some(member => member.member_email === payload.member_email)) {
      setError('Email already exists. Please use a different email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetchWithAuth("http://127.0.0.1:8080/portfolio/NewSchoolMember/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newMember = await response.json();
        setPortfolios(prevPortfolios => [...prevPortfolios, newMember]);
        resetForm();
        setIsModalOpen(false);
        setSuccessMessage("New member added successfully!");
      } else {
        throw new Error('Failed to add member');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewUser(initialNewUser);
    setErrors({});
    setSuccessMessage('');
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setErrors({});
    setError('');
    setSuccessMessage('');
  };

  const toggleApplicationFormModal = () => setIsApplicationFormOpen(!isApplicationFormOpen);
  const toggleEmailModal = () => { setIsEmailModalOpen(!isEmailModalOpen); setEmail(''); };

  const handleSendApplicationForm = () => {
    toggleApplicationFormModal();
    toggleEmailModal();
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/send-application/${email}/`, {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('Email sent successfully');
      } else {
        console.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
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
        <button className="view-pending-applications-button" onClick={togglePendingApplicationsModal}>View Pending Applications</button>
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
                uploadProfileImage={uploadProfileImage} // Pass image upload handler
              />
            ))
        )}
      </div>

      {/* Pending Applications Modal */}
      {isPendingModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Pending Applications</h2>
            {pendingApplications.length > 0 ? (
              <ul className="pending-list">
                {pendingApplications.map((application) => (
                  <li key={application.id} className="pending-list-item">
                    <div className="application-info">
                      <strong>{application.first_name} {application.second_name} {application.family_name}</strong><br />
                      Email: {application.member_email}<br />
                      Date of Application: {application.date_of_application}
                    </div>
                    <button className="view-button" onClick={() => handleViewApplication(application)}>View</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pending applications found.</p>
            )}
            {isPendingFormOpen && selectedApplication && (
              <PendingForm
                applicantData={selectedApplication}
                onClose={handleCloseForm}
                onApprove={() => handleApproveApplication(selectedApplication)}
                onReject={() => handleRejectApplication(selectedApplication.id)}
              />
            )}
            <button className="close-button" onClick={togglePendingApplicationsModal}>Close</button>
          </div>
        </div>
      )}

      {/* Add New Member Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Member</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
              <div className="tabs">
                <button
                  type="button"
                  className={activeTab === 'personalDetails' ? 'active' : ''} 
                  onClick={() => setActiveTab('personalDetails')}
                >
                  Personal Details
                </button>
                <button
                  type="button"
                  className={activeTab === 'employmentHistory' ? 'active' : ''} 
                  onClick={() => setActiveTab('employmentHistory')}
                >
                  Employment History
                </button>
                <button
                  type="button"
                  className={activeTab === 'userCredentials' ? 'active' : ''} 
                  onClick={() => setActiveTab('userCredentials')}
                >
                  User Credentials
                </button>
              </div>
              
              {activeTab === 'personalDetails' && (
                <PersonalDetails user={newUser} setUser={setNewUser} errors={errors} />
              )}
              
              {activeTab === 'employmentHistory' && (
                <EmploymentHistory user={newUser} setUser={setNewUser} />
              )}
              
              {activeTab === 'userCredentials' && (
                <div>
                  <UserCredentials user={newUser} setUser={setNewUser} />
                  <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              )}

              {error && <span className="error">{error}</span>}
              {successMessage && <span className="success">{successMessage}</span>}
              
              <button type="button" className="close-button" onClick={toggleModal}>Close</button>
            </form>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {isApplicationFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Application Form</h2>
            <ApplicationForm />
            <div className="button-container">
              <button type="button" className="close-button" onClick={toggleApplicationFormModal}>Close</button>
              <button type="button" className="send-button" onClick={handleSendApplicationForm}>Send Form</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Send Application Form</h2>
            <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <div className="button-container">
              <button type="button" className="cancel-button" onClick={toggleEmailModal}>Cancel</button>
              <button type="button" className="send-button" onClick={handleSendEmail}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
