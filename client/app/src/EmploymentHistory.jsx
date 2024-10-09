import React from 'react';

const EmploymentHistory = ({ user, setUser }) => {
  const handleJobChange = (index, field, value) => {
    const updatedJobs = [...user.employment_history];
    updatedJobs[index][field] = value;
    setUser({ ...user, employment_history: updatedJobs });
  };

  const handleAddJob = () => {
    setUser({
      ...user,
      employment_history: [...user.employment_history, { employer: '', jobtitle: '' }]
    });
  };

  const handleRemoveJob = (index) => {
    const updatedJobs = user.employment_history.filter((_, i) => i !== index);
    setUser({ ...user, employment_history: updatedJobs });
  };

  return (
    <fieldset>
      <legend>Employment History</legend>
      {user.employment_history.map((job, index) => (
        <div key={index}>
          <div className="form-row">
            <label>Employer *</label>
            <input
              type="text"
              value={job.employer}
              onChange={(e) => handleJobChange(index, 'employer', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Position *</label>
            <input
              type="text"
              value={job.jobtitle}
              onChange={(e) => handleJobChange(index, 'jobtitle', e.target.value)}
            />
          </div>
          {user.employment_history.length > 1 && (
            <button type="button" onClick={() => handleRemoveJob(index)}>
              Remove Job
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={handleAddJob}>
        Add Another Job
      </button>
    </fieldset>
  );
};

export default EmploymentHistory;
