import React, { useEffect, useState } from 'react';
import { searchProfiles } from '../profile/profileApi.js';
import { createDirectChat } from '../messaging/messagingApi.js';
import { getDisplayName } from '../profile/mapProfile.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import Modal from '../../app/ui/Modal';

const NewMessageModal = ({
  isOpen,
  onClose,
  currentUserId,
  onChatCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      setError('');
      return;
    }

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const profiles = await searchProfiles({
          query: searchQuery.trim(),
          pageSize: 10,
        });

        if (!cancelled) {
          setResults(
            profiles
              .filter((profile) => profile.userId !== currentUserId)
              .map((profile) => ({
                userId: profile.userId,
                name: profile.displayName || getDisplayName({ user: profile }),
                title: profile.headline ?? '',
                avatarUrl: profile.avatarUrl,
              })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, searchQuery, currentUserId]);

  const handleSelectUser = async (person) => {
    if (!person?.userId || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const { chat, limitation } = await createDirectChat(
        person.userId,
        currentUserId,
      );

      if (limitation && chat?.members?.length === 1) {
        setError(
          'Chat created, but backend cannot add the other member automatically. Use an existing conversation if available.',
        );
      }

      if (chat?.id) {
        onChatCreated?.(chat.id);
        onClose();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New message">
      <div>
        {error ? <div className="auth-field-error">{error}</div> : null}

        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Search people by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              borderBottom: '1px solid #e5e7eb',
              borderRadius: 0,
              padding: '12px 0',
            }}
          />
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3
            style={{
              fontSize: '16px',
              color: '#9ca3af',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            {loading ? 'Searching...' : 'Results'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!loading && searchQuery && results.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No users found</p>
            ) : null}

            {results.map((person) => (
              <button
                key={person.userId}
                type="button"
                onClick={() => handleSelectUser(person)}
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <img
                  src={getAssetUrl(person.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                  alt={person.name}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '4px',
                      color: '#1f2937',
                    }}
                  >
                    {person.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {person.title || '—'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NewMessageModal;
