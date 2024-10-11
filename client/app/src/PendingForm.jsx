import React from 'react';
import './style/PendingForm.css';

function PendingForm({ applicantData, onClose, onApprove, onReject }) {
  if (!applicantData) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Application Details</h2>
        
        <fieldset>
          <legend>Personal Information</legend>
          <p><strong>First Name:</strong> {applicantData.first_name}</p>
          <p><strong>Second Name:</strong> {applicantData.second_name}</p>
          <p><strong>Family Name:</strong> {applicantData.family_name}</p>
          <p><strong>Mobile Number:</strong> {applicantData.mobile_number}</p>
          <p><strong>Email:</strong> {applicantData.email}</p>
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
          <button className="approve-button" onClick={() => onApprove(applicantData.id)}>Approve</button>
          <button className="reject-button" onClick={() => onReject(applicantData.id)}>Reject</button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default PendingForm;
