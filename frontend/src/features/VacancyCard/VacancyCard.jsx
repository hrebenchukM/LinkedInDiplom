import React from 'react';
import { X } from 'lucide-react';
import '../VacancyCard/VacancyCard.css';

const VacancyCard = ({
  company,
  logo,
  position,
  location,
  salary,
  posted,
  status
}) => {
  return (
    <div className="vacancy-card">
      <div className="vacancy-header">
        <div className="vacancy-top">
          <img src={logo} alt={company} className="vacancy-logo" />
          <h3 className="vacancy-company">{company}</h3>
        </div>
        <button className="vacancy-dismiss">
          <X size={20} />
        </button>
      </div>

      <div className="vacancy-details">
        <h4 className="vacancy-position">{position}</h4>
        {location && <p className="vacancy-location">{location}</p>}
        <p className="vacancy-salary">{salary}</p>
      </div>

      <div className="vacancy-footer">
        <span className="vacancy-posted">{posted}</span>
        <span className="vacancy-separator">•</span>
        <a href="#" className="vacancy-status">{status}</a>
      </div>
    </div>
  );
};

export default VacancyCard;
