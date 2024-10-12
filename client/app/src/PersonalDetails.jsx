import React from 'react';
import './style/PersonalDetails.css';

const PersonalDetails = ({ user, setUser, errors }) => {
  return (
    <fieldset className="personal-details-fieldset">
      <legend>Personal Details</legend>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            placeholder="First Name"
            value={user.first_name || ''}
            onChange={(e) => setUser({ ...user, first_name: e.target.value })}
          />
          {errors.first_name && <span className="error">{errors.first_name}</span>}
        </div>
        <div className="form-row">
          <label htmlFor="second_name">Second Name</label>
          <input
            type="text"
            id="second_name"
            placeholder="Second Name"
            value={user.second_name || ''}
            onChange={(e) => setUser({ ...user, second_name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <label htmlFor="family_name">Family Name</label>
          <input
            type="text"
            id="family_name"
            placeholder="Family Name"
            value={user.family_name || ''}
            onChange={(e) => setUser({ ...user, family_name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <label htmlFor="member_title">Profession</label>
          <input
            type="text"
            id="member_title"
            placeholder="Enter Profession"
            value={user.member_title || ''}
            onChange={(e) => setUser({ ...user, member_title: e.target.value })}
          />
        </div>
        <div className="form-row">
          <label htmlFor="member_industry">Industry</label>
          <input
            type="text"
            id="member_industry"
            placeholder="Industry"
            value={user.member_industry || ''}
            onChange={(e) => setUser({ ...user, member_industry: e.target.value })}
          />
        </div>
        <div className="form-row">
          <label htmlFor="member_mobile">Mobile</label>
          <input
            type="text"
            id="member_mobile"
            placeholder="Mobile Number"
            value={user.member_mobile || ''}
            onChange={(e) => setUser({ ...user, member_mobile: e.target.value })}
          />
          {errors.member_mobile && <span className="error">{errors.member_mobile}</span>}
        </div>
        <div className="form-row">
          <label htmlFor="member_email">Email *</label>
          <input
            type="email"
            id="member_email"
            placeholder="Email"
            value={user.member_email || ''}
            onChange={(e) => setUser({ ...user, member_email: e.target.value })}
          />
          {errors.member_email && <span className="error">{errors.member_email}</span>}
        </div>
      </div>
    </fieldset>
  );
};

export default PersonalDetails;
