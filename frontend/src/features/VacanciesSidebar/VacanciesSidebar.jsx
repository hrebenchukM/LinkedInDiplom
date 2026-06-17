import React, { useEffect, useState } from 'react';
import { Sliders, Bookmark, Plus } from 'lucide-react';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import '../VacanciesSidebar/VacanciesSidebar.css';
import PostJobModal from '../Modals/PostJobModal';
import VacancyFiltersModal from '../Modals/VacancyFiltersModal/VacancyFiltersModal';
import { getRecommendedJobQueries } from '../jobs/jobsApi';

const VacanciesSidebar = ({
  onApplyFilters,
  onPosted,
  onSearchQuery,
  onViewChange,
  activeView = 'all',
}) => {
  const { t } = useTranslation();
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [recommendedQueries, setRecommendedQueries] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getRecommendedJobQueries()
      .then((queries) => {
        if (!cancelled) {
          setRecommendedQueries(queries);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecommendedQueries([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="vacancies-sidebar-container">
        <nav className="vacancies-nav" aria-label={t('vac.nav.aria', 'Job sections')}>
          <button
            type="button"
            className={`vacancies-nav-item ${activeView === 'all' ? 'active' : ''}`}
            onClick={() => {
              onViewChange?.('all');
              setIsFiltersModalOpen(true);
            }}
          >
            <Sliders size={18} />
            <span>{t('vac.sidebar.parameters', 'Parameters')}</span>
          </button>
          <button
            type="button"
            className={`vacancies-nav-item ${activeView === 'saved' ? 'active' : ''}`}
            onClick={() => onViewChange?.('saved')}
          >
            <Bookmark size={18} />
            <span>{t('vac.sidebar.saved', 'My vacancies')}</span>
          </button>
        </nav>

        {recommendedQueries.length > 0 ? (
          <div className="sidebar-recommended-queries">
            <h4 className="sidebar-queries-title">
              {t('vac.sidebar.recommended', 'Recommended searches')}
            </h4>
            <div className="sidebar-queries-list">
              {recommendedQueries.map((item) => (
                <button
                  key={item.id ?? item.query}
                  type="button"
                  className="sidebar-query-chip"
                  onClick={() => onSearchQuery?.(item.query)}
                >
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="post-vacancy-btn"
          onClick={() => setIsPostJobModalOpen(true)}
        >
          <Plus size={18} />
          <span>{t('vac.sidebar.post', 'Post a vacancy')}</span>
        </button>
      </div>

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onPosted={onPosted}
      />

      <VacancyFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={onApplyFilters}
      />
    </>
  );
};

export default VacanciesSidebar;
