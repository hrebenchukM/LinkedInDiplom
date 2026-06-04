import { resolveMediaUrl } from "../profile/mapProfile";

export function mapPostDtoToFeedPost(dto, { authorName, authorAvatar, currentUserId } = {}) {
  const isOwn = String(dto.userId) === String(currentUserId);
  const media = Array.isArray(dto.media) ? dto.media : [];
  const firstImage = media.find((item) => item?.url)?.url;

  return {
    id: String(dto.id),
    isOwn,
    author: authorName || (isOwn ? "You" : "Member"),
    seed: authorName || dto.userId,
    avatar: authorAvatar || "",
    role: "",
    text: String(dto.content || ""),
    image: firstImage ? resolveMediaUrl(firstImage) : "",
    video: "",
    likes: Number(dto.reactionCount) || 0,
    comments: [],
    createdAt: dto.createdAt ? new Date(dto.createdAt).getTime() : Date.now(),
    visibility: dto.visibility,
    userId: dto.userId,
    _api: true,
  };
}

export function mapCommentDtoToUi(dto, authorName = "User") {
  return {
    id: String(dto.id),
    author: authorName,
    seed: authorName,
    text: String(dto.content || ""),
    _api: true,
  };
}
