import { fetchProfilesByUserIds } from "../profile/profileApi";
import { apiClient } from "../../shared/api/client";
import { unwrapPagedItems } from "../../shared/lib/pagedResponse";
import { PROFESSIONAL } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import {
  buildLinkAcademyEducationBody,
  mapEducationDtoToHistoryItem,
  normalizeEducationDto,
} from "./mapEducation";
import {
  mapExperienceDtoToHistoryItem,
  normalizeExperienceDto,
} from "./mapExperience";
import { mapAcademyDtoToHistoryItem, normalizeAcademyDto } from "./mapAcademy";
import {
  mapCertificateDtoToHistoryItem,
  normalizeCertificateDto,
} from "./mapCertificate";
import {
  buildCreateCompanyBodyFromProfileForm,
  buildUpdateCompanyBody,
  pickPrimaryCompany,
} from "./mapCompany";
import {
  mapUserLanguageToHistoryItem,
  normalizeLanguageDto,
  normalizeUserLanguageDto,
} from "./mapLanguage";
import {
  mapRecommendationToGivenItem,
  mapRecommendationToReceivedItem,
  normalizeRecommendationDto,
} from "./mapRecommendation";
import {
  normalizeRecommendedSkillDto,
  normalizeSkillDto,
  normalizeUserSkillDto,
} from "./mapSkills";

function unwrapExperienceResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Experience request failed.";
    throw new Error(String(message));
  }
  return normalizeExperienceDto(data?.experience || data?.Experience || data);
}

export async function fetchMyExperiences() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFESSIONAL.myExperiences);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeExperienceDto).filter(Boolean);
}

/** Experience rows for profile history UI (`title`, `meta`, `experienceId`). */
export async function loadMyExperienceHistoryItems() {
  const experiences = await fetchMyExperiences();
  const companyIds = experiences.map((item) => item.companyId).filter(Boolean);
  const companies = await fetchCompaniesByIds(companyIds);
  return experiences
    .map((item) => mapExperienceDtoToHistoryItem(item, companies[item.companyId]?.name || ""))
    .filter(Boolean);
}

/** `POST /api/professional/me/experiences` */
export async function createMyExperience(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(PROFESSIONAL.myExperiences, body);
  return unwrapExperienceResponse(data);
}

/** `PUT /api/professional/me/experiences/{experienceId}` */
export async function updateMyExperience(experienceId, body) {
  if (USE_MOCK_AUTH || !experienceId) return null;
  const data = await apiClient.put(PROFESSIONAL.myExperience(experienceId), body);
  return unwrapExperienceResponse(data);
}

/** `DELETE /api/professional/me/experiences/{experienceId}` */
export async function deleteMyExperience(experienceId) {
  if (USE_MOCK_AUTH || !experienceId) return null;
  const data = await apiClient.delete(PROFESSIONAL.myExperience(experienceId));
  return unwrapExperienceResponse(data);
}

function unwrapEducationResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Education request failed.";
    throw new Error(String(message));
  }
  return normalizeEducationDto(data?.education || data?.Education || data);
}

export async function fetchMyEducations() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFESSIONAL.myEducations);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeEducationDto).filter(Boolean);
}

/** Education rows for profile history UI (`title`, `meta`, `educationId`). */
export async function loadMyEducationHistoryItems() {
  const educations = await fetchMyEducations();
  return educations.map(mapEducationDtoToHistoryItem).filter(Boolean);
}

/** `POST /api/professional/me/educations` */
export async function createMyEducation(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(PROFESSIONAL.myEducations, body);
  return unwrapEducationResponse(data);
}

/** `PUT /api/professional/me/educations/{educationId}` */
export async function updateMyEducation(educationId, body) {
  if (USE_MOCK_AUTH || !educationId) return null;
  const data = await apiClient.put(PROFESSIONAL.myEducation(educationId), body);
  return unwrapEducationResponse(data);
}

/** `DELETE /api/professional/me/educations/{educationId}` */
export async function deleteMyEducation(educationId) {
  if (USE_MOCK_AUTH || !educationId) return null;
  const data = await apiClient.delete(PROFESSIONAL.myEducation(educationId));
  return unwrapEducationResponse(data);
}

function unwrapCompanyResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Company request failed.";
    throw new Error(String(message));
  }
  return normalizeCompanyDto(data?.company || data?.Company || data);
}

export function normalizeCompanyDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const id = dto.id ?? dto.Id;
  if (!id) return null;
  return {
    id: String(id),
    name: String(dto.name ?? dto.Name ?? "").trim(),
    industry: String(dto.industry ?? dto.Industry ?? "").trim(),
    location: String(dto.location ?? dto.Location ?? "").trim(),
    logoUrl: String(dto.logoUrl ?? dto.LogoUrl ?? "").trim(),
    websiteUrl: String(dto.websiteUrl ?? dto.WebsiteUrl ?? "").trim(),
    description: String(dto.description ?? dto.Description ?? "").trim(),
    createdAt: dto.createdAt ?? dto.CreatedAt,
    updatedAt: dto.updatedAt ?? dto.UpdatedAt,
  };
}

export async function fetchMyCompanies() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFESSIONAL.myCompanies);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeCompanyDto).filter(Boolean);
}

export async function createMyCompany(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(PROFESSIONAL.myCompanies, body);
  return unwrapCompanyResponse(data);
}

/** `PUT /api/professional/me/companies/{companyId}` */
export async function updateMyCompany(companyId, body) {
  if (USE_MOCK_AUTH || !companyId) return null;
  const data = await apiClient.put(PROFESSIONAL.myCompany(companyId), body);
  return unwrapCompanyResponse(data);
}

/** `PATCH /api/professional/me/companies/{companyId}` */
export async function patchMyCompany(companyId, body) {
  if (USE_MOCK_AUTH || !companyId) return null;
  const data = await apiClient.patch(PROFESSIONAL.myCompany(companyId), body);
  return unwrapCompanyResponse(data);
}

/** `DELETE /api/professional/me/companies/{companyId}` */
export async function deleteMyCompany(companyId) {
  if (USE_MOCK_AUTH || !companyId) return null;
  const data = await apiClient.delete(PROFESSIONAL.myCompany(companyId));
  return unwrapCompanyResponse(data);
}

/** Primary company for profile "Current company" field. */
export async function loadMyPrimaryCompany() {
  const companies = await fetchMyCompanies();
  return pickPrimaryCompany(companies);
}

/** Create or update the profile primary company from form fields. */
export async function savePrimaryCompanyFromForm(form, primaryCompany) {
  const name = String(form.company || "").trim();
  if (!name) return primaryCompany || null;

  const location = [form.city, form.country].map((value) => String(value || "").trim()).filter(Boolean).join(", ");
  const companies = await fetchMyCompanies();
  const existingByName = companies.find((company) => company.name.toLowerCase() === name.toLowerCase());

  if (primaryCompany?.id) {
    if (existingByName && existingByName.id !== primaryCompany.id) {
      return existingByName;
    }
    const unchanged =
      name === primaryCompany.name &&
      String(location || "") === String(primaryCompany.location || "");
    if (unchanged) return primaryCompany;

    return updateMyCompany(
      primaryCompany.id,
      buildUpdateCompanyBody(primaryCompany, { name, location }),
    );
  }

  if (existingByName) return existingByName;

  return createMyCompany(buildCreateCompanyBodyFromProfileForm(form));
}

/** Match existing company by name or create one for vacancy posting. */
export async function resolveCompanyIdByName(name, { location } = {}) {
  const trimmed = String(name || "").trim();
  if (!trimmed) throw new Error("Company name is required.");

  const companies = await fetchMyCompanies();
  const match = companies.find((company) => company.name.toLowerCase() === trimmed.toLowerCase());
  if (match) return match.id;

  const created = await createMyCompany({
    name: trimmed,
    location: String(location || "").trim() || undefined,
  });
  if (!created?.id) throw new Error("Could not create company.");
  return created.id;
}

export async function fetchCompanyById(companyId) {
  if (USE_MOCK_AUTH || !companyId) return null;
  try {
    const data = await apiClient.get(PROFESSIONAL.company(companyId));
    return normalizeCompanyDto(data);
  } catch {
    return null;
  }
}

