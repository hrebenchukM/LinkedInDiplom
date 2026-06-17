import { mapPostDtoToFeedPost } from "./mapContent";
import { fetchProfilesByUserIds } from "../profile/profileApi";
import { resolveMediaUrl } from "../profile/mapProfile";

export async function mapPostsWithAuthors(postDtos, currentUserId, displayName, userAvatar) {
  const dtos = (Array.isArray(postDtos) ? postDtos : []).filter(Boolean);
  const userIds = [...new Set(dtos.map((dto) => dto.userId).filter(Boolean))];
  const profiles = userIds.length > 0 ? await fetchProfilesByUserIds(userIds) : {};

  return dtos.map((dto) => {
    const profile = profiles[dto.userId];
    const authorName =
      profile?.fullName?.trim() ||
      `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
      (String(dto.userId) === String(currentUserId) ? displayName : "Member");
    const authorAvatar = profile?.avatarUrl ? resolveMediaUrl(profile.avatarUrl) : "";
    const authorHeadline = String(profile?.headline || profile?.profileTitle || "").trim();

    return mapPostDtoToFeedPost(dto, {
      authorName,
      authorHeadline,
      authorAvatar: String(dto.userId) === String(currentUserId) ? userAvatar || authorAvatar : authorAvatar,
      currentUserId,
    });
  });
}
