import React from 'react';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import '../PortfolioHeader/PortfolioHeader.css';
import { fileUrl } from '../../shared/api/files';

const PortfolioHeader = ({ user }) => {
  if (!user) return null;

  return (
    <div className="portfolio-header-card">
      {/* banner */}
      <div
        className="portfolio-banner"
        style={{
          backgroundImage: user.headerUrl
            ? fileUrl(user.headerUrl)
            : undefined
        }}
      />

      <div className="portfolio-profile-section">
        <div className="portfolio-top-row">
          {/* avatar */}
          <img
            src={
              user.avatarUrl
                ? fileUrl(user.avatarUrl)
                : 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
            }
            alt="Profile"
            className="portfolio-avatar"
          />

          <div className="portfolio-main-info">
            <div className="portfolio-info-row">
              <div className="portfolio-info">
                {/* name */}
                <h1 className="portfolio-name">
                  {user.firstName} {user.secondName}
                </h1>

                {/* title / headline */}
                <p className="portfolio-title">
                  {user.headline || user.profileTitle}
                </p>

                {/* location */}
                <p className="portfolio-location">
                  {user.location}
                </p>

                {/* portfolio link */}
                {user.portfolioUrl && (
                  <div className="portfolio-links">
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="portfolio-link"
                    >
                      {user.portfolioUrl}
                    </a>
                    <ExternalLink size={14} />
                  </div>
                )}

                {/* connections — пока заглушка */}
                <p className="portfolio-connections">
                  500+ connections
                </p>
              </div>

              {/* right column — оставили как есть */}
              <div className="portfolio-contact-info">
                <p className="contact-item">Better Community (Adult-Orphan)</p>
                <p className="contact-item">Grovemade Authentic (UCLA)</p>
                <button className="more-icon-button">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="portfolio-actions">
          <button className="btn-send">Send a Message</button>
          <button className="btn-more-action">More</button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeader;
