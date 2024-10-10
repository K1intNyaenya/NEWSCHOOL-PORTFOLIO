import React, { useState } from 'react';

function ApplicationForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    family_name: '',
    mobile_number: '',
    member_title: '',
    member_industry: '',
    employment_industry: '',
    reason_for_joining: '',
    referred_by_name: '',
    referred_by_mobile: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8080/submit-application-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Application submitted successfully!");
      } else {
        alert("Failed to submit application.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Application Form</h2>
      <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
      <input type="text" name="second_name" placeholder="Second Name" value={formData.second_name} onChange={handleChange} required />
      <input type="text" name="family_name" placeholder="Family Name" value={formData.family_name} onChange={handleChange} required />
      <input type="text" name="mobile_number" placeholder="Mobile Number" value={formData.mobile_number} onChange={handleChange} required />
      <input type="text" name="member_title" placeholder="Member Title" value={formData.member_title} onChange={handleChange} required />
      <input type="text" name="member_industry" placeholder="Member Industry" value={formData.member_industry} onChange={handleChange} />
      <input type="text" name="employment_industry" placeholder="Employment Industry" value={formData.employment_industry} onChange={handleChange} required />
      <textarea name="reason_for_joining" placeholder="Reason for Joining" value={formData.reason_for_joining} onChange={handleChange} />
      <input type="text" name="referred_by_name" placeholder="Referred By (Name)" value={formData.referred_by_name} onChange={handleChange} />
      <input type="text" name="referred_by_mobile" placeholder="Referred By (Mobile No)" value={formData.referred_by_mobile} onChange={handleChange} />
      <button type="submit">Submit Application</button>
    </form>
  );
}

export default ApplicationForm;
