import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './ConnectionCard.css';
import SafeImage from '../../shared/ui/SafeImage';
import { IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import {
  acceptContactRequest,
  sendContactRequest,
} from '../network/networkApi.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { debugLog } from '../../shared/lib/debugSession.js';
import { openChatWithUser } from '../network/openChatWithUser.js';

const ConnectionCard = ({
  userId,
  contactId,
  name,
  title,
  avatar,
  cardType = 'suggestion',
  onActionComplete,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(cardType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(cardType);
    setError('');
  }, [cardType, contactId, userId]);

  const handleWrite = async () => {
    if (loading || !currentUserId) return;

    setLoading(true);
    setError('');

    try {
      // #region agent log
      debugLog(
        'ConnectionCard.jsx:handleWrite',
        'write started',
        { userId: String(userId), status, cardType },
        'D',
      );
      // #endregion
      if (status === 'incoming' && contactId) {
        await acceptContactRequest(contactId);
        setStatus('contact');
      } else if (status === 'suggestion') {
        await sendContactRequest(userId);
        setStatus('outgoing');
      }

      await openChatWithUser({
        targetUserId: userId,
        currentUserId,
        navigate,
      });

      onActionComplete?.();
      // #region agent log
      debugLog('ConnectionCard.jsx:handleWrite', 'write success', { userId: String(userId) }, 'E');
      // #endregion
    } catch (err) {
      // #region agent log
      debugLog(
        'ConnectionCard.jsx:handleWrite',
        'write failed',
        { userId: String(userId), error: getErrorMessage(err) },
        'B',
      );
      // #endregion
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'rejected' || status === 'unfollowed') {
    return null;
  }

  return (
    <div className="connection-card">
      <SafeImage
        src={avatar}
        fallback={IMAGE_PLACEHOLDERS.avatar}
        alt={name}
        className="connection-avatar"
        onClick={() => navigate(`/app/profile/${userId}`)}
        style={{ cursor: 'pointer' }}
      />

      <h3
        className="connection-name"
        onClick={() => navigate(`/app/profile/${userId}`)}
        style={{ cursor: 'pointer' }}
      >
        {name}
      </h3>

      <p className="connection-title">{title}</p>

      {error ? <p className="auth-field-error">{error}</p> : null}

      <button
        type="button"
        className="make-contact-btn"
        onClick={handleWrite}
        disabled={loading || !currentUserId}
      >
        {loading ? '...' : t('network.contact.message', 'Message')}
      </button>
    </div>
  );
};

export default ConnectionCard;
