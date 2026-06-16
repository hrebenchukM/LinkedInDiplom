import React from 'react';
import { HelpCircle, Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LocaleContext.jsx';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-links">
              <div className="footer-column">
                <a href="#">{t('footer.generalInfo', 'General information')}</a>
                <a href="#">{t('footer.careers', 'Careers')}</a>
                <a href="#">{t('footer.adSettings', 'Ad Settings')}</a>
                <a href="#">{t('footer.securityCenter', 'Security Center')}</a>
              </div>
              <div className="footer-column">
                <a href="#">{t('footer.accessibility', 'Accessibility')}</a>
                <a href="#">{t('footer.privacyTerms', 'Privacy and Terms')}</a>
                <a href="#">{t('footer.mobilePhone', 'Mobile Phone')}</a>
              </div>
              <div className="footer-column">
                <a href="#">{t('footer.communityPolicies', 'Policies for the Professional Community')}</a>
                <a href="#">{t('footer.salesSolutions', 'Sales Solutions')}</a>
                <a href="#">{t('footer.advertisingSolutions', 'Advertising Solutions')}</a>
              </div>
            </div>

            <div className="footer-right">
              <div className="footer-info">
                <div className="info-item">
                  <HelpCircle size={16} />
                  <div>
                    <strong>{t('footer.questionTitle', 'Question?')}</strong>
                    <span>{t('footer.questionText', 'Visit our Help Center.')}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Shield size={16} />
                  <div>
                    <strong>{t('footer.privacyTitle', 'Manage Account and Privacy')}</strong>
                    <span>{t('footer.privacyText', 'Go to settings.')}</span>
                  </div>
                </div>
                <div className="info-item">
                  <AlertCircle size={16} />
                  <div>
                    <strong>{t('footer.recommendTitle', 'Recommendation Transparency')}</strong>
                    <span>{t('footer.recommendText', 'Learn more about recommended content.')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
