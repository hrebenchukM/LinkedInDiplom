import React from 'react';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import '../PortfolioHeader/PortfolioHeader.css';
import { getAssetUrl, getBackgroundImageStyle, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const PortfolioHeader = ({ user }) => {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="portfolio-header-card">
      <div
        className="portfolio-banner"
        style={getBackgroundImageStyle(user.headerUrl)}
      />

      <div className="portfolio-profile-section">
        <div className="portfolio-top-row">
          <SafeImage
            src={user.avatarUrl}
            fallback={IMAGE_PLACEHOLDERS.avatar}
            alt={t('portfolio.header.alt', 'Profile')}
            className="portfolio-avatar"
          />

          <div className="portfolio-main-info">
            <div className="portfolio-info-row">
              <div className="portfolio-info">
                <h1 className="portfolio-name">
                  {user.firstName} {user.secondName}
                </h1>

                <p className="portfolio-title">
                  {user.headline || user.profileTitle}
                </p>

                <p className="portfolio-location">
                  {user.location}
                </p>

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

                <p className="portfolio-connections">
                  {t('portfolio.connections', '500+ connections')}
                </p>
              </div>

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

        <div className="portfolio-actions">
          <button className="btn-send">{t('portfolio.sendMessage', 'Send a Message')}</button>
          <button className="btn-more-action">{t('portfolio.more', 'More')}</button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeader;
