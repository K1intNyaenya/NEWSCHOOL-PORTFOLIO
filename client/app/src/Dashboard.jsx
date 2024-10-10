import React, { useState, useEffect } from 'react';
import PortfolioViewCard from './PortfolioViewCard';
import './style/Dboard.css';

function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8080/portfolio/NewSchoolMember/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Remove duplicates based on a unique identifier
        const uniquePortfolios = Array.from(new Map(data.map(item => [item.id, item])).values());

        setPortfolios(uniquePortfolios);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch portfolios. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const filteredPortfolios = portfolios.filter((user) => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.member_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search by name or title..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="search-bar"
        />
      </div>
      
      <div className="portfolio-cards-container">
        {filteredPortfolios.length > 0 ? (
          filteredPortfolios.map((user) => (
            <PortfolioViewCard key={user.id} user={user} />
          ))
        ) : (
          <p>No portfolios available.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
