import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import AppContext from '../../features/appContext/AppContext';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { getProfileByUserId, recordProfileView } from '../../features/profile/profileApi.js';
import {
  getUserEducations,
  getUserExperiences,
  getUserSkills,
} from '../../features/professional/professionalApi.js';
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
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState('');

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

    (async () => {
      try {
        const profileDto = await getProfileByUserId(userId);
        if (cancelled) return;

        setProfile(profileDto);

        const [exp, edu, userSkills] = await Promise.all([
          getUserExperiences(userId).catch(() => []),
          getUserEducations(userId).catch(() => []),
          getUserSkills(userId).catch(() => []),
        ]);

        if (cancelled) return;
        setExperience(exp);
        setEducation(edu);
        setSkills(userSkills);
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
                {profile.headline ? <p className="public-profile-headline">{profile.headline}</p> : null}
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
                  return (
                    <li key={exp.id ?? exp.position}>
                      <strong>{exp.position ?? exp.title}</strong>
                      {block.company?.name ? <span> — {block.company.name}</span> : null}
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
                {skills.map((skill) => (
                  <span key={skill.userSkillId ?? skill.skillId ?? skill.name} className="public-profile-skill">
                    {skill.name ?? skill.skillName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="public-profile-empty">{t('userProfile.skillsEmpty', 'No skills listed yet.')}</p>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
