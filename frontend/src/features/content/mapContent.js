import { resolveMediaUrl } from "../profile/mapProfile";

/** Normalizes API JSON (camelCase or PascalCase) into a stable post shape. */
export function normalizePostDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const rawMedia = dto.media ?? dto.Media ?? [];
  const media = Array.isArray(rawMedia)
    ? rawMedia.map((item) => ({
        url: item?.url ?? item?.Url,
        type: item?.type ?? item?.Type,
      }))
    : [];

  return {
    id: dto.id ?? dto.Id,
    userId: dto.userId ?? dto.UserId,
    content: dto.content ?? dto.Content ?? "",
    visibility: dto.visibility ?? dto.Visibility,
    reactionCount: dto.reactionCount ?? dto.ReactionCount ?? 0,
    commentCount: dto.commentCount ?? dto.CommentCount ?? 0,
    createdAt: dto.createdAt ?? dto.CreatedAt,
    media,
  };
}

export function mapPostDtoToFeedPost(dto, { authorName, authorHeadline, authorAvatar, currentUserId } = {}) {
  const normalized = normalizePostDto(dto) || dto;
  const isOwn = String(normalized.userId) === String(currentUserId);
  const media = Array.isArray(normalized.media) ? normalized.media : [];
  const firstImage = media.find((item) => item?.url)?.url;

  return {
    id: String(normalized.id ?? dto.id ?? dto.Id ?? ""),
    isOwn,
    author: authorName || (isOwn ? "You" : "Member"),
    seed: authorName || dto.userId,
    avatar: authorAvatar || "",
    role: authorHeadline || "",
    text: String(normalized.content || ""),
    image: firstImage ? resolveMediaUrl(firstImage) : "",
    video: "",
    likes: Number(normalized.reactionCount) || 0,
    commentCount: Number(normalized.commentCount) || 0,
    comments: [],
    createdAt: normalized.createdAt ? new Date(normalized.createdAt).getTime() : Date.now(),
    visibility: normalized.visibility,
    userId: normalized.userId,
    _api: true,
  };
}

export function normalizeSavedPostDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    userId: dto.userId ?? dto.UserId,
    postId: dto.postId ?? dto.PostId,
    savedAt: dto.savedAt ?? dto.SavedAt,
    unsavedAt: dto.unsavedAt ?? dto.UnsavedAt,
    post: normalizePostDto(dto.post ?? dto.Post),
  };
}

export function normalizeHashtagDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    name: dto.name ?? dto.Name ?? "",
    createdAt: dto.createdAt ?? dto.CreatedAt,
    updatedAt: dto.updatedAt ?? dto.UpdatedAt,
  };
}

export function normalizePostHashtagDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    postId: dto.postId ?? dto.PostId,
    hashtagId: dto.hashtagId ?? dto.HashtagId,
    createdAt: dto.createdAt ?? dto.CreatedAt,
    hashtag: normalizeHashtagDto(dto.hashtag ?? dto.Hashtag),
  };
}

export function normalizeMentionDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    postId: dto.postId ?? dto.PostId,
    mentionedUserId: dto.mentionedUserId ?? dto.MentionedUserId,
    createdAt: dto.createdAt ?? dto.CreatedAt,
  };
}

export function normalizeHashtagFollowDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    userId: dto.userId ?? dto.UserId,
    hashtagId: dto.hashtagId ?? dto.HashtagId,
    followedAt: dto.followedAt ?? dto.FollowedAt,
    unfollowedAt: dto.unfollowedAt ?? dto.UnfollowedAt,
    hashtag: normalizeHashtagDto(dto.hashtag ?? dto.Hashtag),
  };
}

export function normalizeRepostDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    userId: dto.userId ?? dto.UserId,
    originalPostId: dto.originalPostId ?? dto.OriginalPostId,
    repostedAt: dto.repostedAt ?? dto.RepostedAt,
    removedAt: dto.removedAt ?? dto.RemovedAt,
    originalPost: normalizePostDto(dto.originalPost ?? dto.OriginalPost),
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
