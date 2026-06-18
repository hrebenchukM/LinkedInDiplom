import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import AppContext from '../../features/appContext/AppContext';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import {
  fetchProfilesByUserIds,
  getProfileByUserId,
  recordProfileView,
} from '../../features/profile/profileApi.js';
import {
  enrichExperienceListWithCompanies,
  getUserCertificates,
  getUserEducations,
  getUserExperiences,
  getUserLanguages,
  getUserRecommendations,
  getUserSkills,
} from '../../features/professional/professionalApi.js';
import { mapRecommendationToReceivedItem } from '../../features/professional/mapRecommendation.js';
import {
  getDisplayName,
  getProfileAvatar,
  getProfileHeader,
} from '../../features/profile/mapProfile.js';
import { openChatWithUser } from '../../features/network/openChatWithUser.js';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import SafeImage from '../../shared/ui/SafeImage';
import ProfilePageSkeleton from './ProfilePageSkeleton.jsx';
import './ProfilePage.css';
import './PublicProfilePage.css';

async function loadProfessionalSection(loader) {
  try {
    return { data: await loader(), failed: false };
  } catch {
    return { data: [], failed: true };
  }
}

function resolveProfileSubtitle(profile) {
  if (!profile) return null;
  return (
    profile.profileTitle ||
    profile.headline ||
    profile.user?.profileTitle ||
    profile.user?.headline ||
    null
  );
}

function resolveSkillLabel(skill) {
  return skill?.skill?.name ?? skill?.skillName ?? skill?.name ?? null;
}

function resolveExperienceCompanyName(block) {
  return (
    block?.company?.name ??
    block?.companyName ??
    block?.company?.title ??
    null
  );
}

