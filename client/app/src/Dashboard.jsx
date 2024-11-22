import React, { useState, useEffect } from 'react';
import PortfolioViewCard from './PortfolioViewCard';
import './style/Dboard.css';
import { fetchWithAuth, getTenantId } from './authService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      setError(null);

      try {
        const tenantId = getTenantId();
        const response = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/NewSchoolMember/`);
        console.log("Fetched portfolios successfully:", response);

        if (response.success) {
          const data = response.data;

          // Fetch profile images for each portfolio
          const portfoliosWithImages = await Promise.all(
            data.map(async (member) => {
              const imageUrl = await fetchProfileImage(member.id);
              return { ...member, profile_image_url: imageUrl };
            })
          );

          setPortfolios(portfoliosWithImages);
        } else {
          console.error("Failed to fetch portfolios:", response.message);
          setError(response.message || 'Failed to fetch portfolios.');
          toast.error(response.message || 'Failed to fetch portfolios.');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Failed to fetch portfolios. Error: ${err.message}`);
        toast.error(`Failed to fetch portfolios. Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const fetchProfileImage = async (memberId) => {
    try {
      const tenantId = getTenantId();
      console.log(`Fetching profile image for member ID ${memberId}`);
      const response = await fetchWithAuth(
        `http://127.0.0.1:8080/portfolio/${tenantId}/get-profile-image/${memberId}/`
      );
      console.log(`Received data for member ID ${memberId}:`, response);

      if (response.success && response.profile_image_url) {
        console.log(`Profile image URL for member ID ${memberId}: ${response.profile_image_url}`);
        return response.profile_image_url;
      } else {
        console.warn(`No profile image URL returned for member ID ${memberId}.`);
        return '';
      }
    } catch (error) {
      console.error(`Error fetching profile image for member ID ${memberId}:`, error);
      return '';
    }
  };

  const filteredPortfolios = portfolios.filter((user) => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.member_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.member_industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <ToastContainer />
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default Dashboard;
