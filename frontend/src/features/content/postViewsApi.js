import { apiClient } from "../../shared/api/client";
import { CONTENT } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { unwrapPagedItems } from "../../shared/lib/pagedResponse";

const recordedPostIds = new Set();

function normalizePostViewDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    postId: dto.postId ?? dto.PostId,
    viewerUserId: dto.viewerUserId ?? dto.ViewerUserId ?? "",
    viewerIp: dto.viewerIp ?? dto.ViewerIp ?? "",
    viewerUserAgent: dto.viewerUserAgent ?? dto.ViewerUserAgent ?? "",
    source: dto.source ?? dto.Source ?? "",
    viewedAt: dto.viewedAt ?? dto.ViewedAt,
  };
}

/** Fire-and-forget post view (`POST /api/content/posts/{postId}/views`). */
export async function tryRecordPostView(postId, source = "feed") {
  const id = postId ? String(postId) : "";
  if (USE_MOCK_AUTH || !id || recordedPostIds.has(id)) return null;
  recordedPostIds.add(id);

  try {
    const params = new URLSearchParams();
    if (source) params.set("source", String(source));
    const query = params.toString();
    const path = query ? `${CONTENT.recordPostView(id)}?${query}` : CONTENT.recordPostView(id);
    const data = await apiClient.post(path);
    return normalizePostViewDto(data?.postView ?? data?.PostView) || null;
  } catch {
    recordedPostIds.delete(id);
    return null;
  }
}

export async function fetchMyPostViews(postId) {
  if (USE_MOCK_AUTH || !postId) return [];
  const data = await apiClient.get(CONTENT.myPostViews(postId));
  return unwrapPagedItems(data, normalizePostViewDto);
}

export function formatPostViewDate(iso, lang) {
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

export function mapPostViewsToRows(views = [], profileByUserId = {}, t) {
  return views.map((view) => {
    const viewerUserId = view.viewerUserId ? String(view.viewerUserId) : "";
    const profile = viewerUserId ? profileByUserId[viewerUserId] : null;
    const viewerName =
      profile?.fullName?.trim() ||
      `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
      (viewerUserId
        ? `${t("profile.views.member", "Member")} ${viewerUserId.slice(0, 8)}`
        : t("profile.views.anonymous", "Anonymous viewer"));

    return {
      id: view.id,
      viewerUserId,
      viewerName,
      viewedAt: view.viewedAt,
      source: view.source || "",
    };
  });
}
