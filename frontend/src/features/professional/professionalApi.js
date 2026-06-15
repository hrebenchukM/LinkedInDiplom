import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery, mapPagedResponse } from '../../shared/lib/pagination.js';
import {
  DEFAULT_SKILL_CATALOG_QUERY,
  normalizeSortDirection,
  pickAllowedValue,
  SKILL_CATALOG_SORT_BY,
} from '../../shared/api/sortParams.js';
import {
  mapCertificateList,
  mapCompanyDto,
  mapCompanyList,
  mapEducationList,
  mapExperienceList,
  mapSkillDto,
  mapUserLanguageList,
  mapUserSkillList,
  unwrapList,
} from './mapProfessional.js';

async function safeListRequest(requestFn) {
  try {
    const response = await requestFn();
    return unwrapList(response);
  } catch {
    return [];
  }
}

async function buildSkillMap(userSkills) {
  const map = {};
  const ids = [
    ...new Set(
      userSkills
        .map((item) => item.skillId ?? item.SkillId)
        .filter(Boolean),
    ),
  ];

  await Promise.all(
    ids.map(async (skillId) => {
      try {
        const skill = await apiClient.get(API_PATHS.professional.skillById(skillId));
        map[skillId] = skill;
      } catch {
        map[skillId] = { id: skillId, name: 'Skill' };
      }
    }),
  );

  return map;
}

async function buildLanguageMap(userLanguages) {
  const map = {};
  const ids = [
    ...new Set(
      userLanguages
        .map((item) => item.languageId ?? item.LanguageId)
        .filter(Boolean),
    ),
  ];

  await Promise.all(
    ids.map(async (languageId) => {
      try {
        const language = await apiClient.get(
          API_PATHS.professional.languageById(languageId),
        );
        map[languageId] = language;
      } catch {
        map[languageId] = { id: languageId, name: 'Language' };
      }
    }),
  );

  return map;
}

export async function resolveSkillIdByName(name) {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  const results = await searchSkillsCatalog(trimmed, 20);
  const exact = results.find(
    (skill) => skill.name?.toLowerCase() === trimmed.toLowerCase(),
  );

  if (exact?.id) return exact.id;
  if (results.length === 1) return results[0].id;
  return results[0]?.id ?? null;
}

export async function searchSkillsCatalog(search, pageSize = 20) {
  const query = buildPaginationQuery({
    page: 1,
    pageSize,
    search: search?.trim() || undefined,
    sortBy:
      pickAllowedValue(DEFAULT_SKILL_CATALOG_QUERY.sortBy, SKILL_CATALOG_SORT_BY) ??
      DEFAULT_SKILL_CATALOG_QUERY.sortBy,
    sortDirection:
      normalizeSortDirection(DEFAULT_SKILL_CATALOG_QUERY.sortDirection) ??
      DEFAULT_SKILL_CATALOG_QUERY.sortDirection,
  });
  const response = await apiClient.get(API_PATHS.professional.skillsCatalog, {
    query,
  });
  return mapPagedResponse(response).items.map(mapSkillDto).filter(Boolean);
}

export async function getSkillById(skillId) {
  const skill = await apiClient.get(API_PATHS.professional.skillById(skillId));
  return mapSkillDto(skill);
}

// Experiences
export async function getMyExperiences() {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.myExperiences),
  );
  return mapExperienceList(items);
}

export async function createExperience(data) {
  return apiClient.post(API_PATHS.professional.myExperiences, data);
}

export async function updateExperience(id, data, method = 'patch') {
  const path = API_PATHS.professional.experienceById(id);
  return method === 'put'
    ? apiClient.put(path, data)
    : apiClient.patch(path, data);
}

export async function deleteExperience(id) {
  return apiClient.delete(API_PATHS.professional.experienceById(id));
}

export async function getUserExperiences(userId) {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.userExperiences(userId)),
  );
  return mapExperienceList(items);
}

// Educations
export async function getMyEducations() {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.myEducations),
  );
  return mapEducationList(items);
}

export async function createEducation(data) {
  return apiClient.post(API_PATHS.professional.myEducations, data);
}

export async function updateEducation(id, data, method = 'patch') {
  const path = API_PATHS.professional.educationById(id);
  return method === 'put'
    ? apiClient.put(path, data)
    : apiClient.patch(path, data);
}

export async function deleteEducation(id) {
  return apiClient.delete(API_PATHS.professional.educationById(id));
}

export async function getUserEducations(userId) {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.userEducations(userId)),
  );
  return mapEducationList(items);
}

// Skills
export async function getMySkills() {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.mySkills),
  );
  const skillMap = await buildSkillMap(items);
  return mapUserSkillList(items, skillMap);
}

export async function createSkill(data) {
  return apiClient.post(API_PATHS.professional.mySkills, data);
}

export async function updateSkill(id, data, method = 'patch') {
  const path = API_PATHS.professional.userSkillById(id);
  return method === 'put'
    ? apiClient.put(path, data)
    : apiClient.patch(path, data);
}

export async function deleteSkill(id) {
  return apiClient.delete(API_PATHS.professional.userSkillById(id));
}

export async function getUserSkills(userId) {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.userSkills(userId)),
  );
  const skillMap = await buildSkillMap(items);
  return mapUserSkillList(items, skillMap);
}

// Certificates
export async function getMyCertificates() {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.myCertificates),
  );
  return mapCertificateList(items);
}

export async function createCertificate(data) {
  return apiClient.post(API_PATHS.professional.myCertificates, data);
}

export async function updateCertificate(id, data, method = 'patch') {
  const path = API_PATHS.professional.certificateById(id);
  return method === 'put'
    ? apiClient.put(path, data)
    : apiClient.patch(path, data);
}

export async function deleteCertificate(id) {
  return apiClient.delete(API_PATHS.professional.certificateById(id));
}

export async function uploadCertificateFile(id, file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.upload(API_PATHS.professional.certificateFile(id), formData);
}

export async function getUserCertificates() {
  // Public endpoint is not available on backend — graceful fallback.
  return [];
}

// Languages
export async function getMyLanguages() {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.myLanguages),
  );
  const languageMap = await buildLanguageMap(items);
  return mapUserLanguageList(items, languageMap);
}

export async function createLanguage(data) {
  return apiClient.post(API_PATHS.professional.myLanguages, data);
}

export async function updateLanguage(id, data, method = 'patch') {
  const path = API_PATHS.professional.userLanguageById(id);
  return method === 'put'
    ? apiClient.put(path, data)
    : apiClient.patch(path, data);
}

export async function deleteLanguage(id) {
  return apiClient.delete(API_PATHS.professional.userLanguageById(id));
}

export async function getUserLanguages() {
  // Public endpoint is not available on backend — graceful fallback.
  return [];
}

// Recommendations
export async function getUserRecommendations(userId) {
  return safeListRequest(() =>
    apiClient.get(API_PATHS.professional.userRecommendations(userId)),
  );
}

// Companies
export async function getMyCompanies() {
  const items = await safeListRequest(() =>
    apiClient.get(API_PATHS.professional.myCompanies),
  );
  return mapCompanyList(items);
}

export async function getCompanyById(companyId) {
  try {
    const company = await apiClient.get(API_PATHS.professional.companyById(companyId));
    return mapCompanyDto(company);
  } catch {
    return null;
  }
}
