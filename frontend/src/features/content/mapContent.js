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

export function mapMockTemplateToFeedPost(template) {
  return {
    id: String(template.id),
    isOwn: false,
    author: template.author,
    seed: template.seed || template.author,
    avatar: "",
    role: template.role || "",
    text: template.text || "",
    image: template.image || "",
    video: template.video || "",
    likes: Number(template.likes) || 0,
    comments: [],
    createdAt: Date.now(),
    _api: false,
  };
}

export function mapPostDtoToFeedPost(dto, { authorName, authorAvatar, currentUserId } = {}) {
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
    role: "",
    text: String(normalized.content || ""),
    image: firstImage ? resolveMediaUrl(firstImage) : "",
    video: "",
    likes: Number(normalized.reactionCount) || 0,
    comments: [],
    createdAt: normalized.createdAt ? new Date(normalized.createdAt).getTime() : Date.now(),
    visibility: normalized.visibility,
    userId: normalized.userId,
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
