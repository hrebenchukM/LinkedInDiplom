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
  findApplicationIdByVacancyId,
  getMyFavoriteVacancies,
  getVacancies,
  loadVacancyMeta,
  normalizeVacancyId,
  removeVacancyFromFavorites,
  withdrawApplication,
} from '../../features/jobs/jobsApi';
import { enrichVacanciesWithCompanies } from '../../features/jobs/enrichJobsWithCompanies';
import { fetchRecommendedJobs } from '../../features/ai/aiApi.js';
import { useTranslation, getDateLocale } from '../../app/i18n/LocaleContext.jsx';
import {
  applyClientSideVacancyFilters,
  isOwnVacancy,
  mapFiltersToVacancyQuery,
  recommendVacanciesForProfile,
  vacancyMatchesProfileSkills,
} from '../../features/jobs/mapJobs';
import { getMySkills } from '../../features/professional/professionalApi';
import VacancyDetailModal from '../../features/Modals/VacancyDetailModal.jsx';

import './VacanciesPage.css';

function isApplicationAlreadyExistsError(err) {
  const msg = getErrorMessage(err).toLowerCase();
  return msg.includes('application already exists');
}

function isOwnVacancyError(err) {
  const msg = getErrorMessage(err).toLowerCase();
  return msg.includes('cannot apply to your own') || msg.includes('your own vacancy');
}

function vacancyHasApplied(appliedIds, vacancyId) {
  const norm = normalizeVacancyId(vacancyId);
  return norm ? appliedIds.has(norm) : false;
}

