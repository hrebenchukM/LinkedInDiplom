import { apiClient } from "../../shared/api/client";
import { apiFetch, apiUpload } from "../../shared/api/http";
import { PROFILE } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedResponse } from "../../shared/lib/pagedResponse";
import { mapProfileSearchToPerson, normalizeProfileDto, normalizeProfileSearchDto } from "./mapProfile";

const profileCache = new Map();

function unwrapProfileResponse(data) {
  const raw = data?.profile ?? data?.Profile ?? data;
  return normalizeProfileDto(raw);
}

function buildProfileSearchQuery({ query, location, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const trimmedQuery = String(query || "").trim();
  if (trimmedQuery) params.set("query", trimmedQuery);
  const trimmedLocation = String(location || "").trim();
  if (trimmedLocation) params.set("location", trimmedLocation);
  return params.toString();
}

/** Public profile search — `GET /api/profile/search`. */
export async function searchProfiles({ query = "", location, page = 1, pageSize = 20, currentUserId } = {}) {
  if (USE_MOCK_AUTH) {
    return { items: [], page, pageSize, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
  }
  const qs = buildProfileSearchQuery({ query, location, page, pageSize });
  const data = await apiClient.get(`${PROFILE.search}?${qs}`);
  const paged = unwrapPagedResponse(data, normalizeProfileSearchDto);
  return {
    ...paged,
    items: paged.items.map((dto) => mapProfileSearchToPerson(dto, currentUserId)).filter(Boolean),
  };
}

export async function fetchMyProfile() {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.get(PROFILE.me);
  return unwrapProfileResponse(data);
}

export async function patchMyProfile(body) {
  if (USE_MOCK_AUTH) return { success: true, profile: null };
  const data = await apiClient.patch(PROFILE.me, body);
  return {
    success: Boolean(data?.success ?? data?.Success ?? true),
    profile: unwrapProfileResponse(data),
    errors: data?.errors ?? data?.Errors,
  };
}

export async function uploadMyAvatar(file, { onProgress } = {}) {
  if (USE_MOCK_AUTH) return { success: false, profile: null };
  const { ok, data } = await apiUpload("POST", PROFILE.avatar, file, "file", { onProgress });
  if (!ok) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Avatar upload failed.";
    throw new Error(String(message));
  }
  return { success: Boolean(data?.success ?? data?.Success ?? true), profile: unwrapProfileResponse(data) };
}

export async function uploadMyHeader(file, { onProgress } = {}) {
  if (USE_MOCK_AUTH) return { success: false, profile: null };
  const { ok, data } = await apiUpload("POST", PROFILE.header, file, "file", { onProgress });
  if (!ok) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Header upload failed.";
    throw new Error(String(message));
  }
  return { success: Boolean(data?.success ?? data?.Success ?? true), profile: unwrapProfileResponse(data) };
}

/** Non-throwing fetch for auth bootstrap. */
export async function tryFetchMyProfile() {
  try {
    return await fetchMyProfile();
  } catch {
    return null;
  }
}

/** Public profile by user id — throws on HTTP / missing profile (for profile view page). */
export async function fetchPublicProfile(userId) {
  if (USE_MOCK_AUTH) {
    throw new Error("Public profiles are not available in mock auth mode.");
  }
  if (!userId) {
    throw new Error("User id is required.");
  }
  const data = await apiClient.get(PROFILE.byUserId(String(userId)));
  const profile = unwrapProfileResponse(data);
  if (!profile) {
    throw new Error("Profile not found.");
  }
  return profile;
}

/** Apply registration fields to backend profile after first login. */
export async function fetchProfileByUserId(userId) {
  if (USE_MOCK_AUTH || !userId) return null;
  const key = String(userId);
  if (profileCache.has(key)) return profileCache.get(key);
  try {
    const data = await apiClient.get(PROFILE.byUserId(key));
    const profile = unwrapProfileResponse(data);
    if (profile) profileCache.set(key, profile);
    return profile;
  } catch {
    return null;
  }
}

export async function fetchProfilesByUserIds(userIds = []) {
  const unique = [...new Set(userIds.filter(Boolean).map(String))];
  const entries = await Promise.all(unique.map(async (id) => [id, await fetchProfileByUserId(id)]));
  return Object.fromEntries(entries);
}

export function clearProfileCache() {
  profileCache.clear();
}

export async function tryApplyRegistrationProfile(fallback = {}) {
  const patch = {};
  const firstName = String(fallback.firstName || "").trim();
  const lastName = String(fallback.lastName || "").trim();
  const headline = String(fallback.specialty || fallback.headline || "").trim();
  if (firstName) patch.firstName = firstName;
  if (lastName) patch.lastName = lastName;
  if (headline) patch.headline = headline;
  if (!Object.keys(patch).length) return null;

  try {
    const result = await patchMyProfile(patch);
    return result.profile;
  } catch {
    return null;
  }
}
