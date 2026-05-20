import React from 'react';
import './style/EmploymentHistory.css';

const EmploymentHistory = ({ user, setUser }) => {
  const handleJobChange = (index, field, value) => {
    const updatedJobs = [...user.employment_history];
    updatedJobs[index][field] = value;
    setUser({ ...user, employment_history: updatedJobs });
  };

  const handleAddJob = () => {
    setUser({
      ...user,
      employment_history: [...user.employment_history, { employer: '', job_title: '' }]
    });
  };

  const handleRemoveJob = (index) => {
    const updatedJobs = user.employment_history.filter((_, i) => i !== index);
    setUser({ ...user, employment_history: updatedJobs });
  };

  return (
    <fieldset className="employment-history-fieldset">
      <legend>Employment History</legend>
      {user.employment_history.map((job, index) => (
        <div key={index} className="job-container">
          <div className="form-row">
            <label>Employer *</label>
            <input
              type="text"
              placeholder="Employer Name"
              value={job.employer || ''}
              onChange={(e) => handleJobChange(index, 'employer', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Position *</label>
            <input
              type="text"
              placeholder="Job Title"
              value={job.job_title || ''}
              onChange={(e) => handleJobChange(index, 'job_title', e.target.value)}
            />
          </div>
          {user.employment_history.length > 1 && (
            <button
              type="button"
              className="remove-job-button"
              onClick={() => handleRemoveJob(index)}
            >
              Remove Job
            </button>
          )}
        </div>
      ))}
      <button type="button" className="add-job-button" onClick={handleAddJob}>
        Add Another Job
      </button>
    </fieldset>
  );
};

export default EmploymentHistory;
