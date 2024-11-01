import React, { useState, useEffect } from 'react';
import './style/ApplicationForm.css';

function ApplicationForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    family_name: '',
    mobile_number: '',
    member_title: '',
    member_email: '',
    member_industry: '',
    employment_industry: '',
    reason_for_joining: '',
    referred_by_name: '',
    referred_by_mobile: '',
    vetted_by: '',
    member_joining_date: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Set email from URL params if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl) {
      setFormData((prev) => ({ ...prev, member_email: emailFromUrl }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Client-side validation
    if (!formData.member_email || !/\S+@\S+\.\S+/.test(formData.member_email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8080/portfolio/submit-application-form/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit application');
      }

      setSuccessMessage('Application submitted successfully!');
      setFormData({ ...formData, reason_for_joining: '', vetted_by: '', member_joining_date: '' });
    } catch (error) {
      console.error('Submission error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="application-form-container" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Personal Information</legend>
        <div className="form-grid">
          <label htmlFor="first_name">First Name: </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="second_name">Second Name: </label>
          <input
            type="text"
            id="second_name"
            name="second_name"
            placeholder="Second Name"
            value={formData.second_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="family_name">Family Name: </label>
          <input
            type="text"
            id="family_name"
            name="family_name"
            placeholder="Family Name"
            value={formData.family_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="mobile_number">Mobile Number: </label>
          <input
            type="text"
            id="mobile_number"
            name="mobile_number"
            placeholder="Mobile Number"
            value={formData.mobile_number}
            onChange={handleChange}
            required
          />

          <label htmlFor="member_email">Email: </label>
          <input
            type="email"
            id="member_email"
            name="member_email"
            placeholder="Email"
            value={formData.member_email}
            onChange={handleChange}
            required
            readOnly={!!formData.member_email}
          />

          <label htmlFor="member_title">Member Title: </label>
          <input
            type="text"
            id="member_title"
            name="member_title"
            placeholder="Member Title"
            value={formData.member_title}
            onChange={handleChange}
            required
          />

          <label htmlFor="member_industry">Member Industry: </label>
          <input
            type="text"
            id="member_industry"
            name="member_industry"
            placeholder="Member Industry"
            value={formData.member_industry}
            onChange={handleChange}
          />

          <label htmlFor="employment_industry">Employment Industry: </label>
          <input
            type="text"
            id="employment_industry"
            name="employment_industry"
            placeholder="Employment Industry"
            value={formData.employment_industry}
            onChange={handleChange}
            required
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Referral Information</legend>
        <div className="form-grid">
          <label htmlFor="referred_by_name">Referred By (Name): </label>
          <input
            type="text"
            id="referred_by_name"
            name="referred_by_name"
            placeholder="Referred By (Name)"
            value={formData.referred_by_name}
            onChange={handleChange}
          />

          <label htmlFor="referred_by_mobile">Referred By (Mobile No): </label>
          <input
            type="text"
            id="referred_by_mobile"
            name="referred_by_mobile"
            placeholder="Referred By (Mobile No)"
            value={formData.referred_by_mobile}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Additional Information</legend>
        <div className="form-grid">
          <label htmlFor="reason_for_joining">Reason for Joining: </label>
          <textarea
            id="reason_for_joining"
            name="reason_for_joining"
            placeholder="Reason for Joining"
            value={formData.reason_for_joining}
            onChange={handleChange}
          ></textarea>
        </div>
      </fieldset>

      <fieldset>
        <legend>For Official Use Only</legend>
        <div className="form-grid">
          <label htmlFor="vetted_by">Vetted By: </label>
          <input
            type="text"
            id="vetted_by"
            name="vetted_by"
            placeholder="Vetted By"
            value={formData.vetted_by}
            onChange={handleChange}
          />

          <label htmlFor="member_joining_date">Member Joining Date: </label>
          <input
            type="date"
            id="member_joining_date"
            name="member_joining_date"
            value={formData.member_joining_date}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}

export default ApplicationForm;
