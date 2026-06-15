import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../appContext/AppContext';
import './ConnectionCard.css';

const ConnectionCard = ({ userId, name, title, avatar }) => {
  const navigate = useNavigate();
  const { request } = useContext(AppContext);

  const [status, setStatus] = useState('suggested');
  const [loading, setLoading] = useState(false);

  const sendRequest = () => {
    if (loading) return;

    setLoading(true);
    request(`/network/request?userId=${userId}`, { method: 'POST' })
      .then(() => setStatus('pending'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="connection-card">
      <img
        src={avatar || '/avatar-placeholder.png'}
        alt={name}
        className="connection-avatar"
        onClick={() => navigate(`/app/portfolio/${userId}`)}
        style={{ cursor: 'pointer' }}
      />

      <h3
        className="connection-name"
        onClick={() => navigate(`/app/portfolio/${userId}`)}
        style={{ cursor: 'pointer' }}
      >
        {name}
      </h3>

      <p className="connection-title">{title}</p>

      {status === 'suggested' && (
        <button
          className="make-contact-btn"
          onClick={sendRequest}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Connect'}
        </button>
      )}

      {status === 'pending' && (
        <button className="make-contact-btn pending" disabled>
          Pending
        </button>
      )}
    </div>
  );
};

export default ConnectionCard;
