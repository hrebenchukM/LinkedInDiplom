import { getProfileByUserId, resolveProfileUserId } from './profileApi.js';
import {
  getUserCertificates,
  getUserEducations,
  getUserExperiences,
  getUserLanguages,
  getUserRecommendations,
  getUserSkills,
} from '../professional/professionalApi.js';

export async function loadPublicPortfolio(identifier) {
  const userId = await resolveProfileUserId(identifier);

  if (!userId) {
    throw new Error('Profile not found.');
  }

  const profile = await getProfileByUserId(userId);

  const [experience, education, skills, certificates, languages, recommendations] =
    await Promise.all([
      getUserExperiences(userId),
      getUserEducations(userId),
      getUserSkills(userId),
      getUserCertificates(userId),
      getUserLanguages(userId),
      getUserRecommendations(userId),
    ]);

  return {
    user: profile?.user ?? profile,
    profile,
    experience,
    education,
    skills,
    certificates,
    languages,
    recommendations,
  };
}
