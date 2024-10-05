import React, { useState, useEffect } from 'react';
import './style/Dboard.css'; // Ensure correct file extension

function PortfolioCard({ user }) {
  return (
    <div className="portfolio-card">
      <img src={user.image} alt={user.name} className="user-image" />
      <h2>{user.name}</h2>
      <p>{user.profession}</p>
      <p>{user.years_of_experience} years of experience</p>
      <h4>Companies Worked For:</h4>
      <ul>
        {user.companies.map((company, index) => (
          <li key={index}>
            {company.name} - {company.title}
          </li>
        ))}
      </ul>
      <button type="button">View</button>
    </div>
  );
}

function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true); // Set loading to true when fetching starts
      try {
        const response = await fetch("http://127.0.0.1:8000/portfolio/NewSchoolMember/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPortfolios(data);
      } catch (err) {
        setError("Failed to fetch portfolios. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false when fetching ends
      }
    };

    fetchPortfolios();
  }, []);

  // Handle loading and error states
  if (loading) {
    return <div className="loading">Loading...</div>; // You can style this as needed
  }

  if (error) {
    return <div className="error">{error}</div>; // Display error message
  }

  return (
    <div className="dashboard">
      {portfolios.length > 0 ? (
        portfolios.map((user) => (
          <PortfolioCard key={user.id} user={user} />
        ))
      ) : (
        <p>No portfolios available.</p> // Message for when there are no portfolios
      )}
    </div>
  );
}

export default Dashboard;