export default function PublicProfilePage() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, account } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? null;

  const [profile, setProfile] = useState(null);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState('');
  const [sectionsWarning, setSectionsWarning] = useState(false);

  const isOwnProfile =
    userId && currentUserId && String(userId) === String(currentUserId);

  useEffect(() => {
    if (!token || !userId || isOwnProfile) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setSectionsWarning(false);

    (async () => {
      try {
        const profileDto = await getProfileByUserId(userId);
        if (cancelled) return;

        setProfile(profileDto);

        const [
          expResult,
          eduResult,
          skillsResult,
          certsResult,
          langsResult,
          recsResult,
        ] = await Promise.all([
          loadProfessionalSection(async () => {
            const items = await getUserExperiences(userId);
            return enrichExperienceListWithCompanies(items);
          }),
          loadProfessionalSection(() => getUserEducations(userId)),
          loadProfessionalSection(() => getUserSkills(userId)),
          loadProfessionalSection(() => getUserCertificates(userId)),
          loadProfessionalSection(() => getUserLanguages(userId)),
          loadProfessionalSection(() => getUserRecommendations(userId)),
        ]);

        if (cancelled) return;

        const sectionResults = [
          expResult,
          eduResult,
          skillsResult,
          certsResult,
          langsResult,
          recsResult,
        ];
        setSectionsWarning(sectionResults.some((result) => result.failed));

        const rawRecommendations = Array.isArray(recsResult.data) ? recsResult.data : [];
        const authorIds = [
          ...new Set(
            rawRecommendations
              .map((item) => item?.authorId ?? item?.AuthorId)
              .filter(Boolean)
              .map(String),
          ),
        ];
        const authorProfiles =
          authorIds.length > 0 ? await fetchProfilesByUserIds(authorIds) : {};

        if (cancelled) return;

        setExperience(expResult.data);
        setEducation(eduResult.data);
        setSkills(skillsResult.data);
        setCertificates(certsResult.data);
        setLanguages(langsResult.data);
        setRecommendations(
          rawRecommendations
            .map((item) => {
              const authorId = String(item?.authorId ?? item?.AuthorId ?? '');
              const authorName = authorProfiles[authorId]
                ? getDisplayName(authorProfiles[authorId])
                : '';
              return mapRecommendationToReceivedItem(item, authorName);
            })
            .filter(Boolean),
        );

        recordProfileView(userId, 'profile').catch(() => {});
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, userId, isOwnProfile]);

  const handleMessage = async () => {
    if (!userId || !currentUserId || messaging) return;
    setMessaging(true);
    try {
      await openChatWithUser({
        targetUserId: userId,
        currentUserId,
        navigate,
      });
    } finally {
      setMessaging(false);
    }
  };

  if (isOwnProfile) {
    return <Navigate to="/app/profile" replace />;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <main className="main-content profile-page-shell">
        <div className="container">
          <div className="profile-page public-profile-page">
            <ProfilePageSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="main-content profile-page-shell">
        <div className="container">
          <div className="profile-page public-profile-page">
            <p className="auth-error">{error || t('userProfile.loadFailed', 'Failed to load profile.')}</p>
            <Link to="/app/network" className="public-profile-back">
              {t('userProfile.backNetwork', 'Back to network')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const fullName = getDisplayName(profile);
  const profileSubtitle = resolveProfileSubtitle(profile);
  const headerBackground = getProfileHeader(profile);
  const avatarUrl = getAssetUrl(
    getProfileAvatar(profile) || profile?.user?.avatarUrl,
    IMAGE_PLACEHOLDERS.avatar,
  );

  return (
    <main className="main-content profile-page-shell">
      <div className="container">
        <div className="profile-page public-profile-page">
          <section className="public-profile-header">
            <div
              className="public-profile-cover"
              style={
                headerBackground
                  ? { backgroundImage: `url("${headerBackground}")` }
                  : undefined
              }
            />
            <div className="public-profile-head">
              <SafeImage
                src={avatarUrl}
                alt={fullName}
                className="public-profile-avatar"
                fallback={IMAGE_PLACEHOLDERS.avatar}
              />
              <div className="public-profile-info">
                <h1>{fullName}</h1>
                {profileSubtitle ? (
                  <p className="public-profile-headline">{profileSubtitle}</p>
                ) : null}
                {profile.location ? <p className="public-profile-meta">{profile.location}</p> : null}
                <div className="public-profile-actions">
                  <button
                    type="button"
                    className="public-profile-btn"
                    onClick={handleMessage}
                    disabled={messaging}
                  >
                    <MessageCircle size={16} />
                    {messaging
                      ? t('network.connect.sending', 'Sending...')
                      : t('userProfile.message', 'Message')}
                  </button>
                  <Link to="/app/network" className="public-profile-link">
                    {t('userProfile.backNetwork', 'Back to network')}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {sectionsWarning ? (
            <p className="public-profile-sections-warning" role="status">
              {t(
                'userProfile.sectionsLoadWarning',
                'Some profile sections could not be loaded.',
              )}
            </p>
          ) : null}

          {profile.about ? (
            <article className="public-profile-card">
              <h2>{t('userProfile.about', 'About')}</h2>
              <p>{profile.about}</p>
            </article>
          ) : null}

          <article className="public-profile-card">
            <h2>{t('userProfile.experience', 'Experience')}</h2>
            {experience.length > 0 ? (
              <ul className="public-profile-list">
                {experience.map((block) => {
                  const exp = block.experience ?? block;
                  const companyName = resolveExperienceCompanyName(block);
                  return (
                    <li key={exp.id ?? exp.position}>
                      <strong>{exp.position ?? exp.title}</strong>
                      {companyName ? <span> — {companyName}</span> : null}
                      {exp.description ? <p>{exp.description}</p> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="public-profile-empty">{t('userProfile.experienceEmpty', 'No experience listed yet.')}</p>
            )}
          </article>

          <article className="public-profile-card">
            <h2>{t('userProfile.education', 'Education')}</h2>
            {education.length > 0 ? (
              <ul className="public-profile-list">
                {education.map((block) => {
                  const edu = block.education ?? block;
                  return (
                    <li key={edu.id ?? edu.institution}>
                      <strong>{edu.institution ?? edu.schoolName}</strong>
                      {edu.degree ? <span> — {edu.degree}</span> : null}
                      {edu.fieldOfStudy ? <span> · {edu.fieldOfStudy}</span> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="public-profile-empty">{t('userProfile.educationEmpty', 'No education listed yet.')}</p>
            )}
          </article>

          <article className="public-profile-card">
            <h2>{t('userProfile.skills', 'Skills')}</h2>
            {skills.length > 0 ? (
              <div className="public-profile-skills">
                {skills.map((skill) => {
                  const label = resolveSkillLabel(skill);
                  if (!label) return null;
                  return (
                    <span
                      key={skill.userSkillId ?? skill.id ?? skill.skillId ?? label}
                      className="public-profile-skill"
                    >
                      {label}
                      {skill.level ? (
                        <span className="public-profile-skill__level"> · {skill.level}</span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="public-profile-empty">{t('userProfile.skillsEmpty', 'No skills listed yet.')}</p>
            )}
          </article>

          {certificates.length > 0 ? (
            <article className="public-profile-card">
              <h2>{t('userProfile.certificates', 'Certificates')}</h2>
              <ul className="public-profile-list">
                {certificates.map((block) => {
                  const cert = block.certificate ?? block;
                  return (
                    <li key={cert.id ?? cert.name}>
                      <strong>{cert.name}</strong>
                      {cert.issueDate ? <span> — {cert.issueDate}</span> : null}
                      {block.academy?.name ? <span> · {block.academy.name}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </article>
          ) : null}

          {languages.length > 0 ? (
            <article className="public-profile-card">
              <h2>{t('userProfile.languages', 'Languages')}</h2>
              <div className="public-profile-skills">
                {languages.map((item) => {
                  const name = item.language?.name ?? item.languageName;
                  if (!name) return null;
                  return (
                    <span
                      key={item.id ?? item.languageId ?? name}
                      className="public-profile-skill"
                    >
                      {name}
                      {item.level ? (
                        <span className="public-profile-skill__level"> · {item.level}</span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            </article>
          ) : null}

          {recommendations.length > 0 ? (
            <article className="public-profile-card">
              <h2>{t('userProfile.recommendations', 'Recommendations')}</h2>
              <ul className="public-profile-list">
                {recommendations.map((item) => (
                  <li key={item.recommendationId ?? item.title}>
                    <strong>{item.title}</strong>
                    {item.date ? <span> — {item.date}</span> : null}
                    {item.meta ? <p>{item.meta}</p> : null}
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </div>
    </main>
  );
}
