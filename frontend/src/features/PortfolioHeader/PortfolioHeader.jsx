import React from 'react';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import '../PortfolioHeader/PortfolioHeader.css';
import { getAssetUrl, getBackgroundImageStyle, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';

const PortfolioHeader = ({ user }) => {
  if (!user) return null;

  return (
    <div className="portfolio-header-card">
      {/* banner */}
      <div
        className="portfolio-banner"
        style={getBackgroundImageStyle(user.headerUrl)}
      />

      <div className="portfolio-profile-section">
        <div className="portfolio-top-row">
          {/* avatar */}
          <SafeImage
            src={user.avatarUrl}
            fallback={IMAGE_PLACEHOLDERS.avatar}
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
