import * as contentApi from "./contentApi";
import { mapPostDtoToFeedPost, normalizePostDto } from "./mapContent";
import { fetchProfilesByUserIds } from "../profile/profileApi";
import { resolveMediaUrl } from "../profile/mapProfile";

export async function loadFeedPostsFromApi(currentUserId, displayName, userAvatar) {
  const dtos = await contentApi.fetchFeedPosts({ limit: 50, cacheBust: true });
  const userIds = [...new Set(dtos.map((dto) => dto.userId).filter(Boolean))];
  const profiles = await fetchProfilesByUserIds(userIds);

  return dtos.map((raw) => {
    const dto = normalizePostDto(raw) || raw;
    const profile = profiles[dto.userId];
    const authorName =
      profile?.fullName?.trim() ||
      `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
      (String(dto.userId) === String(currentUserId) ? displayName : "Member");
    const authorAvatar = profile?.avatarUrl ? resolveMediaUrl(profile.avatarUrl) : "";
    return mapPostDtoToFeedPost(dto, {
      authorName,
      authorAvatar: String(dto.userId) === String(currentUserId) ? userAvatar || authorAvatar : authorAvatar,
      currentUserId,
    });
  });
}
