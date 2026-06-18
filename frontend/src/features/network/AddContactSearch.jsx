import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { searchProfiles } from '../profile/profileApi.js';
import { sendContactRequest } from './networkApi.js';
import { getDisplayName } from '../profile/mapProfile.js';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import SafeImage from '../../shared/ui/SafeImage';
import './AddContactSearch.css';

const AddContactSearch = ({ currentUserId, onContactAdded, compact = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const profiles = await searchProfiles({
          query: query.trim(),
          pageSize: 8,
        });

        if (cancelled) return;

        setResults(
          profiles
            .filter((profile) => profile.userId && profile.userId !== currentUserId)
            .map((profile) => ({
              userId: profile.userId,
              name: profile.displayName || getDisplayName({ user: profile }),
              title: profile.headline ?? profile.profileTitle ?? '',
              avatarUrl: profile.avatarUrl,
            })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, currentUserId]);

  const handleAdd = async (person) => {
    if (!person?.userId || submittingId) return;

    setSubmittingId(person.userId);
    setError('');
    setSuccess('');

    try {
      await sendContactRequest(person.userId);
      setSuccess(t('network.addContact.sent', 'Contact request sent'));
      onContactAdded?.(person.userId);
      setResults((prev) => prev.filter((item) => item.userId !== person.userId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className={`add-contact-search${compact ? ' add-contact-search--compact' : ''}`}>
      {!compact ? (
        <h3 className="add-contact-search__title">
          {t('network.addContact.title', 'Add contacts')}
        </h3>
      ) : null}
      <p className="add-contact-search__hint">
        {t(
          'network.addContact.hint',
          'Find people to connect with — you can message them and share posts from your feed.',
        )}
      </p>
      <input
        type="search"
        className="add-contact-search__input"
        placeholder={t('network.addContact.placeholder', 'Search people by name…')}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={t('network.addContact.placeholder', 'Search people by name…')}
      />

      {error ? <p className="auth-field-error">{error}</p> : null}
      {success ? <p className="add-contact-search__success">{success}</p> : null}

      {loading ? (
        <p className="add-contact-search__status">{t('common.searching', 'Searching...')}</p>
      ) : null}

      {!loading && query.trim() && results.length === 0 ? (
        <p className="add-contact-search__status">
          {t('network.addContact.noResults', 'No people found')}
        </p>
      ) : null}

      <ul className="add-contact-search__list">
        {results.map((person) => (
          <li key={person.userId} className="add-contact-search__item">
            <SafeImage
              src={person.avatarUrl}
              fallback={IMAGE_PLACEHOLDERS.avatar}
              alt={person.name}
              className="add-contact-search__avatar"
              onClick={() => navigate(`/app/profile/${person.userId}`)}
              style={{ cursor: 'pointer' }}
            />
            <div
              className="add-contact-search__info"
              onClick={() => navigate(`/app/profile/${person.userId}`)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/app/profile/${person.userId}`);
                }
              }}
            >
              <strong>{person.name}</strong>
              {person.title ? <span>{person.title}</span> : null}
            </div>
            <button
              type="button"
              className="add-contact-search__btn"
              onClick={(event) => {
                event.stopPropagation();
                handleAdd(person);
              }}
              disabled={submittingId === person.userId}
            >
              <UserPlus size={16} />
              {submittingId === person.userId
                ? t('network.connect.sending', 'Sending...')
                : t('network.addContact.action', 'Add')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddContactSearch;
