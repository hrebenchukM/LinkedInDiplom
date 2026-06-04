import * as contentApi from "./contentApi";
import { mapPostDtoToFeedPost } from "./mapContent";
import { fetchProfilesByUserIds } from "../profile/profileApi";
import { resolveMediaUrl } from "../profile/mapProfile";

export async function loadFeedPostsFromApi(currentUserId, displayName, userAvatar) {
  const dtos = await contentApi.fetchMyPosts();
  const userIds = [...new Set(dtos.map((dto) => dto.userId).filter(Boolean))];
  const profiles = await fetchProfilesByUserIds(userIds);

  return dtos.map((dto) => {
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
