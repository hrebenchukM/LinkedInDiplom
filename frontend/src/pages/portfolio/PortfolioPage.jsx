import React, { useEffect, useState } from 'react';
import './PortfolioPage.css';
import PortfolioHeader from '../../features/PortfolioHeader/PortfolioHeader';
import PortfolioGeneralInfo from '../../features/PortfolioGeneralInfo/PortfolioGeneralInfo';
import PortfolioSections from '../../features/PortfolioSections/PortfolioSections';
import { useParams } from 'react-router-dom';
import { loadPublicPortfolio } from '../../features/profile/loadPortfolio.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

const PortfolioPage = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const data = await loadPublicPortfolio(username);
        if (!cancelled) {
          setPortfolio(data);
        }
      } catch (err) {
        console.error('Portfolio load error:', err);
        if (!cancelled) {
          setError(getErrorMessage(err));
          setPortfolio(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="portfolio-page auth-error">{error}</div>
        </div>
      </main>
    );
  }

  if (!portfolio) {
    return <div>Portfolio not found.</div>;
  }

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
