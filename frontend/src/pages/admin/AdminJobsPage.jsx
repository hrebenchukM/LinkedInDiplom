import { useCallback, useEffect, useState } from 'react';
import { useTranslation, getDateLocale } from '../../app/i18n/LocaleContext.jsx';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config';
import { getErrorMessage } from '../../shared/lib/apiError';
import {
  createAdminRecommendedQuery,
  deleteAdminRecommendedQuery,
  deleteAdminVacancy,
  getAdminRecommendedQueries,
  getAdminVacancies,
  restoreAdminVacancy,
} from '../../features/admin/adminApi';

function formatQueryDate(value, locale) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(getDateLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminJobsPage() {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [recommendedQueries, setRecommendedQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(true);
  const [queriesError, setQueriesError] = useState('');
  const [newQuery, setNewQuery] = useState('');
  const [savingQuery, setSavingQuery] = useState(false);

  const loadItems = useCallback(async ({
    pageToLoad = 1,
    append = false,
    deletedFilter = filter,
    searchValue = search,
  } = {}) => {
    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');

    const isDeleted = deletedFilter === 'deleted'
      ? true
      : deletedFilter === 'active'
        ? false
        : undefined;

    try {
      const response = await getAdminVacancies({
        page: pageToLoad,
        pageSize: DEFAULT_PAGE_SIZE,
        isDeleted,
        includeDeleted: deletedFilter === 'all',
        search: searchValue?.trim() || undefined,
      });

      setItems((prev) => (append ? [...prev, ...response.items] : response.items));
      setPage(response.page);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      setError(getErrorMessage(err));
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, search]);

  const loadRecommendedQueries = useCallback(async () => {
    setQueriesLoading(true);
    setQueriesError('');
    try {
      const queries = await getAdminRecommendedQueries();
      setRecommendedQueries(queries);
    } catch (err) {
      setQueriesError(getErrorMessage(err));
      setRecommendedQueries([]);
    } finally {
      setQueriesLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadItems({ pageToLoad: 1, append: false });
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadItems]);

  useEffect(() => {
    loadRecommendedQueries();
  }, [loadRecommendedQueries]);

  const handleDelete = async (vacancyId) => {
    if (!window.confirm(t('admin.jobs.confirmDelete', 'Delete this vacancy?'))) return;
    try {
      await deleteAdminVacancy(vacancyId);
      await loadItems({ pageToLoad: 1, append: false });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRestore = async (vacancyId) => {
    try {
      await restoreAdminVacancy(vacancyId);
      await loadItems({ pageToLoad: 1, append: false });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddQuery = async (event) => {
    event.preventDefault();
    const trimmed = newQuery.trim();
    if (!trimmed || savingQuery) return;

    setSavingQuery(true);
    setQueriesError('');
    try {
      await createAdminRecommendedQuery({ query: trimmed });
      setNewQuery('');
      await loadRecommendedQueries();
    } catch (err) {
      setQueriesError(getErrorMessage(err));
    } finally {
      setSavingQuery(false);
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm(t('admin.jobs.confirmDeleteQuery', 'Delete this recommended query?'))) {
      return;
    }

    setQueriesError('');
    try {
      await deleteAdminRecommendedQuery(queryId);
      await loadRecommendedQueries();
    } catch (err) {
      setQueriesError(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className="admin-page-title">{t('admin.jobs.title', 'Jobs moderation')}</h1>
      <p className="admin-page-subtitle">{t('admin.jobs.vacancies', 'Vacancies')}</p>

      <div className="admin-toolbar">
        <select className="admin-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">{t('admin.jobs.allVacancies', 'All vacancies')}</option>
          <option value="active">{t('admin.active', 'Active')}</option>
          <option value="deleted">{t('admin.deleted', 'Deleted')}</option>
        </select>
        <input
          type="search"
          className="admin-input"
          placeholder={t('admin.jobs.search', 'Search vacancies')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">{t('common.loading', 'Loading...')}</div>}
      {!loading && items.length === 0 && (
        <div className="admin-empty">{t('admin.jobs.empty', 'No vacancies found.')}</div>
      )}

      {!loading && items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.jobs.titleCol', 'Title')}</th>
                <th>{t('admin.jobs.company', 'Company')}</th>
                <th>{t('admin.jobs.location', 'Location')}</th>
                <th>{t('admin.users.status', 'Status')}</th>
                <th>{t('admin.content.created', 'Created')}</th>
                <th>{t('admin.users.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.companyName || item.companyId || '—'}</td>
                  <td>{item.location || '—'}</td>
                  <td>
                    <span className={`admin-badge ${item.isDeleted ? 'admin-badge-deleted' : 'admin-badge-active'}`}>
                      {item.isDeleted ? t('admin.deleted', 'Deleted') : t('admin.active', 'Active')}
                    </span>
                  </td>
                  <td>{item.createdAtLabel}</td>
                  <td>
                    <div className="admin-actions">
                      {!item.isDeleted ? (
                        <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(item.id)}>
                          {t('admin.delete', 'Delete')}
                        </button>
                      ) : (
                        <button type="button" className="admin-btn" onClick={() => handleRestore(item.id)}>
                          {t('admin.restore', 'Restore')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && hasNextPage && (
        <button
          type="button"
          className="admin-btn admin-load-more"
          onClick={() => loadItems({ pageToLoad: page + 1, append: true })}
          disabled={loadingMore}
        >
          {loadingMore ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load more')}
        </button>
      )}

      <h2 className="admin-page-subtitle" style={{ marginTop: '2.5rem' }}>
        {t('admin.jobs.recommended', 'Recommended queries')}
      </h2>
      <p className="admin-page-subtitle">
        {t(
          'admin.jobs.recommendedHint',
          'Search suggestions shown to users on the Vacancies page sidebar.',
        )}
      </p>

      <form className="admin-toolbar" onSubmit={handleAddQuery}>
        <input
          type="text"
          className="admin-input"
          placeholder={t('admin.jobs.newQuery', 'New search query')}
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          maxLength={200}
          disabled={savingQuery}
        />
        <button type="submit" className="admin-btn" disabled={savingQuery || !newQuery.trim()}>
          {savingQuery ? t('common.loading', 'Loading...') : t('admin.add', 'Add')}
        </button>
      </form>

      {queriesError && <div className="admin-error">{queriesError}</div>}
      {queriesLoading && <div className="admin-loading">{t('common.loading', 'Loading...')}</div>}
      {!queriesLoading && recommendedQueries.length === 0 && (
        <div className="admin-empty">{t('admin.jobs.noQueries', 'No recommended queries.')}</div>
      )}

      {!queriesLoading && recommendedQueries.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.jobs.queryCol', 'Query')}</th>
                <th>{t('admin.content.created', 'Created')}</th>
                <th>{t('admin.users.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {recommendedQueries.map((item) => (
                <tr key={item.id}>
                  <td>{item.query}</td>
                  <td>{formatQueryDate(item.createdAt, locale)}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDeleteQuery(item.id)}
                      >
                        {t('admin.delete', 'Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
