import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import { mapVacancySortBy, normalizeSortDirection, DEFAULT_VACANCY_QUERY } from '../../shared/api/sortParams.js';
import {
  mapApplicationDto,
  mapApplicationList,
  mapFavoriteDto,
  mapFavoriteList,
  mapRecommendedQueryList,
  mapVacancyDto,
  mapVacancyListResponse,
} from './mapJobs.js';

function unwrapVacancy(response) {
  const vacancy = response?.vacancy ?? response?.Vacancy ?? response;
  return mapVacancyDto(vacancy);
}

function buildVacancyQuery(params = {}) {
  const {
    page,
    pageSize,
    query,
    search,
    sortBy,
    sortDirection,
    filters: _filters,
    favoriteIds: _favoriteIds,
    appliedIds: _appliedIds,
    companyId,
    location,
    employmentType,
    schedule,
    postedByUserId,
    fromCreatedAt,
    toCreatedAt,
  } = params;

  const mappedSortBy = mapVacancySortBy(sortBy) ?? DEFAULT_VACANCY_QUERY.sortBy;
  const mappedSortDirection =
    normalizeSortDirection(sortDirection) ?? DEFAULT_VACANCY_QUERY.sortDirection;

  const extra = {};
  if (companyId) extra.companyId = companyId;
  if (location) extra.location = location;
  if (employmentType) extra.employmentType = employmentType;
  if (schedule) extra.schedule = schedule;
  if (postedByUserId) extra.postedByUserId = postedByUserId;
  if (fromCreatedAt) extra.fromCreatedAt = fromCreatedAt;
  if (toCreatedAt) extra.toCreatedAt = toCreatedAt;

  return buildPaginationQuery({
    page,
    pageSize,
    query: query ?? search,
    sortBy: mappedSortBy,
    sortDirection: mappedSortDirection,
    extra,
  });
}

// Vacancies
export async function getVacancies(params = {}) {
  const query = buildVacancyQuery(params);
  const response = await apiClient.get(API_PATHS.jobs.vacancies, { query });
  return mapVacancyListResponse(response, {
    favoriteIds: params.favoriteIds,
    appliedIds: params.appliedIds,
  });
}

export async function getVacancyById(vacancyId) {
  const response = await apiClient.get(API_PATHS.jobs.vacancyById(vacancyId));
  return mapVacancyDto(response);
}

export async function createVacancy(data) {
  const response = await apiClient.post(API_PATHS.jobs.myVacancies, data);
  return unwrapVacancy(response);
}

export async function updateVacancy(vacancyId, data, method = 'patch') {
  const path = API_PATHS.jobs.myVacancyById(vacancyId);
  const response = method === 'put'
    ? await apiClient.put(path, data)
    : await apiClient.patch(path, data);
  return unwrapVacancy(response);
}

export async function deleteVacancy(vacancyId) {
  return apiClient.delete(API_PATHS.jobs.myVacancyById(vacancyId));
}

// Applications
export async function applyToVacancy(vacancyId) {
  return apiClient.post(API_PATHS.jobs.apply(vacancyId));
}

export async function getMyApplications(params = {}) {
  try {
    const response = await apiClient.get(API_PATHS.jobs.applications);
    return mapApplicationList(response);
  } catch {
    return [];
  }
}

export async function getApplicationById(applicationId) {
  const applications = await getMyApplications();
  return applications.find((item) => item.id === applicationId) ?? null;
}

// Favorites
export async function getMyFavoriteVacancies() {
  try {
    const response = await apiClient.get(API_PATHS.jobs.favorites);
    return mapFavoriteList(response);
  } catch {
    return [];
  }
}

export async function addVacancyToFavorites(vacancyId) {
  return apiClient.post(API_PATHS.jobs.favoriteByVacancyId(vacancyId));
}

export async function removeVacancyFromFavorites(vacancyId) {
  return apiClient.delete(API_PATHS.jobs.favoriteByVacancyId(vacancyId));
}

// Recommended
export async function getRecommendedJobQueries() {
  try {
    const response = await apiClient.get(API_PATHS.jobs.recommendedQueries);
    return mapRecommendedQueryList(response);
  } catch {
    return [];
  }
}

export async function loadVacancyMeta() {
  const [favorites, applications] = await Promise.all([
    getMyFavoriteVacancies(),
    getMyApplications(),
  ]);

  const favoriteIds = new Set(
    favorites
      .map((item) => item.vacancyId ?? item.vacancy?.id)
      .filter(Boolean),
  );

  const appliedIds = new Set(
    applications
      .map((item) => item.vacancyId ?? item.vacancy?.id)
      .filter(Boolean),
  );

  return { favoriteIds, appliedIds, favorites, applications };
}

export {
  mapApplicationDto,
  mapFavoriteDto,
  mapVacancyDto,
};
