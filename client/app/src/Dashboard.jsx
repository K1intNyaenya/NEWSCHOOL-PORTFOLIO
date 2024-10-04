import React, { useState, useEffect } from 'react';
import './style/Dboard.css'; // Ensure correct file extension

function PortfolioCard({ user }) {
  return (
    <div className="portfolio-card">
      <img src={user.image} alt={user.name} className="user-image" />
      <h2>{user.name}</h2>
      <p>{user.profession}</p>
      <p>{user.yearsOfExperience} years of experience</p>
      <h4>Companies Worked For:</h4>
      <ul>
        {user.companies.map((company, index) => (
          <li key={index}>
            {company.name} - {company.title}
          </li>
        ))}
      </ul>
      <button type="view">view</button>
    </div>
  );
}

function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null); // To handle errors

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/portfolio/NewSchoolMember/");
        
        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPortfolios(data); // Update state with the fetched portfolios
      } catch (err) {
        setError("Failed to fetch portfolios. Please try again later.");
      }
    };

    fetchPortfolios();
  }, []);
  return (
    <div className="dashboard">
      {portfolios.map((user) => (
        <PortfolioCard key={user.id} user={user} />
      ))}
    </div>
  );
}

export default Dashboard;
