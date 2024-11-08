import React from 'react';
import './style/PersonalDetails.css';

const employmentStatusOptions = [
  { value: 'FT', label: 'Full-Time' },
  { value: 'PT', label: 'Part-Time' },
  { value: 'CT', label: 'Contractor' },
  { value: 'IN', label: 'Intern' },
];

const countryOptions = [
  { value: 'Kenya', label: 'KE' },
  { value: 'Tanzania', label: 'TZ' },
  { value: 'Uganda', label: 'UG' },
  { value: 'Rwanda', label: 'RW' },
  { value: 'Zimbabwe', label: 'ZW' },
  { value: 'South Africa', label: 'SA' },
  { value: 'Mozambique', label: 'MZ' },
  { value: 'Ghana', label: 'GH' },
  { value: 'United Arab Emirates', label: 'UAE' },
  { value: 'Norway', label: 'NO' },
  { value: 'France', label: 'FR' },
  { value: 'Italy', label: 'IT' },
];

const PersonalDetails = ({ user, setUser, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  return (
    <fieldset className="personal-details-fieldset">
      <legend>Personal Details</legend>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="First Name"
            value={user.first_name || ''}
            onChange={handleChange}
          />
          {errors.first_name && <span className="error">{errors.first_name}</span>}
        </div>

        <div className="form-row">
          <label htmlFor="second_name">Second Name</label>
          <input
            type="text"
            id="second_name"
            name="second_name"
            placeholder="Second Name"
            value={user.second_name || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="family_name">Family Name</label>
          <input
            type="text"
            id="family_name"
            name="family_name"
            placeholder="Family Name"
            value={user.family_name || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="member_title">Profession</label>
          <input
            type="text"
            id="member_title"
            name="member_title"
            placeholder="Enter Profession"
            value={user.member_title || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="member_industry">Industry</label>
          <input
            type="text"
            id="member_industry"
            name="member_industry"
            placeholder="Industry"
            value={user.member_industry || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="member_mobile">Mobile</label>
          <input
            type="text"
            id="member_mobile"
            name="member_mobile"
            placeholder="Mobile Number"
            value={user.member_mobile || ''}
            onChange={handleChange}
          />
          {errors.member_mobile && <span className="error">{errors.member_mobile}</span>}
        </div>

        <div className="form-row">
          <label htmlFor="member_email">Email *</label>
          <input
            type="email"
            id="member_email"
            name="member_email"
            placeholder="Email"
            value={user.member_email || ''}
            onChange={handleChange}
          />
          {errors.member_email && <span className="error">{errors.member_email}</span>}
        </div>

        <div className="form-group">
          <label>Employment Status:</label>
          <select
            name="employment_status"
            value={user.employment_status}
            onChange={handleChange}
          >
            <option value="">Select Employment Status</option>
            {employmentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.employment_status && <span className="error">{errors.employment_status}</span>}
        </div>

        <div className="form-group">
          <label>Member Country:</label>
          <select
            name="member_country"
            value={user.member_country}
            onChange={handleChange}
          >
            <option value="">Select Country</option>
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.member_country && <span className="error">{errors.member_country}</span>}
        </div>
      </div>
    </fieldset>
  );
};

export default PersonalDetails;
