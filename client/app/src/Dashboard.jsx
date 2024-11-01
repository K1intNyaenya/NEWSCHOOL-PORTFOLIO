import React, { useState, useEffect } from 'react';
import PortfolioViewCard from './PortfolioViewCard';
import './style/Dboard.css';
import { fetchWithAuth } from './authService';

function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth("http://127.0.0.1:8080/portfolio/NewSchoolMember/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched portfolios successfully:", data);

        // Ensure unique portfolios by ID
        const uniquePortfolios = Array.from(new Set(data.map(item => item.id)))
          .map(id => data.find(item => item.id === id));
        
        setPortfolios(uniquePortfolios);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Failed to fetch portfolios. Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const filteredPortfolios = portfolios.filter((user) => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.member_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.member_industry.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Search by name, industry, title..." 
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
