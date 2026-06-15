import React, { useEffect, useState, useContext } from 'react';
import './PortfolioPage.css';
import PortfolioHeader from '../../features/PortfolioHeader/PortfolioHeader';
import PortfolioGeneralInfo from '../../features/PortfolioGeneralInfo/PortfolioGeneralInfo';
import PortfolioSections from '../../features/PortfolioSections/PortfolioSections';
import AppContext from '../../features/appContext/AppContext';
import { useParams } from 'react-router-dom';

const PortfolioPage = () => {
  
 const { request } = useContext(AppContext);
  const { username } = useParams(); // это userId
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    request(`api://portfolio/${username}`)
      .then(setPortfolio)
      .catch(console.error);
  }, [username, request]);

  if (!portfolio) {
    return <div>Loading portfolio...</div>;
  }
 

  if (!portfolio) return <div>Loading portfolio...</div>;

  return (
    <main className="main-content">
      <div className="container">
        <div className="portfolio-page">
          <div className="portfolio-content">
            <PortfolioHeader user={portfolio.user} />
            <PortfolioGeneralInfo user={portfolio.user} skills={portfolio.skills} />
            <PortfolioSections
              experience={portfolio.experience}
              education={portfolio.education}
              certificates={portfolio.certificates}
              recommendations={portfolio.recommendations}
              languages={portfolio.languages}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PortfolioPage;