export async function fetchCompaniesByIds(companyIds = []) {
  const unique = [...new Set(companyIds.filter(Boolean).map(String))];
  const entries = await Promise.all(unique.map(async (id) => [id, await fetchCompanyById(id)]));
  return Object.fromEntries(entries);
}

export { mapExperienceDtoToHistoryItem } from "./mapExperience";

export async function fetchMyUserSkills() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFESSIONAL.mySkills);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeUserSkillDto).filter(Boolean);
}

export async function searchSkills(query = "", pageSize = 20) {
  if (USE_MOCK_AUTH) return [];
  const params = new URLSearchParams({ page: "1", pageSize: String(pageSize) });
  const trimmed = String(query || "").trim();
  if (trimmed) params.set("search", trimmed);
  const data = await apiClient.get(`${PROFESSIONAL.skills}?${params.toString()}`);
  return unwrapPagedItems(data, normalizeSkillDto);
}

export async function fetchSkillById(skillId) {
  if (USE_MOCK_AUTH || !skillId) return null;
  try {
    const data = await apiClient.get(PROFESSIONAL.skill(skillId));
    return normalizeSkillDto(data);
  } catch {
    return null;
  }
}

/** `GET /api/professional/recommended-skills?position=` */
export async function fetchRecommendedSkillsByPosition(position) {
  const trimmed = String(position || "").trim();
  if (USE_MOCK_AUTH || !trimmed) return [];
  const params = new URLSearchParams({ position: trimmed });
  const data = await apiClient.get(`${PROFESSIONAL.recommendedSkills}?${params.toString()}`);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeRecommendedSkillDto).filter(Boolean);
}

export async function loadRecommendedSkillSuggestions(position, { excludeSkillIds = [] } = {}) {
  const recommended = await fetchRecommendedSkillsByPosition(position);
  const excluded = new Set(excludeSkillIds.map(String));
  const items = await Promise.all(
    recommended
      .filter((item) => !excluded.has(String(item.skillId)))
      .map(async (item) => fetchSkillById(item.skillId)),
  );
  return items.filter(Boolean).slice(0, 8);
}

export async function createMyUserSkill(skillId, level = "intermediate") {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(PROFESSIONAL.mySkills, {
    skillId,
    level,
    isMain: false,
    orderIndex: 0,
  });
  return data?.userSkill || data;
}

export async function deleteMyUserSkill(userSkillId) {
  if (USE_MOCK_AUTH || !userSkillId) return;
  await apiClient.delete(PROFESSIONAL.mySkill(userSkillId));
}

async function resolveUserSkillsWithNames(userSkills = []) {
  return Promise.all(
    userSkills.map(async (userSkill) => {
      const normalized = normalizeUserSkillDto(userSkill) || userSkill;
      const catalog = await fetchSkillById(normalized.skillId);
      return {
        userSkillId: normalized.id,
        skillId: normalized.skillId,
        name: catalog?.name || String(normalized.skillId),
        level: normalized.level,
      };
    }),
  );
}

/** User skills with resolved catalog names for profile UI. */
export async function loadMySkillsWithNames() {
  return resolveUserSkillsWithNames(await fetchMyUserSkills());
}

export async function fetchUserExperiences(userId) {
  if (USE_MOCK_AUTH || !userId) return [];
  try {
    const data = await apiClient.get(PROFESSIONAL.userExperiences(userId));
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeExperienceDto).filter(Boolean);
  } catch {
    return [];
  }
}

/** Experience rows for another user's profile (`title`, `meta`, `experienceId`). */
export async function loadUserExperienceHistoryItems(userId) {
  const experiences = await fetchUserExperiences(userId);
  if (!experiences.length) return [];
  const companyMap = await fetchCompaniesByIds(experiences.map((item) => item.companyId));
  return experiences
    .map((item) => mapExperienceDtoToHistoryItem(item, companyMap[item.companyId]?.name || ""))
    .filter(Boolean);
}

export async function fetchUserEducations(userId) {
  if (USE_MOCK_AUTH || !userId) return [];
  try {
    const data = await apiClient.get(PROFESSIONAL.userEducations(userId));
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeEducationDto).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchUserSkills(userId) {
  if (USE_MOCK_AUTH || !userId) return [];
  try {
    const data = await apiClient.get(PROFESSIONAL.userSkills(userId));
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeUserSkillDto).filter(Boolean);
  } catch {
    return [];
  }
}

