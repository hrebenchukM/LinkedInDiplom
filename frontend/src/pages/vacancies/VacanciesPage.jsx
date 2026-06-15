import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import VacanciesSidebar from '../../features/VacanciesSidebar/VacanciesSidebar';
import VacancyCard from '../../features/VacancyCard/VacancyCard';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AppContext from '../../features/appContext/AppContext';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config';
import { getErrorMessage, getUserFriendlyErrorMessage, isValidationError } from '../../shared/lib/apiError';
import {
  addVacancyToFavorites,
  applyToVacancy,
  getMyFavoriteVacancies,
  getVacancies,
  loadVacancyMeta,
  removeVacancyFromFavorites,
} from '../../features/jobs/jobsApi';
import { enrichVacanciesWithCompanies } from '../../features/jobs/enrichJobsWithCompanies';
import {
  applyClientSideVacancyFilters,
  mapFiltersToVacancyQuery,
} from '../../features/jobs/mapJobs';

import './VacanciesPage.css';

function formatPosted(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

  return date.toLocaleDateString();
}

const VacanciesPage = ({ onNavigate }) => {
  const { profile } = useContext(AppContext);

  const [vacancies, setVacancies] = useState([]);
  const [filters, setFilters] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [appliedIds, setAppliedIds] = useState(() => new Set());
  const [actionErrors, setActionErrors] = useState({});
  const [viewMode, setViewMode] = useState('all');
  const [initialized, setInitialized] = useState(false);

  const profileTitle =
    profile?.user?.profileTitle ||
    profile?.user?.headline ||
    '';

  const normalizedTitle = profileTitle.toLowerCase();

  const loadVacancies = useCallback(async ({
    pageToLoad = 1,
    append = false,
    nextSearch = searchQuery,
    nextFilters = filters,
    nextFavoriteIds = favoriteIds,
    nextAppliedIds = appliedIds,
    mode = viewMode,
  } = {}) => {
    if (pageToLoad === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');

    try {
      if (mode === 'saved') {
        const favorites = await getMyFavoriteVacancies();
        const favoriteItems = favorites
          .map((item) => item.vacancy)
          .filter(Boolean)
          .map((vacancy) => ({
            ...vacancy,
            isFavorite: true,
            hasApplied: nextAppliedIds.has(vacancy.id),
          }));

        const enriched = await enrichVacanciesWithCompanies(favoriteItems);
        setVacancies(enriched);
        setPage(1);
        setHasNextPage(false);
        return;
      }

      const backendFilters = mapFiltersToVacancyQuery(nextFilters ?? {}, nextSearch);
      const response = await getVacancies({
        page: pageToLoad,
        pageSize: DEFAULT_PAGE_SIZE,
        ...backendFilters,
        favoriteIds: nextFavoriteIds,
        appliedIds: nextAppliedIds,
      });

      const enriched = await enrichVacanciesWithCompanies(response.items);

      setVacancies((prev) => (append ? [...prev, ...enriched] : enriched));
      setPage(response.page);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      console.warn('Vacancies load error:', err);
      setError(getUserFriendlyErrorMessage(err));

      if (isValidationError(err) && (nextFilters || nextSearch)) {
        try {
          const response = await getVacancies({
            page: pageToLoad,
            pageSize: DEFAULT_PAGE_SIZE,
            favoriteIds: nextFavoriteIds,
            appliedIds: nextAppliedIds,
          });
          const enriched = await enrichVacanciesWithCompanies(response.items);
          setVacancies((prev) => (append ? [...prev, ...enriched] : enriched));
          setPage(response.page);
          setHasNextPage(response.hasNextPage);
          setError('');
          return;
        } catch (retryError) {
          console.warn('Vacancies retry without filters failed:', retryError);
        }
      }

      if (!append) {
        setVacancies([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [appliedIds, favoriteIds, filters, searchQuery, viewMode]);

  const reloadVacancies = useCallback(async () => {
    const meta = await loadVacancyMeta();
    setFavoriteIds(meta.favoriteIds);
    setAppliedIds(meta.appliedIds);
    await loadVacancies({
      pageToLoad: 1,
      append: false,
      nextFavoriteIds: meta.favoriteIds,
      nextAppliedIds: meta.appliedIds,
    });
  }, [loadVacancies]);

  useEffect(() => {
    reloadVacancies().finally(() => setInitialized(true));
  }, []);

  useEffect(() => {
    if (!initialized) return undefined;

    const timeout = setTimeout(() => {
      loadVacancies({
        pageToLoad: 1,
        append: false,
        nextSearch: searchQuery,
        nextFilters: filters,
        mode: viewMode,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, filters, initialized, viewMode]);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    setPage(1);
  };

  const visibleVacancies = useMemo(
    () => applyClientSideVacancyFilters(vacancies, filters),
    [vacancies, filters],
  );

  const recommendedVacancies = useMemo(() => {
    if (!profileTitle) {
      return vacancies.slice(0, 5);
    }

    const matched = vacancies.filter((vacancy) =>
      vacancy.title?.toLowerCase().includes(normalizedTitle),
    );

    return matched.length > 0 ? matched : vacancies.slice(0, 5);
  }, [vacancies, profileTitle, normalizedTitle]);

  const handleApplyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleSearchQuery = (query) => {
    setSearchQuery(query ?? '');
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!hasNextPage || loadingMore) return;
    loadVacancies({ pageToLoad: page + 1, append: true });
  };

  const handleApply = async (vacancyId) => {
    setActionErrors((prev) => ({ ...prev, [vacancyId]: '' }));

    const previousApplied = appliedIds.has(vacancyId);
    const nextAppliedIds = new Set(appliedIds);
    nextAppliedIds.add(vacancyId);
    setAppliedIds(nextAppliedIds);
    setVacancies((prev) =>
      prev.map((vacancy) =>
        vacancy.id === vacancyId ? { ...vacancy, hasApplied: true } : vacancy,
      ),
    );

    try {
      await applyToVacancy(vacancyId);
    } catch (err) {
      const nextRollback = new Set(appliedIds);
      if (!previousApplied) {
        nextRollback.delete(vacancyId);
      }
      setAppliedIds(nextRollback);
      setVacancies((prev) =>
        prev.map((vacancy) =>
          vacancy.id === vacancyId ? { ...vacancy, hasApplied: previousApplied } : vacancy,
        ),
      );
      setActionErrors((prev) => ({
        ...prev,
        [vacancyId]: getErrorMessage(err),
      }));
    }
  };

  const handleToggleFavorite = async (vacancyId, isFavorite) => {
    setActionErrors((prev) => ({ ...prev, [`fav-${vacancyId}`]: '' }));

    const nextFavoriteIds = new Set(favoriteIds);
    if (isFavorite) {
      nextFavoriteIds.delete(vacancyId);
    } else {
      nextFavoriteIds.add(vacancyId);
    }
    setFavoriteIds(nextFavoriteIds);
    setVacancies((prev) =>
      prev.map((vacancy) =>
        vacancy.id === vacancyId ? { ...vacancy, isFavorite: !isFavorite } : vacancy,
      ),
    );

    try {
      if (isFavorite) {
        await removeVacancyFromFavorites(vacancyId);
        if (viewMode === 'saved') {
          setVacancies((prev) => prev.filter((vacancy) => vacancy.id !== vacancyId));
        }
      } else {
        await addVacancyToFavorites(vacancyId);
      }
    } catch (err) {
      setFavoriteIds(favoriteIds);
      setVacancies((prev) =>
        prev.map((vacancy) =>
          vacancy.id === vacancyId ? { ...vacancy, isFavorite } : vacancy,
        ),
      );
      setActionErrors((prev) => ({
        ...prev,
        [`fav-${vacancyId}`]: getErrorMessage(err),
      }));
    }
  };

  const clientSideLimitations = filters && (
    (Array.isArray(filters.location) && filters.location.length > 1)
    || (Array.isArray(filters.jobType) && filters.jobType.length > 1)
    || (Array.isArray(filters.experienceLevel) && filters.experienceLevel.length > 0)
    || (Array.isArray(filters.salaryRange)
      && (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 300000))
  );

  return (
    <main className="main-content">
      <div className="container">
        <div className="vacancies-grid">

          <aside className="vacancies-sidebar">
            <VacanciesSidebar
              onApplyFilters={handleApplyFilters}
              onPosted={reloadVacancies}
              onSearchQuery={handleSearchQuery}
              onViewChange={handleViewChange}
              activeView={viewMode}
            />
          </aside>

          <section className="vacancies-main">

            <div className="vacancies-section">
              <div className="section-header">
                <h2 className="section-title">
                  {viewMode === 'saved' ? 'My saved vacancies' : 'Selection of the best vacancies'}
                </h2>
                <p className="section-subtitle">
                  {viewMode === 'saved'
                    ? 'Vacancies you saved for later'
                    : 'Based on your profile and activity'}
                </p>
                <div className="vacancies-search-bar">
                  <input
                    type="search"
                    className="vacancies-search-input"
                    placeholder="Search vacancies..."
                    value={searchQuery}
                    onChange={(event) => handleSearchQuery(event.target.value)}
                  />
                </div>
                {clientSideLimitations && (
                  <p className="section-subtitle vacancies-limitation-note">
                    Some filters are applied on the current page only (salary, experience, multi-select).
                  </p>
                )}
              </div>

              {error && <div className="vacancies-error">{error}</div>}

              <div className="vacancies-list">
                {loading && <div className="vacancies-loading">Loading...</div>}

                {!loading && visibleVacancies.length === 0 && (
                  <div className="vacancies-empty">No vacancies yet</div>
                )}

                {!loading && visibleVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id}
                    vacancy={vacancy}
                    posted={formatPosted(vacancy.postedAt ?? vacancy.createdAt)}
                    onApply={handleApply}
                    onToggleFavorite={handleToggleFavorite}
                    actionError={actionErrors[vacancy.id]}
                    favoriteError={actionErrors[`fav-${vacancy.id}`]}
                  />
                ))}
              </div>

              {!loading && hasNextPage && viewMode !== 'saved' && (
                <button
                  type="button"
                  className="show-all-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              )}
            </div>

            <div className="vacancies-section">
              <div className="section-header">
                <h3 className="section-title-job">
                  {profileTitle || 'Recommended jobs'}
                </h3>
                {profileTitle && (
                  <p className="section-location">
                    Based on your profile title
                  </p>
                )}
              </div>

              <div className="job-list">
                {recommendedVacancies.map((vacancy) => (
                  <div key={vacancy.id} className="job-item">
                    <div className="job-info">
                      <img
                        src={getAssetUrl(vacancy.companyLogo, IMAGE_PLACEHOLDERS.company)}
                        alt={vacancy.companyName}
                        className="job-logo"
                      />
                      <div className="job-details">
                        <h4 className="job-company">{vacancy.companyName}</h4>
                        <p className="job-location">{vacancy.location}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="dismiss-btn"
                      onClick={() => handleSearchQuery(vacancy.title)}
                      aria-label={`Search ${vacancy.title}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </section>

          <aside className="vacancies-messages">
            <MessagesPanel onNavigate={onNavigate} />
          </aside>

        </div>
      </div>
    </main>
  );
};

export default VacanciesPage;
