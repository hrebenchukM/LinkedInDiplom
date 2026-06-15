import React, { useEffect, useState } from 'react';
import { Sliders, Bookmark, Plus } from 'lucide-react';
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

  const queryItems = recommendedQueries;

  return (
    <>
      <div className="vacancies-sidebar-container">
        <nav className="vacancies-nav">
          <button
            type="button"
            className={`vacancies-nav-item ${activeView === 'all' ? 'active' : ''}`}
            onClick={() => {
              onViewChange?.('all');
              setIsFiltersModalOpen(true);
            }}
          >
            <Sliders size={18} />
            <span>Parameters</span>
          </button>
          <button
            type="button"
            className={`vacancies-nav-item ${activeView === 'saved' ? 'active' : ''}`}
            onClick={() => onViewChange?.('saved')}
          >
            <Bookmark size={18} />
            <span>My vacancies</span>
          </button>
        </nav>

        {queryItems.length > 0 && (
          <div className="sidebar-recommended-queries">
            <h4 className="sidebar-queries-title">Recommended searches</h4>
            <div className="sidebar-queries-list">
              {queryItems.map((item) => (
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
        )}

        <button
          type="button"
          className="post-vacancy-btn"
          onClick={() => setIsPostJobModalOpen(true)}
        >
          <Plus size={18} />
          <span>Post a vacancy</span>
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
