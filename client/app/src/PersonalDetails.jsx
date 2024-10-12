import React from 'react';

const PersonalDetails = ({ user, setUser, errors }) => {
  return (
    <fieldset>
      <legend>Personal Details</legend>
      <div className="form-row">
        <label>First Name *</label>
        <input
          type="text"
          placeholder="First Name"
          value={user.first_name || ''}
          onChange={(e) => setUser({ ...user, first_name: e.target.value })}
        />
        {errors.first_name && <span className="error">{errors.first_name}</span>}
      </div>
      <div className="form-row">
        <label>Second Name</label>
        <input
          type="text"
          placeholder="Second Name"
          value={user.second_name || ''}
          onChange={(e) => setUser({ ...user, second_name: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Family Name</label>
        <input
          type="text"
          placeholder="Family Name"
          value={user.family_name || ''}
          onChange={(e) => setUser({ ...user, family_name: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Profession</label>
        <input
        type="text"
        placeholder="Enter Profession"
        value={user.member_title || ''}
        onChange={(e) => setUser({ ...user, member_title: e.target.value })}    
      />
      </div>
      <div className="form-row">
        <label>Industry</label>
        <input
          type="text"
          placeholder="Industry"
          value={user.member_industry || ''}
          onChange={(e) => setUser({ ...user, member_industry: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Mobile</label>
        <input
          type="text"
          placeholder="Mobile Number"
          value={user.member_mobile || ''}
          onChange={(e) => setUser({ ...user, member_mobile: e.target.value })}
        />
        {errors.member_mobile && <span className="error">{errors.member_mobile}</span>}
      </div>
      <div className="form-row">
        <label>Email *</label>
        <input
          type="email"
          placeholder="Email"
          value={user.member_email || ''}
          onChange={(e) => setUser({ ...user, member_email: e.target.value })}
        />
        {errors.member_email && <span className="error">{errors.member_email}</span>}
      </div>
    </fieldset>
  );
};

export default PersonalDetails;
