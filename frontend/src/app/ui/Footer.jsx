import React from 'react';
import { HelpCircle, Shield, AlertCircle } from 'lucide-react';
import './Footer.css';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-links">
              <div className="footer-column">
                <a href="#">General information</a>
                <a href="#">Careers</a>
                <a href="#">Ad Settings</a>
                <a href="#">Security Center</a>
              </div>
              <div className="footer-column">
                <a href="#">Accessibility</a>
                <a href="#">Privacy and Terms</a>
                <a href="#">Mobile Phone</a>
              </div>
              <div className="footer-column">
                <a href="#">Policies for the Professional Community</a>
                <a href="#">Sales Solutions</a>
                <a href="#">Advertising Solutions</a>
              </div>
            </div>

            <div className="footer-right">
              <div className="footer-info">
                <div className="info-item">
                  <HelpCircle size={20} />
                  <div>
                    <strong>Question?</strong>
                    <span>Visit our Help Center.</span>
                  </div>
                </div>
                <div className="info-item">
                  <Shield size={20} />
                  <div>
                    <strong>Manage Account and Privacy</strong>
                    <span>Go to settings.</span>
                  </div>
                </div>
                <div className="info-item">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Recommendation Transparency</strong>
                    <span>Learn more about recommended content.</span>
                  </div>
                </div>
              </div>

              <div className="footer-language">
                <label>Language</label>
                <select className="language-select">
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
