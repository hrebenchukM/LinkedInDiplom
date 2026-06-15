import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import {
  extractProfileFromUploadResponse,
  mapProfileDto,
  mapProfileSearchResult,
  mapProfileViewsResponse,
} from './mapProfile.js';

export async function getMyProfile() {
  const dto = await apiClient.get(API_PATHS.profile.me);
  return mapProfileDto(dto);
}

export async function updateMyProfile(data, method = 'patch') {
  const response =
    method === 'put'
      ? await apiClient.put(API_PATHS.profile.me, data)
      : await apiClient.patch(API_PATHS.profile.me, data);

  const profileDto = response?.profile ?? response?.Profile ?? response;
  return mapProfileDto(profileDto) ?? response;
}

export async function getProfileByUserId(userId) {
  const dto = await apiClient.get(API_PATHS.profile.byUserId(userId));
  return mapProfileDto(dto);
}

export async function searchProfiles(params = {}) {
  const text = String(params.query ?? params.search ?? '').trim();
  const query = buildPaginationQuery({
    page: params.page,
    pageSize: params.pageSize ?? params.limit,
    extra: {
      query: text || undefined,
      location: params.location,
    },
  });
  const response = await apiClient.get(API_PATHS.profile.search, { query });
  return mapProfileSearchResult(response);
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload(API_PATHS.profile.avatar, formData);
  return extractProfileFromUploadResponse(response) ?? getMyProfile();
}

export async function uploadHeader(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload(API_PATHS.profile.header, formData);
  return extractProfileFromUploadResponse(response) ?? getMyProfile();
}

export async function getProfileViews() {
  const response = await apiClient.get(API_PATHS.profile.profileViews);
  return mapProfileViewsResponse(response);
}

export async function getMessageSettings() {
  return apiClient.get(API_PATHS.profile.messageSettings);
}

export async function updateMessageSettings(data, method = 'put') {
  return method === 'patch'
    ? apiClient.patch(API_PATHS.profile.messageSettings, data)
    : apiClient.put(API_PATHS.profile.messageSettings, data);
}

export async function resolveProfileUserId(identifier) {
  if (!identifier) return null;

  try {
    const profile = await getProfileByUserId(identifier);
    return profile?.userId ?? profile?.user?.id ?? identifier;
  } catch {
    const results = await searchProfiles({ query: identifier, pageSize: 5 });
    const exact = results.find(
      (item) =>
        item.userId === identifier ||
        item.displayName?.toLowerCase() === identifier.toLowerCase(),
    );
    return exact?.userId ?? results[0]?.userId ?? null;
  }
}
