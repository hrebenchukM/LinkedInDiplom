import { apiClient } from "../../shared/api/client";
import { apiFetch, apiUpload } from "../../shared/api/http";
import { PROFILE } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

const profileCache = new Map();

function unwrapProfileResponse(data) {
  if (data?.profile) return data.profile;
  if (data?.id || data?.userId) return data;
  return null;
}

export async function fetchMyProfile() {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.get(PROFILE.me);
  return unwrapProfileResponse(data);
}

export async function patchMyProfile(body) {
  if (USE_MOCK_AUTH) return { success: true, profile: null };
  const data = await apiClient.patch(PROFILE.me, body);
  return { success: Boolean(data?.success ?? true), profile: unwrapProfileResponse(data), errors: data?.errors };
}

export async function uploadMyAvatar(file) {
  if (USE_MOCK_AUTH) return { success: false, profile: null };
  const { ok, data } = await apiUpload("POST", PROFILE.avatar, file);
  if (!ok) {
    const message =
      (Array.isArray(data?.errors) && data.errors[0]) ||
      data?.error ||
      data?.message ||
      "Avatar upload failed.";
    throw new Error(String(message));
  }
  return { success: Boolean(data?.success ?? true), profile: unwrapProfileResponse(data) };
}

/** Non-throwing fetch for auth bootstrap. */
export async function tryFetchMyProfile() {
  try {
    return await fetchMyProfile();
  } catch {
    return null;
  }
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