export async function loadUserSkillsWithNames(userId) {
  return resolveUserSkillsWithNames(await fetchUserSkills(userId));
}

function unwrapCertificateResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Certificate request failed.";
    throw new Error(String(message));
  }
  return normalizeCertificateDto(data?.certificate || data?.Certificate || data);
}

export async function fetchMyCertificates() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFESSIONAL.myCertificates);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeCertificateDto).filter(Boolean);
}

export async function loadMyCertificateHistoryItems() {
  return fetchMyCertificates().then((items) =>
    items.map(mapCertificateDtoToHistoryItem).filter(Boolean),
  );
}

export async function createMyCertificate(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(PROFESSIONAL.myCertificates, body);
  return unwrapCertificateResponse(data);
}

export async function deleteMyCertificate(certificateId) {
  if (USE_MOCK_AUTH || !certificateId) return null;
  const data = await apiClient.delete(PROFESSIONAL.myCertificate(certificateId));
  return unwrapCertificateResponse(data);
}

function unwrapUserLanguageResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Language request failed.";
    throw new Error(String(message));
  }
  return normalizeUserLanguageDto(data?.userLanguage || data?.UserLanguage || data);
}

export async function fetchMyUserLanguages() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFESSIONAL.myLanguages);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeUserLanguageDto).filter(Boolean);
}

export async function searchLanguages(query = "", pageSize = 20) {
  if (USE_MOCK_AUTH) return [];
  const params = new URLSearchParams({ page: "1", pageSize: String(pageSize) });
  const trimmed = String(query || "").trim();
  if (trimmed) params.set("search", trimmed);
  const data = await apiClient.get(`${PROFESSIONAL.languages}?${params.toString()}`);
  return unwrapPagedItems(data, normalizeLanguageDto);
}

export async function fetchLanguageById(languageId) {
  if (USE_MOCK_AUTH || !languageId) return null;
  try {
    const data = await apiClient.get(PROFESSIONAL.language(languageId));
    return normalizeLanguageDto(data);
  } catch {
    return null;
  }
}

export async function createMyUserLanguage(languageId, level = "") {
  if (USE_MOCK_AUTH || !languageId) return null;
  const data = await apiClient.post(PROFESSIONAL.myLanguages, {
    languageId,
    level: String(level || "").trim() || undefined,
  });
  return unwrapUserLanguageResponse(data);
}

export async function deleteMyUserLanguage(userLanguageId) {
  if (USE_MOCK_AUTH || !userLanguageId) return;
  await apiClient.delete(PROFESSIONAL.myLanguage(userLanguageId));
}

async function resolveUserLanguagesWithNames(userLanguages = []) {
  return Promise.all(
    userLanguages.map(async (userLanguage) => {
      const normalized = normalizeUserLanguageDto(userLanguage) || userLanguage;
      const catalog = await fetchLanguageById(normalized.languageId);
      const row = mapUserLanguageToHistoryItem(normalized, catalog?.name || "");
      return row
        ? {
            userLanguageId: row.userLanguageId,
            languageId: row.languageId,
            name: row.title,
            level: normalized.level,
            title: row.title,
            meta: row.meta,
          }
        : null;
    }),
  ).then((items) => items.filter(Boolean));
}

export async function loadMyUserLanguagesWithNames() {
  return resolveUserLanguagesWithNames(await fetchMyUserLanguages());
}

export async function searchAcademies(query = "", pageSize = 20) {
  if (USE_MOCK_AUTH) return [];
  const params = new URLSearchParams({ page: "1", pageSize: String(pageSize) });
  const trimmed = String(query || "").trim();
  if (trimmed) params.set("search", trimmed);
  const data = await apiClient.get(`${PROFESSIONAL.academies}?${params.toString()}`);
  return unwrapPagedItems(data, normalizeAcademyDto);
}

export async function fetchAcademyById(academyId) {
  if (USE_MOCK_AUTH || !academyId) return null;
  try {
    const data = await apiClient.get(PROFESSIONAL.academy(academyId));
    return normalizeAcademyDto(data);
  } catch {
    return null;
  }
}

