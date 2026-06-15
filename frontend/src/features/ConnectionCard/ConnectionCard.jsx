import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConnectionCard.css';
import {
  acceptContactRequest,
  cancelContactRequest,
  followUser,
  rejectContactRequest,
  removeContact,
  sendContactRequest,
  unfollowUser,
} from '../network/networkApi.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

const ConnectionCard = ({
  userId,
  contactId,
  name,
  title,
  avatar,
  cardType = 'suggestion',
  onActionComplete,
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(cardType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(cardType);
    setError('');
  }, [cardType, contactId, userId]);

  const runAction = async (action) => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await action();
      onActionComplete?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () =>
    runAction(async () => {
      await sendContactRequest(userId);
      setStatus('outgoing');
    });

  const handleAccept = () =>
    runAction(async () => {
      await acceptContactRequest(contactId);
      setStatus('contact');
    });

  const handleReject = () =>
    runAction(async () => {
      await rejectContactRequest(contactId);
      setStatus('rejected');
    });

  const handleCancel = () =>
    runAction(async () => {
      await cancelContactRequest(contactId);
      setStatus('suggestion');
    });

  const handleRemove = () =>
    runAction(async () => {
      await removeContact(contactId);
      setStatus('removed');
    });

  const handleFollow = () =>
    runAction(async () => {
      await followUser(userId);
      setStatus('following');
    });

  const handleUnfollow = () =>
    runAction(async () => {
      await unfollowUser(userId);
      setStatus('unfollowed');
    });

  if (status === 'removed' || status === 'rejected' || status === 'unfollowed') {
    return null;
  }

  return (
    <div className="connection-card">
      <img
        src={avatar || '/img/avatar-placeholder.png'}
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

      {error ? <p className="auth-field-error">{error}</p> : null}

      {status === 'suggestion' && (
        <button
          type="button"
          className="make-contact-btn"
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Connect'}
        </button>
      )}

      {status === 'incoming' && (
        <div className="connection-actions-row">
          <button
            type="button"
            className="make-contact-btn"
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? '...' : 'Accept'}
          </button>
          <button
            type="button"
            className="make-contact-btn pending"
            onClick={handleReject}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      )}

      {status === 'outgoing' && (
        <button
          type="button"
          className="make-contact-btn pending"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? '...' : 'Pending · Cancel'}
        </button>
      )}

      {status === 'contact' && (
        <button
          type="button"
          className="make-contact-btn pending"
          onClick={handleRemove}
          disabled={loading}
        >
          {loading ? '...' : 'Connected · Remove'}
        </button>
      )}

      {status === 'following' && (
        <button
          type="button"
          className="make-contact-btn pending"
          onClick={handleUnfollow}
          disabled={loading}
        >
          {loading ? '...' : 'Following · Unfollow'}
        </button>
      )}

      {status === 'follow' && (
        <button
          type="button"
          className="make-contact-btn"
          onClick={handleFollow}
          disabled={loading}
        >
          {loading ? '...' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default ConnectionCard;
