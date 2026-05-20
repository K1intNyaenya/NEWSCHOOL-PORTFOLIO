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
  employment_status: '',
  member_country: '',
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
  const tenantId = localStorage.getItem('tenant_id');


  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("User not authenticated, redirecting to login.");
      navigate('/');
      return;
    }
  
    fetchPortfolios();
  }, [navigate]);
  

  const fetchPortfolios = async () => {
    console.log("Fetching portfolios...");
    try {
        const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/NewSchoolMember/`);

        // Since `fetchWithAuth` has likely already parsed `response`, no need to call `response.json()`
        console.log("Portfolio fetch response:", response);

        // Assuming `response` is now the parsed JSON data (array of members)
        const members = response;

        const membersWithImages = await Promise.all(
            members.map(async (member) => {
                const imageResponse = await fetchProfileImage(member.id);
                return { ...member, profile_image_url: imageResponse };
            })
        );

        setPortfolios(membersWithImages);
    } catch (error) {
        console.error("Fetch Portfolios Error:", error);
        setError('Failed to fetch portfolios. Please try again later.');
    } finally {
        setLoading(false);
    }
};


const togglePendingApplicationsModal = async () => {
  if (!isPendingModalOpen) {
      try {
          const data = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/pending-applications/`);
          if (data && data.ok === false) {
              throw new Error('Failed to fetch pending applications');
          }
          setPendingApplications(data);
          setIsPendingModalOpen(true);
      } catch (error) {
          console.error("Error fetching pending applications:", error);
      }
  } else {
      setIsPendingModalOpen(false);
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

  const handleApplication = async (application, isApproved) => {
    try {
      const response = await fetchWithAuth(
        `http://127.0.0.1:8080/portfolio/review-application/${application.id}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            approved: isApproved,
            member_email: application.member_email,
            username: application.username,
            password: isApproved ? 'temporarypassword123' : null,
          }),
        }
      );
      
      if (response.ok) {
        setPendingApplications(prev => prev.filter(app => app.id !== application.id));
        setIsPendingFormOpen(false);

        if (isApproved) {
          const newMemberResponse = await response.json();
          setPortfolios(prevPortfolios => [...prevPortfolios, newMemberResponse]);
          console.log("New member added from approved application:", newMemberResponse);
          await sendPasswordResetLink(application.member_email);
        }
      } else {
        console.error(`Failed to ${isApproved ? 'approve' : 'reject'} application ${application.id}`);
      }
    } catch (error) {
      console.error(`Error ${isApproved ? 'approving' : 'rejecting'} application:`, error);
    }
  };

  const sendPasswordResetLink = async (email) => {
    console.log(`Sending password reset link to ${email}`);
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
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/review-application/${id}/`, {
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

  const handleApproveApplication = async (id) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/review-application/${id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });
  
      if (response.ok) {
        console.log(`Application ${id} approved successfully`);
        // Remove the approved application from pending applications list
        setPendingApplications(prevApplications => prevApplications.filter(app => app.id !== id));
        setIsPendingFormOpen(false);
      } else {
        console.error(`Failed to approve application ${id}`);
      }
    } catch (error) {
      console.error("Error approving application:", error);
    }
  };  

  const uploadProfileImage = async (memberId, base64Image) => {
    console.log(`Uploading profile image for member ID ${memberId}`);
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/upload-profile-image/`, {
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
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/get-profile-image/${memberId}/`);
      if (response.status === 404) {
        console.warn(`No image found for member ID ${memberId}. Returning blank field.`);
        return ''; // Return empty string for missing images
      } else if (!response.ok) {
        console.error(`Unexpected error fetching profile image for member ID ${memberId}. Status: ${response.status}`);
        return null;
      }
  
      const data = await response.json();
      return data.profile_image_url || '';
    } catch (error) {
      console.error(`Error fetching profile image for member ID ${memberId}:`, error);
      return null;
    }
  };
  
  

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const updatedEmploymentHistory = newUser.employment_history.filter(job => job.employer && job.job_title);
    const payload = {
      ...newUser,
      employment_history: updatedEmploymentHistory,
      employment_status: newUser.employment_status,
      member_country: newUser.member_country,
  };

    if (portfolios.some(member => member.member_email === payload.member_email)) {
      setError('Email already exists. Please use a different email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/NewSchoolMember/add/`, {
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
    } catch (error) {
      console.error("Error adding member:", error);
      setError('Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    } 
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/NewSchoolMember/${updatedUser.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
  
      if (!response.ok) throw new Error('Failed to update user');
      const updatedData = await response.json();
  
      setPortfolios((prevPortfolios) =>
        prevPortfolios.map((user) => (user.id === updatedData.id ? updatedData : user))
      );
  
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
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
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/send-application/${email}/`, {
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
                uploadProfileImage={uploadProfileImage}
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
                onApprove={() => handleApproveApplication(selectedApplication.id)}
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