/** Academies linked via education or certificate records. */
export async function loadMyAffiliatedAcademies() {
  const [educations, certificates] = await Promise.all([fetchMyEducations(), fetchMyCertificates()]);
  const ids = [
    ...new Set(
      [...educations.map((item) => item.academyId), ...certificates.map((item) => item.academyId)].filter(Boolean),
    ),
  ];
  const academies = await Promise.all(ids.map((id) => fetchAcademyById(id)));
  const unique = new Map();
  academies.filter(Boolean).forEach((academy) => {
    unique.set(academy.id, mapAcademyDtoToHistoryItem(academy));
  });
  return [...unique.values()].filter(Boolean);
}

/** Link academy catalog entry to profile through an education affiliation row. */
export async function linkAcademyAffiliation(academy) {
  if (USE_MOCK_AUTH || !academy?.id) return null;
  return createMyEducation(buildLinkAcademyEducationBody(academy));
}

/** Remove education rows that reference the given academy. */
export async function unlinkAcademyAffiliation(academyId) {
  if (USE_MOCK_AUTH || !academyId) return;
  const educations = await fetchMyEducations();
  const linked = educations.filter((item) => String(item.academyId) === String(academyId));
  await Promise.all(linked.map((item) => deleteMyEducation(item.id)));
}

function unwrapRecommendationResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Recommendation request failed.";
    throw new Error(String(message));
  }
  return normalizeRecommendationDto(data?.recommendation || data?.Recommendation || data);
}

function profileDisplayName(profile, fallbackId = "") {
  return (
    profile?.fullName?.trim() ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    (fallbackId ? `User ${String(fallbackId).slice(0, 8)}` : "")
  );
}

export async function fetchUserRecommendations(userId) {
  if (USE_MOCK_AUTH || !userId) return [];
  const data = await apiClient.get(PROFESSIONAL.userRecommendations(userId));
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeRecommendationDto).filter(Boolean);
}

export async function loadReceivedRecommendationItems(userId) {
  const recommendations = await fetchUserRecommendations(userId);
  const authorIds = [...new Set(recommendations.map((item) => item.authorId).filter(Boolean))];
  const profiles = await fetchProfilesByUserIds(authorIds);
  return recommendations
    .map((item) =>
      mapRecommendationToReceivedItem(item, profileDisplayName(profiles[item.authorId], item.authorId)),
    )
    .filter(Boolean);
}

export async function loadGivenRecommendationItems(authorId, contactUserIds = []) {
  if (USE_MOCK_AUTH || !authorId) return [];
  const uniqueContacts = [
    ...new Set(contactUserIds.filter(Boolean).map(String)),
  ].filter((id) => id !== String(authorId));
  if (!uniqueContacts.length) return [];

  const lists = await Promise.all(uniqueContacts.map((id) => fetchUserRecommendations(id)));
  const written = [];
  lists.forEach((recommendations) => {
    recommendations.forEach((item) => {
      if (String(item.authorId) === String(authorId)) {
        written.push(item);
      }
    });
  });

  const recipientIds = [...new Set(written.map((item) => item.userId).filter(Boolean))];
  const profiles = await fetchProfilesByUserIds(recipientIds);
  return written
    .map((item) =>
      mapRecommendationToGivenItem(item, profileDisplayName(profiles[item.userId], item.userId)),
    )
    .filter(Boolean);
}

export async function createRecommendation(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(PROFESSIONAL.recommendations, body);
  return unwrapRecommendationResponse(data);
}

export async function patchRecommendation(recommendationId, body) {
  if (USE_MOCK_AUTH || !recommendationId) return null;
  const data = await apiClient.patch(PROFESSIONAL.recommendation(recommendationId), body);
  return unwrapRecommendationResponse(data);
}

export async function deleteRecommendation(recommendationId) {
  if (USE_MOCK_AUTH || !recommendationId) return null;
  const data = await apiClient.delete(PROFESSIONAL.recommendation(recommendationId));
  return unwrapRecommendationResponse(data);
}

export { mapEducationDtoToHistoryItem } from "./mapEducation";
