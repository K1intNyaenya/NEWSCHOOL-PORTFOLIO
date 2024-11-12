import React, { useState } from 'react';
import './style/PendingForm.css';

function PendingForm({ applicantData, onClose, onApprove, onReject }) {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    comments: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.comments) newErrors.comments = 'Comments are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApprovalSubmit = () => {
    if (validateForm()) {
      onApprove(applicantData.id, formData);
      setShowApprovalForm(false);
      setFormData({ username: '', password: '', comments: '' });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="top-close-button" onClick={onClose}>✕</button>
        
        <h2>Application Details</h2>
        
        <fieldset>
          <legend>Personal Information</legend>
          <p><strong>First Name:</strong> {applicantData.first_name}</p>
          <p><strong>Second Name:</strong> {applicantData.second_name}</p>
          <p><strong>Family Name:</strong> {applicantData.family_name}</p>
          <p><strong>Mobile Number:</strong> {applicantData.mobile_number}</p>
          <p><strong>Applicant Email:</strong> {applicantData.member_email}</p>
        </fieldset>
        
        <fieldset>
          <legend>Employment Information</legend>
          <p><strong>Member Title:</strong> {applicantData.member_title}</p>
          <p><strong>Member Industry:</strong> {applicantData.member_industry}</p>
          <p><strong>Employment Industry:</strong> {applicantData.employment_industry}</p>
        </fieldset>
        
        <fieldset>
          <legend>Additional Information</legend>
          <p><strong>Reason for Joining:</strong> {applicantData.reason_for_joining}</p>
          <p><strong>Referred By (Name):</strong> {applicantData.referred_by_name}</p>
          <p><strong>Referred By (Mobile No):</strong> {applicantData.referred_by_mobile}</p>
        </fieldset>
        
        <fieldset>
          <legend>For Official Use Only</legend>
          <p><strong>Vetted By:</strong> {applicantData.vetted_by || 'Pending'}</p>
        </fieldset>
        
        <div className="button-container">
          <button className="approve-button" onClick={() => setShowApprovalForm(true)}>Approve</button>
          <button className="reject-button" onClick={() => onReject(applicantData.id)}>Reject</button>
        </div>
      </div>

      {showApprovalForm && (
        <div className="approval-overlay">
          <div className="approval-form">
            <h3>Approval Details</h3>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                aria-live="assertive"
              />
              {errors.username && <span className="error" role="alert">{errors.username}</span>}
            </label>
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                aria-live="assertive"
              />
              {errors.password && <span className="error" role="alert">{errors.password}</span>}
            </label>
            <label>
              Comments:
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                required
                aria-live="assertive"
              ></textarea>
              {errors.comments && <span className="error" role="alert">{errors.comments}</span>}
            </label>
            <div className="button-container">
              <button className="approve-button" onClick={handleApprovalSubmit}>Submit Approval</button>
              <button className="close-button" onClick={() => setShowApprovalForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingForm;
