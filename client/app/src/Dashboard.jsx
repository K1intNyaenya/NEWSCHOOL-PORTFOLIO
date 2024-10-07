import React, { useState, useEffect } from 'react';
import PortfolioCard from './PortfolioCard'; // Import the PortfolioCard component
import './style/Dboard.css'; // Ensure correct file extension

function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8080/portfolio/NewSchoolMember/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPortfolios(data);
      } catch (err) {
        setError("Failed to fetch portfolios. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      {portfolios.length > 0 ? (
        portfolios.map((user) => (
          <PortfolioCard key={user.username} user={user} />
        ))
      ) : (
        <p>No portfolios available.</p>
      )}
    </div>
  );
}

export default Dashboard;
