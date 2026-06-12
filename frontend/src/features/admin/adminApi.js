import { apiClient } from "../../shared/api/client";
import { apiFetch } from "../../shared/api/http";
import { AUTH, ADMIN } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { readApiError } from "../../shared/lib/apiError";
import { EMPTY_PAGED, unwrapPagedResponse } from "../../shared/lib/pagedResponse";
import {
  normalizeAdminCommentDto,
  normalizeAdminEventDto,
  normalizeAdminPostDto,
  normalizeAdminStatsDto,
  normalizeAdminUserDto,
  normalizeAdminVacancyDto,
  normalizeRecommendedQueryDto,
  normalizeRoleDto,
} from "./mapAdmin";

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchStatsOverview() {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.get(ADMIN.statsOverview);
  return normalizeAdminStatsDto(data);
}

export async function fetchAdminUsers({
  page = 1,
  pageSize = 20,
  email = "",
  role = "",
  isDeleted,
  isLocked,
  sortBy = "createdAt",
  sortDirection = "desc",
} = {}) {
  if (USE_MOCK_AUTH) return EMPTY_PAGED;
  const qs = buildQuery({
    page,
    pageSize,
    email: email || undefined,
    role: role || undefined,
    isDeleted: isDeleted === undefined ? undefined : String(isDeleted),
    isLocked: isLocked === undefined ? undefined : String(isLocked),
    sortBy,
    sortDirection,
  });
  const data = await apiClient.get(`${ADMIN.users}${qs}`);
  return unwrapPagedResponse(data, normalizeAdminUserDto);
}

export async function fetchAdminUser(userId) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.get(ADMIN.user(userId));
  return normalizeAdminUserDto(data);
}

export async function lockUser(userId, lockoutEnd) {
  if (USE_MOCK_AUTH) return null;
  const body = lockoutEnd ? { lockoutEnd } : {};
  return apiClient.patch(ADMIN.lockUser(userId), body, { feedback: false });
}

export async function unlockUser(userId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(ADMIN.unlockUser(userId), {}, { feedback: false });
}

export async function restoreUser(userId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(ADMIN.restoreUser(userId), {}, { feedback: false });
}

export async function deleteUser(userId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(ADMIN.user(userId), { feedback: false });
}

export async function fetchUserRoles(userId) {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(ADMIN.userRoles(userId));
  if (Array.isArray(data)) return data.map(String);
  return [];
}

export async function addUserRole(userId, roleName) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.post(ADMIN.userRoles(userId), { roleName }, { feedback: false });
}

export async function removeUserRole(userId, roleName) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(ADMIN.userRole(userId, roleName), { feedback: false });
}

export async function fetchAdminRoles() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(ADMIN.roles);
  const items = Array.isArray(data) ? data : data?.items || data?.Items || [];
  return items.map(normalizeRoleDto).filter(Boolean);
}

/** Creates account via public register API, then optionally assigns a role (admin session unchanged). */
export async function createUser({ email, password, roleName }) {
  if (USE_MOCK_AUTH) {
    throw new Error("User creation is not available in mock auth mode.");
  }
  const { ok, data } = await apiFetch("POST", AUTH.register, { email, password });
  if (!ok || data?.success === false) {
    throw new Error(readApiError(data, "Registration failed."));
  }
  const account = data?.account ?? data?.Account;
  const userId = account?.id ?? account?.Id;
  if (!userId) {
    throw new Error("User was created but the server did not return an id.");
  }
  const normalizedRole = String(roleName || "").trim();
  if (normalizedRole && normalizedRole !== "User") {
    await addUserRole(userId, normalizedRole);
  }
  return {
    id: String(userId),
    email: account?.email ?? account?.Email ?? email,
  };
}

