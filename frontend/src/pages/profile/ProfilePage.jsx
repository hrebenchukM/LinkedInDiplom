import { useContext, useEffect, useState } from 'react';
import AppContext from '../../features/appContext/AppContext';
import './ProfilePage.css';

import ProfileHeader from '../../features/ProfileHeader/ProfileHeader';
import ProfileAnalytics from '../../features/ProfileAnalytics/ProfileAnalytics';
import ProfileExperience from '../../features/ProfileExperience/ProfileExperience';
import ProfileEducation from '../../features/ProfileEducation/ProfileEducation';
import ProfileSkills from '../../features/ProfileSkills/ProfileSkills';
import { getMyProfile, getProfileViews } from '../../features/profile/profileApi.js';
import {
  getMyCertificates,
  getMyEducations,
  getMyExperiences,
  getMySkills,
} from '../../features/professional/professionalApi.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

const initialState = {
  profile: null,
  analytics: null,
  experience: [],
  education: [],
  certificates: [],
  skills: [],
};

const ProfilePage = () => {
  const { token, account, setProfile } = useContext(AppContext);
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfileData = async () => {
    setError('');

    const [profile, analytics, experience, education, certificates, skills] =
      await Promise.all([
        getMyProfile(),
        getProfileViews().catch(() => ({ profileViews: 0, postViews: 0 })),
        getMyExperiences(),
        getMyEducations(),
        getMyCertificates(),
        getMySkills(),
      ]);

    setData({
      profile,
      analytics,
      experience,
      education,
      certificates,
      skills,
    });

    if (profile) {
      setProfile?.({
        ...profile,
        login: profile.login ?? account?.email ?? profile.user?.email,
      });
    }
  };

  const reloadExperience = async () => {
    const experience = await getMyExperiences();
    setData((prev) => ({ ...prev, experience }));
  };

  const reloadEducation = async () => {
    const education = await getMyEducations();
    setData((prev) => ({ ...prev, education }));
  };

  const reloadCertificates = async () => {
    const certificates = await getMyCertificates();
    setData((prev) => ({ ...prev, certificates }));
  };

  const reloadSkills = async () => {
    const skills = await getMySkills();
    setData((prev) => ({ ...prev, skills }));
  };

  const handleProfileUpdated = (profile) => {
    if (!profile) return;
    setData((prev) => ({ ...prev, profile }));
    setProfile?.(profile);
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        await loadProfileData();
      } catch (err) {
        console.error('Profile load error:', err);
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return <div className="alert alert-danger">Профіль доступний після входу</div>;
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="profile-page">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (error && !data.profile?.user) {
    return (
      <main className="main-content">
        <div className="container">
          <div className="profile-page auth-error">{error}</div>
        </div>
      </main>
    );
  }

  const profileWithLogin = {
    ...data.profile,
    login: data.profile?.login ?? account?.email ?? data.profile?.user?.email,
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="profile-page">
          <div className="profile-content">
            {error ? <div className="auth-error">{error}</div> : null}

            <ProfileHeader
              profile={profileWithLogin}
              onProfileUpdated={handleProfileUpdated}
            />

            <ProfileAnalytics analytics={data.analytics} />

            <ProfileExperience items={data.experience} onAdded={reloadExperience} />

            <ProfileEducation
              education={data.education}
              certificates={data.certificates}
              onEducationAdded={reloadEducation}
              onCertificateAdded={reloadCertificates}
            />

            <ProfileSkills skills={data.skills} onAdded={reloadSkills} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
