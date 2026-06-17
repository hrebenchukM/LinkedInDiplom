import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import VacanciesSidebar from '../../features/VacanciesSidebar/VacanciesSidebar';
import VacancyCard from '../../features/VacancyCard/VacancyCard';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { fetchRecommendedJobs } from '../../features/ai/aiApi.js';
import { useTranslation, getDateLocale } from '../../app/i18n/LocaleContext.jsx';
import {
  applyClientSideVacancyFilters,
  mapFiltersToVacancyQuery,
  recommendVacanciesForProfile,
  vacancyMatchesProfileSkills,
} from '../../features/jobs/mapJobs';
import { getMySkills } from '../../features/professional/professionalApi';
import VacancyDetailModal from '../../features/Modals/VacancyDetailModal.jsx';

import './VacanciesPage.css';

const VacanciesPage = ({ onNavigate }) => {
  const { profile } = useContext(AppContext);
  const { t, locale } = useTranslation();
  const dateLocale = getDateLocale(locale);

  const formatPosted = useCallback((dateStr) => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';

    const diffMs = Date.now() - date.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) return t('vac.posted.today', 'Today');
    if (days === 1) return t('vac.posted.oneDay', '1 day ago');
    if (days < 7) return t('vac.posted.days', '{n} days ago', { n: days });
    if (days < 30) {
      return t('vac.posted.weeks', '{n} weeks ago', { n: Math.floor(days / 7) });
    }

    return date.toLocaleDateString(dateLocale);
  }, [t, dateLocale]);

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
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [detailVacancy, setDetailVacancy] = useState(null);
  const [applyingRecommendedId, setApplyingRecommendedId] = useState(null);
  const vacancyCardRefs = useRef({});

  const profileTitle =
    profile?.user?.profileTitle ||
    profile?.user?.headline ||
    '';

  useEffect(() => {
    fetchRecommendedJobs()
      .then(setAiRecommendations)
      .catch(() => setAiRecommendations([]));
  }, []);

  useEffect(() => {
    getMySkills()
      .then(setUserSkills)
      .catch(() => setUserSkills([]));
  }, []);

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
          const retryQuery = mapFiltersToVacancyQuery({}, nextSearch);
          const response = await getVacancies({
            page: pageToLoad,
            pageSize: DEFAULT_PAGE_SIZE,
            ...retryQuery,
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

  const visibleVacancies = useMemo(() => {
    if (searchQuery.trim()) {
      return vacancies;
    }

    return applyClientSideVacancyFilters(vacancies, filters);
  }, [vacancies, filters, searchQuery]);

  const userSkillNames = useMemo(
    () => userSkills.map((item) => item.skill?.name).filter(Boolean),
    [userSkills],
  );

  const skillMatchedVacancies = useMemo(
    () => recommendVacanciesForProfile(
      vacancies,
      { skillNames: userSkillNames, profileTitle },
      5,
    ),
    [vacancies, userSkillNames, profileTitle],
  );

  const recommendedVacancies = useMemo(() => {
    const realCards = skillMatchedVacancies.map((vacancy) => ({
      ...vacancy,
      companyName: vacancy.companyName ?? vacancy.company?.name ?? 'Company',
      companyLogo: vacancy.companyLogo ?? vacancy.company?.logo ?? '',
      location: vacancy.location || vacancy.schedule || '',
      aiRecommendation: false,
      hasApplied: appliedIds.has(vacancy.id) || vacancy.hasApplied,
    }));

    const matchedTitles = new Set(realCards.map((item) => item.title?.toLowerCase()));
    const aiExtras = aiRecommendations
      .filter((item) => !matchedTitles.has(item.title?.toLowerCase()))
      .slice(0, Math.max(0, 5 - realCards.length))
      .map((item) => ({
        ...item,
        companyName: item.company || 'LinkUp AI',
        companyLogo: '',
        location: item.desc || item.tags?.join(' · ') || t('vac.personalizedMatch', 'Personalized match'),
        description: item.desc || '',
        aiRecommendation: true,
        hasApplied: false,
      }));

    return [...realCards, ...aiExtras];
  }, [skillMatchedVacancies, aiRecommendations, appliedIds, t]);

  const hasSkillBasedMatches = useMemo(
    () => userSkillNames.length > 0
      && vacancies.some((vacancy) => vacancyMatchesProfileSkills(vacancy, userSkillNames)),
    [vacancies, userSkillNames],
  );

  const recommendedSubtitle = useMemo(() => {
    if (hasSkillBasedMatches) {
      return t('vac.skillsBased', 'Based on your skills: {skills}', {
        skills: userSkillNames.join(', '),
      });
    }
    if (aiRecommendations.length > 0) {
      return t('vac.aiPersonalized', 'Personalized by your profile');
    }
    if (profileTitle) {
      return t('vac.profileBased', 'Based on your profile title');
    }
    return t('vac.popularPicks', 'Popular vacancies you may like');
  }, [hasSkillBasedMatches, userSkillNames, aiRecommendations.length, profileTitle, t]);

  const handleApplyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleSearchQuery = (query) => {
    setSearchQuery(query ?? '');
    setPage(1);
    if (viewMode === 'saved') {
      setViewMode('all');
    }
  };

  const handleLoadMore = () => {
    if (!hasNextPage || loadingMore) return;
    loadVacancies({ pageToLoad: page + 1, append: true });
  };

  const handleOpenRecommendedDetails = (vacancy) => {
    setDetailVacancy(vacancy);

    if (!vacancy.aiRecommendation && vacancy.id) {
      vacancyCardRefs.current[vacancy.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleRecommendedApply = async (vacancy) => {
    if (vacancy.aiRecommendation) {
      handleSearchQuery(vacancy.title);
      setDetailVacancy(null);
      return;
    }

    if (!vacancy.id || appliedIds.has(vacancy.id)) return;

    setApplyingRecommendedId(vacancy.id);
    try {
      await handleApply(vacancy.id);
    } finally {
      setApplyingRecommendedId(null);
    }
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
                  {viewMode === 'saved'
                    ? t('vac.page.savedTitle', 'My saved vacancies')
                    : t('vac.page.allTitle', 'Selection of the best vacancies')}
                </h2>
                <p className="section-subtitle">
                  {viewMode === 'saved'
                    ? t('vac.page.savedSubtitle', 'Vacancies you saved for later')
                    : t('vac.page.allSubtitle', 'Based on your profile and activity')}
                </p>
                <div className="vacancies-search-bar">
                  <input
                    type="search"
                    className="vacancies-search-input"
                    placeholder={t('vac.searchPlaceholder', 'Search vacancies...')}
                    value={searchQuery}
                    onChange={(event) => handleSearchQuery(event.target.value)}
                  />
                </div>
                {clientSideLimitations ? (
                  <p className="section-subtitle vacancies-limitation-note">
                    {t(
                      'vac.filtersLimitNote',
                      'Some filters are applied on the current page only (salary, experience, multi-select).',
                    )}
                  </p>
                ) : null}
              </div>

              {error && <div className="vacancies-error">{error}</div>}

              <div
                className={`vacancies-list${
                  loading && vacancies.length === 0 ? ' vacancies-list--initial' : ''
                }${loading && vacancies.length > 0 ? ' vacancies-list--refreshing' : ''}`}
              >
                {loading && vacancies.length === 0 ? (
                  <div className="vacancies-skeleton" aria-hidden="true">
                    <div className="vacancies-skeleton__item" />
                    <div className="vacancies-skeleton__item" />
                    <div className="vacancies-skeleton__item" />
                  </div>
                ) : null}

                {!loading && visibleVacancies.length === 0 ? (
                  <div className="vacancies-empty">{t('vac.empty', 'No vacancies yet')}</div>
                ) : null}

                {visibleVacancies.map((vacancy) => (
                  <div
                    key={vacancy.id}
                    ref={(element) => {
                      if (element) vacancyCardRefs.current[vacancy.id] = element;
                    }}
                    className={
                      detailVacancy?.id === vacancy.id ? 'vacancy-card-wrap is-highlighted' : 'vacancy-card-wrap'
                    }
                  >
                    <VacancyCard
                      vacancy={vacancy}
                      posted={formatPosted(vacancy.postedAt ?? vacancy.createdAt)}
                      onApply={handleApply}
                      onToggleFavorite={handleToggleFavorite}
                      actionError={actionErrors[vacancy.id]}
                      favoriteError={actionErrors[`fav-${vacancy.id}`]}
                    />
                  </div>
                ))}
              </div>

              {!loading && hasNextPage && viewMode !== 'saved' && (
                <button
                  type="button"
                  className="show-all-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore
                    ? t('vac.loading', 'Loading...')
                    : t('vac.loadMore', 'Load more')}
                </button>
              )}
            </div>

            <div className="vacancies-section">
              <div className="section-header">
                <h3 className="section-title-job">
                  {hasSkillBasedMatches
                    ? t('vac.recommended', 'Recommended jobs')
                    : aiRecommendations.length > 0
                      ? t('vac.aiRecommended', 'AI recommended for you')
                      : profileTitle || t('vac.recommended', 'Recommended jobs')}
                </h3>
                {recommendedSubtitle ? (
                  <p className="section-location">{recommendedSubtitle}</p>
                ) : null}
              </div>

              <div className="job-list">
                {recommendedVacancies.map((vacancy) => {
                  const isApplying = applyingRecommendedId === vacancy.id;
                  const hasApplied = Boolean(vacancy.hasApplied);
                  const applyLabel = hasApplied
                    ? t('vac.card.applied', 'Applied')
                    : vacancy.aiRecommendation
                      ? t('vac.rec.searchSimilar', 'Search similar vacancies')
                      : t('vac.card.apply', 'Be among the candidates');

                  return (
                    <article key={vacancy.id} className="job-item">
                      <button
                        type="button"
                        className="job-item-main"
                        onClick={() => handleOpenRecommendedDetails(vacancy)}
                      >
                        <div className="job-info">
                          <img
                            src={getAssetUrl(vacancy.companyLogo, IMAGE_PLACEHOLDERS.company)}
                            alt={vacancy.companyName}
                            className="job-logo"
                          />
                          <div className="job-details">
                            <h4 className="job-title">{vacancy.title}</h4>
                            <p className="job-company">{vacancy.companyName}</p>
                            {vacancy.location ? (
                              <p className="job-location">{vacancy.location}</p>
                            ) : null}
                          </div>
                        </div>
                      </button>

                      <div className="job-item-actions">
                        <button
                          type="button"
                          className="job-action-btn job-action-btn--secondary"
                          onClick={() => handleOpenRecommendedDetails(vacancy)}
                        >
                          {t('vac.rec.details', 'More details')}
                        </button>
                        <button
                          type="button"
                          className={`job-action-btn job-action-btn--primary${hasApplied ? ' is-applied' : ''}`}
                          onClick={() => handleRecommendedApply(vacancy)}
                          disabled={(!vacancy.aiRecommendation && hasApplied) || isApplying}
                        >
                          {isApplying ? t('vac.card.applying', 'Applying...') : applyLabel}
                        </button>
                        <button
                          type="button"
                          className="dismiss-btn"
                          onClick={() => handleSearchQuery(vacancy.title)}
                          aria-label={t('vac.rec.dismiss', 'Hide recommendation')}
                        >
                          ×
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

          </section>

          <aside className="vacancies-messages">
            <MessagesPanel onNavigate={onNavigate} />
          </aside>

        </div>
      </div>

      <VacancyDetailModal
        isOpen={Boolean(detailVacancy)}
        onClose={() => setDetailVacancy(null)}
        vacancy={
          detailVacancy
            ? {
                ...detailVacancy,
                hasApplied: appliedIds.has(detailVacancy.id) || detailVacancy.hasApplied,
              }
            : null
        }
        posted={
          detailVacancy?.postedAt || detailVacancy?.createdAt
            ? formatPosted(detailVacancy.postedAt ?? detailVacancy.createdAt)
            : ''
        }
        onApply={handleApply}
        onSearchSimilar={(vacancy) => handleSearchQuery(vacancy.title)}
        applying={detailVacancy ? applyingRecommendedId === detailVacancy.id : false}
        applyError={detailVacancy?.id ? actionErrors[detailVacancy.id] : ''}
      />
    </main>
  );
};

export default VacanciesPage;
