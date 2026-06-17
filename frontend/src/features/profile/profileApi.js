import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import { clearAuthorCache } from '../content/enrichPostsWithAuthors.js';
import {
  extractProfileFromApiResponse,
  extractProfileFromUploadResponse,
  mapProfileDto,
  mapProfileSearchResult,
  mapProfileViewsResponse,
  mergeProfileUpdate,
} from './mapProfile.js';

export const PROFILE_UPDATED_EVENT = 'linkup:profile-updated';

export function publishProfileUpdate(profile, setProfile) {
  if (!profile) return null;

  setProfile?.(profile);
  clearProfileCache();
  clearAuthorCache();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { profile } }),
    );
  }

  return profile;
}

export async function getMyProfile() {
  const dto = await apiClient.get(API_PATHS.profile.me);
  return mapProfileDto(dto);
}

export async function updateMyProfile(data, method = 'patch', accountEmail = null) {
  const response =
    method === 'put'
      ? await apiClient.put(API_PATHS.profile.me, data)
      : await apiClient.patch(API_PATHS.profile.me, data);

  const mapped = extractProfileFromApiResponse(response, accountEmail);
  if (mapped) return mapped;

  return getMyProfile();
}

export async function getProfileByUserId(userId) {
  const dto = await apiClient.get(API_PATHS.profile.byUserId(userId));
  return mapProfileDto(dto);
}

/** Alias used by legacy public profile views. */
export async function fetchPublicProfile(userId) {
  return getProfileByUserId(userId);
}

export async function recordProfileView(profileOwnerId, source = 'profile') {
  if (!profileOwnerId) return null;
  return apiClient.post(API_PATHS.profile.recordView(profileOwnerId), null, {
    query: { source },
  });
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

export async function uploadAvatar(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload(API_PATHS.profile.avatar, formData);
  const uploaded =
    extractProfileFromUploadResponse(response, options.accountEmail) ??
    await getMyProfile();
  const merged = mergeProfileUpdate(options.currentProfile, uploaded);
  return publishProfileUpdate(merged, options.setProfile) ?? merged;
}

export async function uploadHeader(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload(API_PATHS.profile.header, formData);
  const uploaded =
    extractProfileFromUploadResponse(response, options.accountEmail) ??
    await getMyProfile();
  const merged = mergeProfileUpdate(options.currentProfile, uploaded);
  return publishProfileUpdate(merged, options.setProfile) ?? merged;
}

export async function deleteAvatar(options = {}) {
  const response = await apiClient.delete(API_PATHS.profile.avatar);
  const updated =
    extractProfileFromUploadResponse(response, options.accountEmail) ??
    await getMyProfile();
  const merged = mergeProfileUpdate(options.currentProfile, updated, { clearAvatar: true });
  return publishProfileUpdate(merged, options.setProfile) ?? merged;
}

export async function deleteHeader(options = {}) {
  const response = await apiClient.delete(API_PATHS.profile.header);
  const updated =
    extractProfileFromUploadResponse(response, options.accountEmail) ??
    await getMyProfile();
  const merged = mergeProfileUpdate(options.currentProfile, updated, { clearHeader: true });
  return publishProfileUpdate(merged, options.setProfile) ?? merged;
}

export async function getProfileViews() {
  const response = await apiClient.get(API_PATHS.profile.profileViews);
  return mapProfileViewsResponse(response);
}

export async function getProfileViewRecords() {
  const response = await apiClient.get(API_PATHS.profile.profileViews);
  if (Array.isArray(response)) return response;
  return response?.items ?? response?.Items ?? [];
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

const batchProfileCache = new Map();

export async function fetchProfileByUserId(userId) {
  if (!userId) return null;

  const key = String(userId);
  if (batchProfileCache.has(key)) {
    return batchProfileCache.get(key);
  }

  try {
    const profile = await getProfileByUserId(key);
    batchProfileCache.set(key, profile);
    return profile;
  } catch {
    batchProfileCache.set(key, null);
    return null;
  }
}

/** Batch profile lookup for feed, network, messaging enrichment. */
export async function fetchProfilesByUserIds(userIds = []) {
  const unique = [...new Set(userIds.filter(Boolean).map(String))];
  const entries = await Promise.all(
    unique.map(async (id) => [id, await fetchProfileByUserId(id)]),
  );
  return Object.fromEntries(entries);
}

export function clearProfileCache() {
  batchProfileCache.clear();
}
