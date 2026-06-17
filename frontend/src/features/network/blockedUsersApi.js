import { apiClient } from "../../shared/api/client";
import { API_PATHS } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedItems } from "../../shared/lib/pagedResponse";
import { normalizeBlockedUserDto } from "./mapNetwork";

/** Active blocks — `GET /api/network/me/blocked-users`. */
export async function fetchMyBlockedUsers() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(API_PATHS.network.blockedUsers);
  return unwrapPagedItems(data, normalizeBlockedUserDto).filter((item) => item && !item.unblockedAt);
}

/** `POST /api/network/me/blocked-users` */
export async function blockUser(blockedUserId) {
  if (USE_MOCK_AUTH || !blockedUserId) return null;
  return apiClient.post(API_PATHS.network.blockedUsers, { blockedUserId });
}

/** `DELETE /api/network/me/blocked-users/{blockedUserId}` */
export async function unblockUser(blockedUserId) {
  if (USE_MOCK_AUTH || !blockedUserId) return null;
  return apiClient.delete(API_PATHS.network.blockedUserById(blockedUserId));
}

export function formatBlockedDate(iso, lang) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(lang || undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