const VacanciesPage = ({ onNavigate }) => {
  const { profile, account, user } = useContext(AppContext);
  const { t, locale } = useTranslation();
  const dateLocale = getDateLocale(locale);

  const currentUserId = useMemo(
    () => account?.id ?? user?.id ?? profile?.userId ?? profile?.user?.id ?? null,
    [account?.id, user?.id, profile?.userId, profile?.user?.id],
  );

  const enrichVacancyForUi = useCallback((vacancy) => {
    if (!vacancy) return vacancy;
    return {
      ...vacancy,
      isOwn: isOwnVacancy(vacancy, currentUserId),
    };
  }, [currentUserId]);

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
  const [applicationIdsByVacancyId, setApplicationIdsByVacancyId] = useState(() => new Map());
  const [actionErrors, setActionErrors] = useState({});
  const [viewMode, setViewMode] = useState('all');
  const [initialized, setInitialized] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [detailVacancy, setDetailVacancy] = useState(null);
  const [applyingIds, setApplyingIds] = useState(() => new Set());
  const [withdrawingIds, setWithdrawingIds] = useState(() => new Set());
  const vacancyCardRefs = useRef({});
  const skipFilterReloadRef = useRef(true);

  const applyMetaState = useCallback((meta) => {
    setFavoriteIds(meta.favoriteIds);
    setAppliedIds(meta.appliedIds);
    setApplicationIdsByVacancyId(meta.applicationIdsByVacancyId);
  }, []);

  const updateVacancyAppliedInList = useCallback((vacancyId, hasApplied) => {
    const norm = normalizeVacancyId(vacancyId);
    if (!norm) return;
    setVacancies((prev) =>
      prev.map((vacancy) =>
        (normalizeVacancyId(vacancy.id) === norm ? { ...vacancy, hasApplied } : vacancy),
      ),
    );
  }, []);

  const clearActionError = useCallback((vacancyId) => {
    const norm = normalizeVacancyId(vacancyId);
    if (!norm) return;
    setActionErrors((prev) => {
      if (!prev[norm]) return prev;
      const next = { ...prev };
      delete next[norm];
      return next;
    });
  }, []);

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
            hasApplied: vacancyHasApplied(nextAppliedIds, vacancy.id),
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
    applyMetaState(meta);
    await loadVacancies({
      pageToLoad: 1,
      append: false,
      nextFavoriteIds: meta.favoriteIds,
      nextAppliedIds: meta.appliedIds,
    });
  }, [applyMetaState, loadVacancies]);

  useEffect(() => {
    reloadVacancies().finally(() => setInitialized(true));
  }, []);

  useEffect(() => {
    if (!initialized) return undefined;

    if (skipFilterReloadRef.current) {
      skipFilterReloadRef.current = false;
      return undefined;
    }

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
  }, [searchQuery, filters, initialized, viewMode, loadVacancies]);

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

  const vacanciesForRecommendations = useMemo(
    () => vacancies.filter((vacancy) => !isOwnVacancy(vacancy, currentUserId)),
    [vacancies, currentUserId],
  );

  const skillMatchedVacancies = useMemo(
    () => recommendVacanciesForProfile(
      vacanciesForRecommendations,
      { skillNames: userSkillNames, profileTitle },
      5,
    ),
    [vacanciesForRecommendations, userSkillNames, profileTitle],
  );

  const recommendedVacancies = useMemo(() => {
    const realCards = skillMatchedVacancies
      .filter((vacancy) => !isOwnVacancy(vacancy, currentUserId))
      .map((vacancy) => enrichVacancyForUi({
        ...vacancy,
        companyName: vacancy.companyName ?? vacancy.company?.name ?? 'Company',
        companyLogo: vacancy.companyLogo ?? vacancy.company?.logo ?? '',
        location: vacancy.location || vacancy.schedule || '',
        aiRecommendation: false,
        hasApplied: vacancyHasApplied(appliedIds, vacancy.id) || vacancy.hasApplied,
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
  }, [skillMatchedVacancies, aiRecommendations, appliedIds, currentUserId, enrichVacancyForUi, t]);

  const hasSkillBasedMatches = useMemo(
    () => userSkillNames.length > 0
      && vacanciesForRecommendations.some(
        (vacancy) => vacancyMatchesProfileSkills(vacancy, userSkillNames),
      ),
    [vacanciesForRecommendations, userSkillNames],
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

  const resolveVacancyById = useCallback((vacancyId) => {
    const norm = normalizeVacancyId(vacancyId);
    if (!norm) return null;

    const fromList = vacancies.find((item) => normalizeVacancyId(item.id) === norm);
    if (fromList) return fromList;

    if (detailVacancy && normalizeVacancyId(detailVacancy.id) === norm) {
      return detailVacancy;
    }

    return null;
  }, [vacancies, detailVacancy]);

  const handleRecommendedApply = async (vacancy) => {
    if (vacancy.aiRecommendation) {
      handleSearchQuery(vacancy.title);
      setDetailVacancy(null);
      return;
    }

    if (!vacancy.id || isOwnVacancy(vacancy, currentUserId)) return;
    if (vacancyHasApplied(appliedIds, vacancy.id)) return;
    await handleApply(vacancy.id);
  };

  const handleApply = async (vacancyId) => {
    const normId = normalizeVacancyId(vacancyId);
    if (!normId) return;
    if (applyingIds.has(normId) || withdrawingIds.has(normId)) return;
    if (vacancyHasApplied(appliedIds, vacancyId)) return;

    const vacancy = resolveVacancyById(vacancyId);
    if (isOwnVacancy(vacancy, currentUserId)) {
      return;
    }

    clearActionError(vacancyId);
    setApplyingIds((prev) => new Set(prev).add(normId));

    try {
      const application = await applyToVacancy(vacancyId);

      setAppliedIds((prev) => new Set(prev).add(normId));

      if (application?.id) {
        setApplicationIdsByVacancyId((prev) => {
          const next = new Map(prev);
          next.set(normId, String(application.id));
          return next;
        });
      } else {
        if (import.meta.env.DEV) {
          console.warn('applyToVacancy: response missing application.id, reloading meta');
        }
        const meta = await loadVacancyMeta();
        applyMetaState(meta);
      }

      updateVacancyAppliedInList(vacancyId, true);
    } catch (err) {
      if (isApplicationAlreadyExistsError(err)) {
        const meta = await loadVacancyMeta();
        applyMetaState(meta);
        updateVacancyAppliedInList(vacancyId, vacancyHasApplied(meta.appliedIds, vacancyId));
        return;
      }

      const message = isOwnVacancyError(err)
        ? t('vac.error.ownVacancy', 'You cannot apply to your own vacancy.')
        : getErrorMessage(err);

      setActionErrors((prev) => ({ ...prev, [normId]: message }));
    } finally {
      setApplyingIds((prev) => {
        const next = new Set(prev);
        next.delete(normId);
        return next;
      });
    }
  };

  const handleWithdraw = async (vacancyId) => {
    const normId = normalizeVacancyId(vacancyId);
    if (!normId) return;
    if (applyingIds.has(normId) || withdrawingIds.has(normId)) return;

    clearActionError(vacancyId);

    let applicationId = applicationIdsByVacancyId.get(normId);
    if (!applicationId) {
      applicationId = await findApplicationIdByVacancyId(vacancyId, applicationIdsByVacancyId);
      if (applicationId) {
        setApplicationIdsByVacancyId((prev) => {
          const next = new Map(prev);
          next.set(normId, applicationId);
          return next;
        });
      }
    }

    if (!applicationId) {
      const meta = await loadVacancyMeta();
      applyMetaState(meta);
      applicationId = meta.applicationIdsByVacancyId.get(normId);

      if (!applicationId) {
        setAppliedIds((prev) => {
          const next = new Set(prev);
          next.delete(normId);
          return next;
        });
        updateVacancyAppliedInList(vacancyId, false);
        setActionErrors((prev) => ({
          ...prev,
          [normId]: t(
            'vac.applicationNotFoundRefreshed',
            'Application was not found. The vacancy status has been refreshed.',
          ),
        }));
        return;
      }
    }

    setWithdrawingIds((prev) => new Set(prev).add(normId));

    try {
      await withdrawApplication(applicationId);

      setAppliedIds((prev) => {
        const next = new Set(prev);
        next.delete(normId);
        return next;
      });
      setApplicationIdsByVacancyId((prev) => {
        const next = new Map(prev);
        next.delete(normId);
        return next;
      });
      updateVacancyAppliedInList(vacancyId, false);
      clearActionError(vacancyId);
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [normId]: getErrorMessage(err),
      }));
    } finally {
      setWithdrawingIds((prev) => {
        const next = new Set(prev);
        next.delete(normId);
        return next;
      });
    }
  };

  const handleToggleFavorite = async (vacancyId, isFavorite) => {
    const normId = normalizeVacancyId(vacancyId);
    if (!normId) return;

    setActionErrors((prev) => {
      const favKey = `fav-${normId}`;
      if (!prev[favKey]) return prev;
      const next = { ...prev };
      delete next[favKey];
      return next;
    });

    const nextFavoriteIds = new Set(favoriteIds);
    if (isFavorite) {
      nextFavoriteIds.delete(normId);
    } else {
      nextFavoriteIds.add(normId);
    }
    setFavoriteIds(nextFavoriteIds);
    setVacancies((prev) =>
      prev.map((vacancy) =>
        (normalizeVacancyId(vacancy.id) === normId
          ? { ...vacancy, isFavorite: !isFavorite }
          : vacancy),
      ),
    );

    try {
      if (isFavorite) {
        await removeVacancyFromFavorites(vacancyId);
        if (viewMode === 'saved') {
          setVacancies((prev) =>
            prev.filter((vacancy) => normalizeVacancyId(vacancy.id) !== normId),
          );
        }
      } else {
        await addVacancyToFavorites(vacancyId);
      }
    } catch (err) {
      setFavoriteIds(favoriteIds);
      setVacancies((prev) =>
        prev.map((vacancy) =>
          (normalizeVacancyId(vacancy.id) === normId
            ? { ...vacancy, isFavorite }
            : vacancy),
        ),
      );
      setActionErrors((prev) => ({
        ...prev,
        [`fav-${normId}`]: getErrorMessage(err),
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

                {visibleVacancies.map((vacancy) => {
                  const normId = normalizeVacancyId(vacancy.id);
                  return (
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
                      vacancy={enrichVacancyForUi({
                        ...vacancy,
                        hasApplied: vacancyHasApplied(appliedIds, vacancy.id) || vacancy.hasApplied,
                      })}
                      posted={formatPosted(vacancy.postedAt ?? vacancy.createdAt)}
                      onApply={handleApply}
                      onWithdraw={handleWithdraw}
                      onToggleFavorite={handleToggleFavorite}
                      isApplying={normId ? applyingIds.has(normId) : false}
                      isWithdrawing={normId ? withdrawingIds.has(normId) : false}
                      actionError={normId ? actionErrors[normId] : ''}
                      favoriteError={normId ? actionErrors[`fav-${normId}`] : ''}
                    />
                  </div>
                  );
                })}
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
                  const normId = normalizeVacancyId(vacancy.id);
                  const isApplying = normId ? applyingIds.has(normId) : false;
                  const isWithdrawing = normId ? withdrawingIds.has(normId) : false;
                  const hasApplied = vacancy.aiRecommendation
                    ? false
                    : (vacancyHasApplied(appliedIds, vacancy.id) || Boolean(vacancy.hasApplied));
                  const actionBusy = isApplying || isWithdrawing;
                  const applyLabel = hasApplied
                    ? t('vac.withdraw', 'Withdraw')
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

                      {!vacancy.aiRecommendation && normId && actionErrors[normId] ? (
                        <p className="vacancy-action-error job-item-error">{actionErrors[normId]}</p>
                      ) : null}

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
                          onClick={() => (
                            hasApplied && !vacancy.aiRecommendation
                              ? handleWithdraw(vacancy.id)
                              : handleRecommendedApply(vacancy)
                          )}
                          disabled={actionBusy}
                        >
                          {isApplying
                            ? t('vac.card.applying', 'Applying...')
                            : isWithdrawing
                              ? t('vac.card.withdrawing', 'Withdrawing...')
                              : applyLabel}
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
            ? enrichVacancyForUi({
                ...detailVacancy,
                hasApplied: vacancyHasApplied(appliedIds, detailVacancy.id)
                  || detailVacancy.hasApplied,
              })
            : null
        }
        posted={
          detailVacancy?.postedAt || detailVacancy?.createdAt
            ? formatPosted(detailVacancy.postedAt ?? detailVacancy.createdAt)
            : ''
        }
        onApply={handleApply}
        onWithdraw={handleWithdraw}
        onSearchSimilar={(vacancy) => handleSearchQuery(vacancy.title)}
        applying={
          detailVacancy?.id
            ? applyingIds.has(normalizeVacancyId(detailVacancy.id))
            : false
        }
        withdrawing={
          detailVacancy?.id
            ? withdrawingIds.has(normalizeVacancyId(detailVacancy.id))
            : false
        }
        applyError={
          detailVacancy?.id
            ? actionErrors[normalizeVacancyId(detailVacancy.id)] ?? ''
            : ''
        }
      />
    </main>
  );
};

export default VacanciesPage;
