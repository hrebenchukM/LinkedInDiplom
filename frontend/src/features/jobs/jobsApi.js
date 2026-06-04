import { apiClient } from "../../shared/api/client";
import { JOBS } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

export async function fetchVacancies({ query, location, companyId } = {}) {
  if (USE_MOCK_AUTH) return [];
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (location) params.set("location", location);
  if (companyId) params.set("companyId", companyId);
  const qs = params.toString();
  const path = qs ? `${JOBS.vacancies}?${qs}` : JOBS.vacancies;
  const data = await apiClient.get(path);
  return Array.isArray(data) ? data : [];
}

export async function applyToVacancy(vacancyId) {
  if (USE_MOCK_AUTH) return { success: true };
  return apiClient.post(JOBS.apply(vacancyId));
}

export async function fetchMyApplications() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(JOBS.myApplications);
  return Array.isArray(data) ? data : [];
}

export async function fetchMyFavorites() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(JOBS.myFavorites);
  return Array.isArray(data) ? data : [];
}

export async function addFavorite(vacancyId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.post(JOBS.favorite(vacancyId));
}

export async function removeFavorite(vacancyId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(JOBS.favorite(vacancyId));
}
