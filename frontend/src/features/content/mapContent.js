import { resolveUploadUrl } from '../../shared/api/uploads.js';
import { mapPagedResponse } from '../../shared/lib/pagination.js';

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

export function mapMediaDto(dto) {
  if (!dto) return null;

  const rawUrl = pick(dto, 'url', 'Url', 'fileUrl', 'FileUrl', 'mediaUrl', 'MediaUrl');
  return {
    id: pick(dto, 'id', 'Id'),
    url: rawUrl ? resolveUploadUrl(rawUrl) : null,
    rawUrl,
    type: pick(dto, 'type', 'Type') ?? 'image',
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

export function mapMediaUploadResponse(response) {
  if (!response) return null;

  const media =
    response.media ??
    response.Media ??
    response.data?.media ??
    response;

  return mapMediaDto(media);
}

export function mapPostDto(dto) {
  if (!dto) return null;

  const rawMedia = dto.media ?? dto.Media ?? dto.mediaUrls ?? dto.MediaUrls ?? [];
  const media = (Array.isArray(rawMedia) ? rawMedia : [])
    .map((item) => (typeof item === 'string' ? mapMediaDto({ url: item }) : mapMediaDto(item)))
    .filter(Boolean);

  const content = pick(dto, 'content', 'Content', 'text', 'Text', 'body', 'Body') ?? '';

  return {
    id: pick(dto, 'id', 'Id'),
    userId: pick(dto, 'userId', 'UserId'),
    content,
    text: content,
    visibility: pick(dto, 'visibility', 'Visibility') ?? 'Public',
    createdAt: pick(dto, 'createdAt', 'CreatedAt', 'publishedAt', 'PublishedAt'),
    updatedAt: pick(dto, 'editedAt', 'EditedAt', 'updatedAt', 'UpdatedAt'),
    media,
    image: media[0]?.url ?? media[0]?.rawUrl ?? null,
    commentsCount:
      pick(dto, 'commentCount', 'CommentCount', 'commentsCount', 'CommentsCount') ?? 0,
    reactionsCount:
      pick(dto, 'reactionCount', 'ReactionCount', 'reactionsCount', 'ReactionsCount') ?? 0,
    repostCount: pick(dto, 'repostCount', 'RepostCount') ?? 0,
    myReaction:
      pick(dto, 'myReactionType', 'MyReactionType', 'myReaction', 'MyReaction') ?? null,
    user: null,
    author: null,
  };
}

export function mapPostListResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapPostDto).filter(Boolean),
  };
}

export function mapPostToCreateRequest(formState = {}) {
  const request = {
    content: formState.content ?? formState.text ?? formState.body ?? '',
    visibility: formState.visibility ?? 'Public',
  };

  const mediaIds = formState.mediaIds ?? formState.MediaIds;
  if (Array.isArray(mediaIds) && mediaIds.length > 0) {
    request.mediaIds = mediaIds;
  }

  return request;
}

export function mapPostToUpdateRequest(formState = {}) {
  return {
    content: formState.content ?? formState.text ?? formState.body ?? '',
    visibility: formState.visibility ?? 'Public',
  };
}

export function mapCommentDto(dto) {
  if (!dto) return null;

  const content = pick(dto, 'content', 'Content', 'text', 'Text') ?? '';

  return {
    id: pick(dto, 'id', 'Id'),
    postId: pick(dto, 'postId', 'PostId'),
    userId: pick(dto, 'userId', 'UserId'),
    parentCommentId: pick(dto, 'parentCommentId', 'ParentCommentId'),
    content,
    text: content,
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    user: null,
    author: null,
  };
}

export function mapCommentListResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapCommentDto).filter(Boolean),
  };
}

export function mapReactionDto(dto) {
  if (!dto) return null;

  return {
    id: pick(dto, 'id', 'Id'),
    postId: pick(dto, 'postId', 'PostId'),
    userId: pick(dto, 'userId', 'UserId'),
    reactionType: pick(dto, 'reactionType', 'ReactionType') ?? 'Like',
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

export function extractPostFromResponse(response) {
  const postDto = response?.post ?? response?.Post ?? response;
  return mapPostDto(postDto);
}
