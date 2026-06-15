import { useContext, useEffect, useState } from "react";
import AppContext from "../../features/appContext/AppContext";
import './ProfilePage.css';

import ProfileHeader from '../../features/ProfileHeader/ProfileHeader';
import ProfileAnalytics from '../../features/ProfileAnalytics/ProfileAnalytics';
import ProfileExperience from '../../features/ProfileExperience/ProfileExperience';
import ProfileEducation from '../../features/ProfileEducation/ProfileEducation';
import ProfileSkills from "../../features/ProfileSkills/ProfileSkills";

const initialState = {
  profile: null,
  analytics: null,
  experience: [],
  education: [],
  certificates: [],
  skills: []              
};


const ProfilePage = () => {
  
  const reloadExperience = async () => {
  const experience = await request("api://user/experience");
  setData(prev => ({
    ...prev,
    experience: Array.isArray(experience) ? experience : []
  }));
};

const reloadEducation = async () => {
  const education = await request("api://user/education");
  setData(prev => ({
    ...prev,
    education: Array.isArray(education) ? education : []
  }));
};

const reloadCertificates = async () => {
  const certificates = await request("api://user/certificates");
  setData(prev => ({
    ...prev,
    certificates: Array.isArray(certificates) ? certificates : []
  }));
};

const reloadSkills = async () => {
  const skills = await request("api://user/skills");
  setData(prev => ({
    ...prev,
    skills: Array.isArray(skills) ? skills : []
  }));
};

 const { request, token } = useContext(AppContext);

  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  if (!token) return;

  let cancelled = false;
  setLoading(true);

  (async () => {
    try {
      // 1️⃣ PROFILE — якорь страницы
      const profile = await request("api://user/profile");
      if (cancelled) return;

      setData(prev => ({
        ...prev,
        profile
      }));

      // 2️⃣ ANALYTICS
      const analytics = await request("api://user/analytics");
      if (cancelled) return;

      setData(prev => ({
        ...prev,
        analytics
      }));

      // 3️⃣ EXPERIENCE
      const experience = await request("api://user/experience");
      if (cancelled) return;

      setData(prev => ({
        ...prev,
        experience: Array.isArray(experience) ? experience : []
      }));

      // 4️⃣ EDUCATION
      const education = await request("api://user/education");
      if (cancelled) return;

      setData(prev => ({
        ...prev,
        education: Array.isArray(education) ? education : []
      }));

      // 5️⃣ CERTIFICATES
      const certificates = await request("api://user/certificates");
      if (cancelled) return;

      setData(prev => ({
        ...prev,
        certificates: Array.isArray(certificates) ? certificates : []
      }));

      // 6️⃣ SKILLS
      const skills = await request("api://user/skills");
      console.log("SKILLS FROM API:", skills);
      if (cancelled) return;

      setData(prev => ({
        ...prev,
        skills: Array.isArray(skills) ? skills : []
      }));


    } catch (err) {
      console.error("Profile load error:", err);
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

  // ================= GUARDS =================
  if (!token) {
    return <div className="alert alert-danger">Профіль доступний після входу</div>;
  }

  if (loading || !data.profile?.user) {
    return null; // Loader
  }

  // ================= RENDER =================
  return (
    <main className="main-content">
      <div className="container">
        <div className="profile-page">
          <div className="profile-content">

            <ProfileHeader profile={data.profile} />

            <ProfileAnalytics analytics={data.analytics} />

   <ProfileExperience
  items={data.experience}
  onAdded={reloadExperience}
/>

<ProfileEducation
  education={data.education}
  certificates={data.certificates}
  onEducationAdded={reloadEducation}
  onCertificateAdded={reloadCertificates}
/>

<ProfileSkills
  skills={data.skills}
  onAdded={reloadSkills}
/>

          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
