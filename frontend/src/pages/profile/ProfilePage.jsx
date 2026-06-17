import { useContext, useEffect, useMemo, useState } from 'react';
import AppContext from '../../features/appContext/AppContext';
import './ProfilePage.css';

import ProfileHeader from '../../features/ProfileHeader/ProfileHeader';
import ProfileAnalytics from '../../features/ProfileAnalytics/ProfileAnalytics';
import ProfileExperience from '../../features/ProfileExperience/ProfileExperience';
import ProfileEducation from '../../features/ProfileEducation/ProfileEducation';
import ProfileSkills from '../../features/ProfileSkills/ProfileSkills';
import ProfilePageSkeleton from './ProfilePageSkeleton.jsx';
import ProfileCompletionPanel from '../../features/ProfileCompletion/ProfileCompletionPanel.jsx';
import ProfileResumeSection from '../../features/ProfileResume/ProfileResumeSection.jsx';
import { getMyProfile, getProfileViews } from '../../features/profile/profileApi.js';
import { calculateProfileCompletion } from '../../features/profile/calculateProfileCompletion.js';
import { getStoredResume } from '../../features/profile/profileResumeStorage.js';
import {
  getMyCertificates,
  getMyEducations,
  getMyExperiences,
  getMySkills,
} from '../../features/professional/professionalApi.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const emptySections = {
  analytics: null,
  experience: [],
  education: [],
  certificates: [],
  skills: [],
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { token, account, profile: cachedProfile, setProfile } = useContext(AppContext);
  const currentUserId = account?.id ?? account?.userId ?? null;
  const [sections, setSections] = useState(emptySections);
  const [localProfile, setLocalProfile] = useState(null);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resume, setResume] = useState({ resumeName: '', resumeDataUrl: '' });
  const [completionTick, setCompletionTick] = useState(0);

  const profile = localProfile ?? cachedProfile;

  const profileWithLogin = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile,
      login: profile.login ?? account?.email ?? profile.user?.email,
    };
  }, [profile, account?.email]);

  useEffect(() => {
    if (!currentUserId) {
      setResume({ resumeName: '', resumeDataUrl: '' });
      return;
    }
    setResume(getStoredResume(currentUserId));
  }, [currentUserId]);

  const completion = useMemo(() => {
    return calculateProfileCompletion({
      profile: profileWithLogin,
      experience: sections.experience,
      education: sections.education,
      skills: sections.skills,
      resumeAttached: Boolean(resume.resumeDataUrl),
    });
    // completionTick forces refresh after resume upload/remove
  }, [profileWithLogin, sections, resume.resumeDataUrl, completionTick]);

  const reloadExperience = async () => {
    const experience = await getMyExperiences();
    setSections((prev) => ({ ...prev, experience }));
    setCompletionTick((value) => value + 1);
  };

  const reloadEducation = async () => {
    const education = await getMyEducations();
    setSections((prev) => ({ ...prev, education }));
    setCompletionTick((value) => value + 1);
  };

  const reloadCertificates = async () => {
    const certificates = await getMyCertificates();
    setSections((prev) => ({ ...prev, certificates }));
  };

  const reloadSkills = async () => {
    const skills = await getMySkills();
    setSections((prev) => ({ ...prev, skills }));
    setCompletionTick((value) => value + 1);
  };

  const handleProfileUpdated = (nextProfile) => {
    if (!nextProfile) return;
    const enriched = {
      ...nextProfile,
      login: nextProfile.login ?? account?.email ?? nextProfile.user?.email,
    };
    setLocalProfile(enriched);
    setProfile?.(enriched);
    setCompletionTick((value) => value + 1);
  };

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;
    setSectionsLoading(true);

    (async () => {
      try {
        setError('');
        const hasCachedProfile = Boolean(cachedProfile?.user);

        const [nextProfile, analytics, experience, education, certificates, skills] =
          await Promise.all([
            hasCachedProfile ? Promise.resolve(cachedProfile) : getMyProfile(),
            getProfileViews().catch(() => ({ profileViews: 0, postViews: 0 })),
            getMyExperiences(),
            getMyEducations(),
            getMyCertificates(),
            getMySkills(),
          ]);

        if (cancelled) return;

        setSections({
          analytics,
          experience,
          education,
          certificates,
          skills,
        });

        if (nextProfile) {
          const enriched = {
            ...nextProfile,
            login: nextProfile.login ?? account?.email ?? nextProfile.user?.email,
          };
          setLocalProfile(enriched);
          setProfile?.(enriched);
        }
      } catch (err) {
        console.error('Profile load error:', err);
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setSectionsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="alert alert-danger">
        {t('profile.page.signInRequired', 'Profile is available after sign in')}
      </div>
    );
  }

  const showHeader = Boolean(profileWithLogin?.user);
  const showFullSkeleton = sectionsLoading && !showHeader;

  if (showFullSkeleton) {
    return (
      <main className="main-content profile-page-shell">
        <div className="container">
          <div className="profile-page">
            <ProfilePageSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (error && !showHeader) {
    return (
      <main className="main-content profile-page-shell">
        <div className="container">
          <div className="profile-page auth-error">{error}</div>
        </div>
      </main>
    );
  }

  return (
      <main className="main-content profile-page-shell">
      <div className="container">
        <div className="profile-page">
          <div className="profile-page-layout">
            <div className="profile-page-main">
              <div className="profile-content">
                {error ? <div className="auth-error">{error}</div> : null}

                {showHeader ? (
                  <ProfileHeader
                    profile={profileWithLogin}
                    onProfileUpdated={handleProfileUpdated}
                  />
                ) : null}

                <ProfileResumeSection
                  userId={currentUserId}
                  resumeName={resume.resumeName}
                  resumeDataUrl={resume.resumeDataUrl}
                  onResumeChange={setResume}
                  onCompletionRefresh={() => setCompletionTick((value) => value + 1)}
                />

                {sectionsLoading ? (
                  <ProfilePageSkeleton sectionsOnly />
                ) : (
                  <>
                    <ProfileAnalytics analytics={sections.analytics} />
                    <ProfileExperience items={sections.experience} onAdded={reloadExperience} />
                    <ProfileEducation
                      education={sections.education}
                      certificates={sections.certificates}
                      onEducationAdded={reloadEducation}
                      onCertificateAdded={reloadCertificates}
                    />
                    <ProfileSkills skills={sections.skills} onAdded={reloadSkills} />
                  </>
                )}
              </div>
            </div>

            <div className="profile-page-aside">
              <ProfileCompletionPanel completion={completion} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
