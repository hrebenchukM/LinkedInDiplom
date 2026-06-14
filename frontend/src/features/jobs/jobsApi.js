import { apiClient } from "../../shared/api/client";
import { JOBS } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { EMPTY_PAGED, unwrapPagedItems, unwrapPagedResponse } from "../../shared/lib/pagedResponse";
import {
  normalizeRecommendedQueryDto,
  normalizeSearchQueryDto,
  normalizeVacancyDto,
} from "./mapJobs";

function buildVacanciesQuery({
  query,
  location,
  companyId,
  postedByUserId,
  employmentType,
  schedule,
  minSalaryFrom,
  sortBy,
  sortDirection,
  page = 1,
  pageSize = 50,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: String(sortBy || "createdAt"),
    sortDirection: String(sortDirection || "desc"),
  });
  if (query) params.set("query", String(query));
  if (location) params.set("location", String(location));
  if (companyId) params.set("companyId", String(companyId));
  if (postedByUserId) params.set("postedByUserId", String(postedByUserId));
  if (employmentType) params.set("employmentType", String(employmentType));
  if (schedule) params.set("schedule", String(schedule));
  if (minSalaryFrom != null) params.set("minSalaryFrom", String(minSalaryFrom));
  return params.toString();
}

function unwrapSearchQueryResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Search query request failed.";
    throw new Error(String(message));
  }
  const raw = data?.searchQuery || data?.SearchQuery || data;
  return normalizeSearchQueryDto(raw);
}

function unwrapVacancyResponse(data) {
  if (data?.success === false) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Vacancy request failed.";
    throw new Error(String(message));
  }
  return data?.vacancy || data?.Vacancy || data;
}

/** `GET /api/jobs/me/search-queries` */
export async function fetchMySearchQueries() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(JOBS.mySearchQueries);
  return unwrapPagedItems(data, normalizeSearchQueryDto);
}

/** `POST /api/jobs/me/search-queries` */
export async function createSearchQuery(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(JOBS.mySearchQueries, body);
  return unwrapSearchQueryResponse(data);
}

/** `DELETE /api/jobs/me/search-queries/{searchId}` */
export async function deleteSearchQuery(searchId) {
  if (USE_MOCK_AUTH || !searchId) return null;
  const data = await apiClient.delete(JOBS.mySearchQuery(searchId));
  return unwrapSearchQueryResponse(data);
}

/** `GET /api/jobs/recommended-queries` */
export async function fetchRecommendedQueries() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(JOBS.recommendedQueries);
  return unwrapPagedItems(data, normalizeRecommendedQueryDto);
}

/** `GET /api/jobs/vacancies` — returns paged normalized vacancy DTOs. */
export async function fetchVacancies({
  query,
  location,
  companyId,
  postedByUserId,
  employmentType,
  schedule,
  minSalaryFrom,
  sortBy,
  sortDirection,
  page = 1,
  pageSize = 50,
} = {}) {
  if (USE_MOCK_AUTH) return { ...EMPTY_PAGED, page, pageSize };
  const qs = buildVacanciesQuery({
    query,
    location,
    companyId,
    postedByUserId,
    employmentType,
    schedule,
    minSalaryFrom,
    sortBy,
    sortDirection,
    page,
    pageSize,
  });
  const data = await apiClient.get(`${JOBS.vacancies}?${qs}`);
  return unwrapPagedResponse(data, normalizeVacancyDto);
}

/** `POST /api/jobs/me/vacancies` */
export async function createVacancy(body) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(JOBS.createVacancy, body);
  return unwrapVacancyResponse(data);
}

/** `PATCH /api/jobs/me/vacancies/{vacancyId}` */
export async function updateVacancy(vacancyId, body) {
  if (USE_MOCK_AUTH || !vacancyId) return null;
  const data = await apiClient.patch(JOBS.myVacancy(vacancyId), body);
  return unwrapVacancyResponse(data);
}

/** `DELETE /api/jobs/me/vacancies/{vacancyId}` */
export async function deleteVacancy(vacancyId) {
  if (USE_MOCK_AUTH || !vacancyId) return null;
  const data = await apiClient.delete(JOBS.myVacancy(vacancyId));
  return unwrapVacancyResponse(data);
}

/** `GET /api/jobs/vacancies/{vacancyId}` */
export async function fetchVacancyById(vacancyId) {
  if (USE_MOCK_AUTH || !vacancyId) return null;
  const data = await apiClient.get(JOBS.vacancy(vacancyId));
  return normalizeVacancyDto(unwrapVacancyResponse(data));
}

export async function applyToVacancy(vacancyId) {
  if (USE_MOCK_AUTH) return { success: true };
  return apiClient.post(JOBS.apply(vacancyId));
}

export async function fetchMyApplications() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(JOBS.myApplications);
  return unwrapPagedItems(data, (item) => item);
}

/** `DELETE /api/jobs/me/applications/{applicationId}` */
export async function withdrawApplication(applicationId) {
  if (USE_MOCK_AUTH || !applicationId) return null;
  return apiClient.delete(JOBS.myApplication(applicationId));
}

export async function fetchMyFavorites() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(JOBS.myFavorites);
  return unwrapPagedItems(data, (item) => item);
}

export async function addFavorite(vacancyId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.post(JOBS.favorite(vacancyId));
}

export async function removeFavorite(vacancyId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(JOBS.favorite(vacancyId));
}
