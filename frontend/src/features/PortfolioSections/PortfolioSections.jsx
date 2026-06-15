import React, { useState } from 'react';
import '../PortfolioSections/PortfolioSections.css';
import { fileUrl } from '../../shared/api/files';

const PortfolioSections = ({
  experience = [],
  education = [],
  certificates = [],
  recommendations = [],
  languages = []
}) => {
  const [activeRecommendationTab, setActiveRecommendationTab] = useState('received');

  // пока считаем все рекомендации как received
  const receivedRecommendations = recommendations;
  const givenRecommendations = [];

  return (
    <>
      {/* ================= EXPERIENCE ================= */}
      <div className="experience-section">
        <h2>Experience</h2>

        {experience.map((item, index) => {
          const exp = item.experience;
          const company = item.company;

          return (
            <div key={index} className="experience-entry">
              <div className="company-logo red-logo">
                {company?.name?.toUpperCase() === 'SONY'
                  ? <span className="sony-text">SONY</span>
                  : (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
                      <path d="M8 16L16 8L24 16L16 24L8 16Z" />
                    </svg>
                  )}
              </div>

              <div className="experience-details">
                <h3>{exp.position}</h3>
                <p className="company-name">
                  {company?.name} • {exp.employmentType}
                </p>
                <p className="experience-date">
                  {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}
                </p>
                <p className="experience-location">{exp.location}</p>

                {exp.description && (
                  <ul className="experience-list">
                    <li>{exp.description}</li>
                  </ul>
                )}
              </div>
            </div>
          );
        })}

        <button className="show-more-button">Show more</button>
      </div>

      {/* ================= EDUCATION ================= */}
      <div className="education-section">
        <h2>Education</h2>

        {education.map((item, index) => (
          <div key={index} className="education-entry">
            <div className="education-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#DC2626" strokeWidth="2"/>
                <path d="M24 12L16 20H20V32H28V20H32L24 12Z" fill="#DC2626"/>
              </svg>
            </div>

            <div className="education-details">
              <h3>{item.academy?.name || item.education.institution}</h3>
              <p className="education-degree">
                {item.education.degree} in {item.education.fieldOfStudy}
              </p>
              <p className="education-date">
                {item.education.startDate} - {item.education.endDate}
              </p>
            </div>
          </div>
        ))}

        <button className="show-more-button">Show more</button>
      </div>

      {/* ================= CERTIFICATES ================= */}
      <div className="certificates-section">
        <h2>Certificates and licenses</h2>

        {certificates.map((item, index) => (
          <div key={index} className="certificate-entry">
            <div className="certificate-logo black-bg">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="white">
                <path d="M18 24L24 18L30 24L24 30L18 24Z"/>
              </svg>
            </div>

            <div className="certificate-details">
              <h3>{item.certificate.name}</h3>
              <p className="certificate-issuer">
                {item.academy?.name}
              </p>
              <p className="certificate-date">
                Issued {item.certificate.issueDate}
                {item.certificate.expiryDate && ` • Expiring ${item.certificate.expiryDate}`}
              </p>
            </div>

            {item.certificate.downloadRef && (
              <button className="certificate-button">Certificate</button>
            )}
          </div>
        ))}

        <button className="show-more-button">Show more</button>
      </div>

      {/* ================= RECOMMENDATIONS ================= */}
      <div className="recommendations-section">
        <h2>Recommendations</h2>

        <div className="recommendations-tabs">
          <button
            className={`rec-tab ${activeRecommendationTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveRecommendationTab('received')}
          >
            Received
          </button>
          <button
            className={`rec-tab ${activeRecommendationTab === 'given' ? 'active' : ''}`}
            onClick={() => setActiveRecommendationTab('given')}
          >
            Given
          </button>
        </div>

       {(activeRecommendationTab === 'received'
  ? receivedRecommendations
  : givenRecommendations
).map((rec, index) => (
  <div key={index} className="recommendation-entry">
    <div className="rec-header">
      <img
        src={fileUrl(rec.author?.avatarUrl || 'default.jpg')}
        alt=""
        className="rec-avatar"
      />
      <div className="rec-info">
        <h3>
          {rec.author
            ? `${rec.author.firstName} ${rec.author.secondName}`
            : 'User'}
        </h3>
        <p className="rec-title">
          {rec.author?.profileTitle}
        </p>
      </div>
    </div>

    <div className="rec-content">
      <p>{rec.recommendation?.text}</p>
    </div>
  </div>
))}


        <button className="show-more-button">Show more</button>
      </div>

      {/* ================= LANGUAGES ================= */}
      <div className="languages-section">
        <h2>Languages</h2>

        {languages.map((l, index) => (
          <div key={index} className="language-entry">
            <div className="language-info">
              <h3>{l.language.name}</h3>
              <p className="language-level">{l.level}</p>
            </div>
          </div>
        ))}

        <button className="show-more-button">Show more</button>
      </div>
    </>
  );
};

export default PortfolioSections;
