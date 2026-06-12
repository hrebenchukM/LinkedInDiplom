import { apiClient } from "../../shared/api/client";
import { PROFILE } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedItems } from "../../shared/lib/pagedResponse";

/** Fire-and-forget profile view (public endpoint; JWT attached when logged in). */
export async function tryRecordProfileView(profileOwnerId, source = "profile") {
  if (USE_MOCK_AUTH || !profileOwnerId) return null;
  try {
    const params = new URLSearchParams();
    if (source) params.set("source", String(source));
    const query = params.toString();
    const path = query ? `${PROFILE.recordView(profileOwnerId)}?${query}` : PROFILE.recordView(profileOwnerId);
    const data = await apiClient.post(path);
    return data?.profileView || null;
  } catch {
    return null;
  }
}

export async function fetchMyProfileViews() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(PROFILE.myProfileViews);
  return unwrapPagedItems(data, (item) => item);
}

export function formatProfileViewDate(iso, lang) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(lang || undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapProfileViewsToRows(views = [], profileByUserId = {}, t) {
  return views.map((view) => {
    const viewerUserId = view.viewerUserId ? String(view.viewerUserId) : "";
    const profile = viewerUserId ? profileByUserId[viewerUserId] : null;
    const viewerName =
      profile?.fullName?.trim() ||
      `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
      (viewerUserId ? `${t("profile.views.member", "Member")} ${viewerUserId.slice(0, 8)}` : t("profile.views.anonymous", "Anonymous viewer"));

    return {
      id: view.id,
      viewerUserId,
      viewerName,
      viewedAt: view.viewedAt,
      source: view.source || "",
    };
  });
}
