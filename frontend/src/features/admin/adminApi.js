import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import {
  mapAdminCommentsResponse,
  mapAdminEventsResponse,
  mapAdminPostsResponse,
  mapAdminRoleList,
  mapAdminStatsDto,
  mapAdminUserDto,
  mapAdminUsersResponse,
  mapAdminVacanciesResponse,
} from './mapAdmin.js';

function buildAdminQuery(params = {}) {
  const {
    page,
    pageSize,
    limit,
    search,
    query,
    email,
    role,
    isDeleted,
    isLocked,
    includeDeleted,
    sortBy,
    sortDirection,
    ...rest
  } = params;

  return buildPaginationQuery({
    page,
    pageSize: pageSize ?? limit,
    search: search ?? query,
    sortBy,
    sortDirection,
    extra: {
      email,
      role,
      isDeleted,
      isLocked,
      includeDeleted,
      ...rest,
    },
  });
}

// Stats
export async function getAdminStatsOverview() {
  const response = await apiClient.get(API_PATHS.admin.stats.overview);
  return mapAdminStatsDto(response);
}

// Users
export async function getAdminUsers(params = {}) {
  const query = buildAdminQuery(params);
  const response = await apiClient.get(API_PATHS.admin.users.list, { query });
  return mapAdminUsersResponse(response);
}

export async function getAdminUserById(userId) {
  const response = await apiClient.get(API_PATHS.admin.users.byId(userId));
  return mapAdminUserDto(response);
}

export async function lockUser(userId, data = {}) {
  return apiClient.patch(API_PATHS.admin.users.lock(userId), data);
}

export async function unlockUser(userId) {
  return apiClient.patch(API_PATHS.admin.users.unlock(userId));
}

export async function deleteUser(userId) {
  return apiClient.delete(API_PATHS.admin.users.byId(userId));
}

export async function restoreUser(userId) {
  return apiClient.patch(API_PATHS.admin.users.restore(userId));
}

// Roles
export async function getAdminRoles() {
  try {
    const response = await apiClient.get(API_PATHS.admin.roles.list);
    const roles = mapAdminRoleList(response);
    return roles.length > 0 ? roles : [{ id: 'Admin', name: 'Admin' }, { id: 'User', name: 'User' }];
  } catch {
    return [{ id: 'Admin', name: 'Admin' }, { id: 'User', name: 'User' }];
  }
}

export async function assignUserRole(userId, roleName) {
  return apiClient.post(API_PATHS.admin.users.roles(userId), {
    roleName,
  });
}

export async function removeUserRole(userId, roleName) {
  return apiClient.delete(API_PATHS.admin.users.roleByName(userId, roleName));
}

// Content
export async function getAdminPosts(params = {}) {
  const query = buildAdminQuery(params);
  const response = await apiClient.get(API_PATHS.admin.content.posts, { query });
  return mapAdminPostsResponse(response);
}

export async function deleteAdminPost(postId) {
  return apiClient.delete(API_PATHS.admin.content.postById(postId));
}

export async function restoreAdminPost(postId) {
  return apiClient.patch(API_PATHS.admin.content.restorePost(postId));
}

export async function getAdminComments(params = {}) {
  const query = buildAdminQuery(params);
  const response = await apiClient.get(API_PATHS.admin.content.comments, { query });
  return mapAdminCommentsResponse(response);
}

export async function deleteAdminComment(commentId) {
  return apiClient.delete(API_PATHS.admin.content.commentById(commentId));
}

export async function restoreAdminComment(commentId) {
  return apiClient.patch(API_PATHS.admin.content.restoreComment(commentId));
}

// Jobs
export async function getAdminVacancies(params = {}) {
  const query = buildAdminQuery(params);
  const response = await apiClient.get(API_PATHS.admin.jobs.vacancies, { query });
  return mapAdminVacanciesResponse(response);
}

export async function deleteAdminVacancy(vacancyId) {
  return apiClient.delete(API_PATHS.admin.jobs.vacancyById(vacancyId));
}

export async function restoreAdminVacancy(vacancyId) {
  return apiClient.patch(API_PATHS.admin.jobs.restoreVacancy(vacancyId));
}

// Events
export async function getAdminEvents(params = {}) {
  const query = buildAdminQuery(params);
  const response = await apiClient.get(API_PATHS.admin.events.list, { query });
  return mapAdminEventsResponse(response);
}

export async function deleteAdminEvent(eventId) {
  return apiClient.delete(API_PATHS.admin.events.byId(eventId));
}

export async function restoreAdminEvent(eventId) {
  return apiClient.patch(API_PATHS.admin.events.restore(eventId));
}
