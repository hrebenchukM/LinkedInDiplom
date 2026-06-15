import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import VacanciesSidebar from '../../features/VacanciesSidebar/VacanciesSidebar';
import VacancyCard from '../../features/VacancyCard/VacancyCard';
import { useContext, useEffect, useState } from "react";
import AppContext from "../../features/appContext/AppContext";
import { fileUrl } from '../../shared/api/files';

import './VacanciesPage.css';

// ===================== helpers =====================
function formatPosted(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

  return date.toLocaleDateString();
}

// ===================== FILTER =====================
function applyVacancyFilters(vacancies, filters) {
  if (!filters) return vacancies;

  return vacancies.filter(v => {

    // ===== LOCATION =====
    if (filters.location.length > 0 && v.location) {
      const loc = v.location.toLowerCase();

      const matches = filters.location.some(f => {
        if (f === 'Remote') return loc.includes('remote');
        if (f === 'On-site') return !loc.includes('remote');
        if (f === 'Hybrid') return loc.includes('hybrid');
        return false;
      });

      if (!matches) return false;
    }

    // ===== JOB TYPE (мягко) =====
    if (filters.jobType.length > 0 && v.jobType) {
      if (!filters.jobType.includes(v.jobType)) return false;
    }

    // ===== EXPERIENCE (мягко) =====
    if (filters.experienceLevel.length > 0 && v.experienceLevel) {
      if (!filters.experienceLevel.includes(v.experienceLevel)) return false;
    }

    // ===== SALARY =====
    const [min, max] = filters.salaryRange;
    if (v.salaryFrom != null && v.salaryTo != null) {
      if (v.salaryTo < min || v.salaryFrom > max) return false;
    }

    return true;
  });
}

// ===================== component =====================
const VacanciesPage = ({ onNavigate }) => {
 const { request, profile } = useContext(AppContext);
  const [vacancies, setVacancies] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);

  const reloadVacancies = () => {
    setLoading(true);
    request("api://vacancy")
      .then(data => setVacancies(Array.isArray(data) ? data : []))
      .catch(alert)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadVacancies();
  }, []);

  const visibleVacancies = applyVacancyFilters(vacancies, filters);


  // ---------- profile title ----------
  const profileTitle =
    profile?.user?.profileTitle ||
    profile?.user?.headline ||
    '';

  const normalizedTitle = profileTitle.toLowerCase();

  // ---------- recommended vacancies by profile ----------
  const recommendedVacancies = profileTitle
    ? vacancies.filter(v =>
        v.title?.toLowerCase().includes(normalizedTitle)
      )
    : [];

  const finalRecommended =
    recommendedVacancies.length > 0
      ? recommendedVacancies
      : vacancies.slice(0, 5);

  // ---------- job search queries ----------
  const jobSearchQueries = Array.from(
    new Set(vacancies.map(v => v.title).filter(Boolean))
  ).slice(0, 6);

 
  // ===================== render =====================
  return (
    <main className="main-content">
      <div className="container">
        <div className="vacancies-grid">

          {/* ===== SIDEBAR ===== */}
          <aside className="vacancies-sidebar">
            <VacanciesSidebar
              onApplyFilters={setFilters}
              onPosted={reloadVacancies}
            />
          </aside>

          {/* ===== MAIN ===== */}
          <section className="vacancies-main">

            {/* ===== BEST VACANCIES ===== */}
            <div className="vacancies-section">
              <div className="section-header">
                <h2 className="section-title">
                  Selection of the best vacancies
                </h2>
                <p className="section-subtitle">
                  Based on your profile and activity
                </p>
              </div>

              <div className="vacancies-list">
                {loading && <div>Loading...</div>}

                {!loading && visibleVacancies.length === 0 && (
                  <div>No vacancies yet</div>
                )}

              {visibleVacancies.map(v => (
                  <VacancyCard
                    key={v.id}
                    company={v.company?.name}
                    logo={
                      v.company?.logoUrl
                        ? fileUrl(v.company.logoUrl)
                        : '/img/company-placeholder.png'
                    }
                    position={v.title}
                    location={v.location}
                    salary={
                      v.salaryFrom && v.salaryTo
                        ? `${v.salaryFrom} – ${v.salaryTo}`
                        : 'Salary not specified'
                    }
                    posted={formatPosted(v.postedAt)}
                    status="Be among the candidates"
                  />
                ))}
              </div>
            </div>

            {/* ===== RECOMMENDED SEARCH QUERIES ===== */}
            <div className="vacancies-section">
              <div className="section-header-inline">
                <h3 className="section-title-small">
                  Recommended job search queries
                </h3>
              </div>

              <div className="search-queries">
                {jobSearchQueries.map((query, index) => (
                  <button key={index} className="query-chip">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle
                        cx="6.5"
                        cy="6.5"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 10l3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    {query}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== RECOMMENDED BY PROFILE TITLE ===== */}
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
                {finalRecommended.map(v => (
                  <div key={v.id} className="job-item">
                    <div className="job-info">
                      <img
                        src={
                          v.company?.logoUrl
                            ? fileUrl(v.company.logoUrl)
                            : '/img/company-placeholder.png'
                        }
                        alt={v.company?.name}
                        className="job-logo"
                      />
                      <div className="job-details">
                        <h4 className="job-company">{v.company?.name}</h4>
                        <p className="job-location">{v.location}</p>
                      </div>
                    </div>
                    <button className="dismiss-btn">×</button>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* ===== MESSAGES ===== */}
          <aside className="vacancies-messages">
            <MessagesPanel onNavigate={onNavigate} />
          </aside>

        </div>
      </div>
    </main>
  );
};

export default VacanciesPage;