export async function fetchAdminPosts({
  page = 1,
  pageSize = 20,
  search = "",
  isDeleted,
  includeDeleted = true,
  sortBy = "createdAt",
  sortDirection = "desc",
} = {}) {
  if (USE_MOCK_AUTH) return EMPTY_PAGED;
  const qs = buildQuery({
    page,
    pageSize,
    search: search || undefined,
    isDeleted: isDeleted === undefined ? undefined : String(isDeleted),
    includeDeleted: String(includeDeleted),
    sortBy,
    sortDirection,
  });
  const data = await apiClient.get(`${ADMIN.posts}${qs}`);
  return unwrapPagedResponse(data, normalizeAdminPostDto);
}

export async function deletePost(postId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(ADMIN.post(postId), { feedback: false });
}

export async function restorePost(postId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(ADMIN.restorePost(postId), {}, { feedback: false });
}

export async function fetchAdminComments({
  page = 1,
  pageSize = 20,
  query = "",
  isDeleted,
  includeDeleted = true,
  sortBy = "createdAt",
  sortDirection = "desc",
} = {}) {
  if (USE_MOCK_AUTH) return EMPTY_PAGED;
  const qs = buildQuery({
    page,
    pageSize,
    query: query || undefined,
    isDeleted: isDeleted === undefined ? undefined : String(isDeleted),
    includeDeleted: String(includeDeleted),
    sortBy,
    sortDirection,
  });
  const data = await apiClient.get(`${ADMIN.comments}${qs}`);
  return unwrapPagedResponse(data, normalizeAdminCommentDto);
}

export async function deleteComment(commentId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(ADMIN.comment(commentId), { feedback: false });
}

export async function restoreComment(commentId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(ADMIN.restoreComment(commentId), {}, { feedback: false });
}

export async function fetchAdminEvents({
  page = 1,
  pageSize = 20,
  query = "",
  isDeleted,
  includeDeleted = true,
  sortBy = "createdAt",
  sortDirection = "desc",
} = {}) {
  if (USE_MOCK_AUTH) return EMPTY_PAGED;
  const qs = buildQuery({
    page,
    pageSize,
    query: query || undefined,
    isDeleted: isDeleted === undefined ? undefined : String(isDeleted),
    includeDeleted: String(includeDeleted),
    sortBy,
    sortDirection,
  });
  const data = await apiClient.get(`${ADMIN.events}${qs}`);
  return unwrapPagedResponse(data, normalizeAdminEventDto);
}

export async function deleteEvent(eventId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(ADMIN.event(eventId), { feedback: false });
}

export async function restoreEvent(eventId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(ADMIN.restoreEvent(eventId), {}, { feedback: false });
}

export async function fetchAdminVacancies({
  page = 1,
  pageSize = 20,
  search = "",
  isDeleted,
  includeDeleted = true,
  sortBy = "createdAt",
  sortDirection = "desc",
} = {}) {
  if (USE_MOCK_AUTH) return EMPTY_PAGED;
  const qs = buildQuery({
    page,
    pageSize,
    search: search || undefined,
    isDeleted: isDeleted === undefined ? undefined : String(isDeleted),
    includeDeleted: String(includeDeleted),
    sortBy,
    sortDirection,
  });
  const data = await apiClient.get(`${ADMIN.vacancies}${qs}`);
  return unwrapPagedResponse(data, normalizeAdminVacancyDto);
}

export async function deleteVacancy(vacancyId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(ADMIN.vacancy(vacancyId), { feedback: false });
}

export async function restoreVacancy(vacancyId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.patch(ADMIN.restoreVacancy(vacancyId), {}, { feedback: false });
}

export async function fetchRecommendedQueries() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(ADMIN.recommendedQueries);
  const items = Array.isArray(data) ? data : data?.items || data?.Items || [];
  return items.map(normalizeRecommendedQueryDto).filter(Boolean);
}

export async function createRecommendedQuery(query) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(ADMIN.recommendedQueries, { query }, { feedback: false });
  return normalizeRecommendedQueryDto(data);
}

export async function deleteRecommendedQuery(id) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(ADMIN.recommendedQuery(id), { feedback: false });
}
