import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchProfiles } from '../../features/profile/profileApi.js';
import { getDisplayName } from '../../features/profile/mapProfile.js';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { useTranslation } from '../i18n/LocaleContext.jsx';
import './HeaderSearch.css';

export default function HeaderSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const runSearch = useCallback(async (value) => {
    const text = value.trim();
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const items = await searchProfiles({ query: text, pageSize: 8 });
      setResults(Array.isArray(items) ? items : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, runSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (userId) => {
    if (!userId) return;
    setOpen(false);
    setQuery('');
    setResults([]);
    navigate(`/app/profile/${userId}`);
  };

  return (
    <div className="header-search" ref={wrapRef}>
      <Search size={18} className="header-search-icon" />
      <input
        type="search"
        placeholder={t('nav.searchPlaceholder', 'Search people')}
        className="header-search-input"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && query.trim().length >= 2 && (
        <div className="header-search-dropdown">
          {loading && <div className="header-search-empty">{t('nav.searchLoading', 'Searching...')}</div>}
          {!loading && results.length === 0 && (
            <div className="header-search-empty">{t('nav.searchEmpty', 'No people found')}</div>
          )}
          {!loading && results.map((profile) => {
            const userId = profile.userId ?? profile.id;
            const name = profile.displayName || getDisplayName(profile);
            return (
              <button
                key={userId}
                type="button"
                className="header-search-item"
                onClick={() => handleSelect(userId)}
              >
                <img
                  src={getAssetUrl(profile.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                  alt=""
                  className="header-search-avatar"
                />
                <div className="header-search-item-text">
                  <span className="header-search-name">{name}</span>
                  {profile.headline ? (
                    <span className="header-search-headline">{profile.headline}</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
