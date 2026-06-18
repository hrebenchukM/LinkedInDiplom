import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';
import { buildPaginationQuery } from '../../shared/lib/pagination.js';
import {
  extractPostFromResponse,
  mapCommentDto,
  mapCommentListResponse,
  mapMediaUploadResponse,
  mapPostDto,
  mapPostListResponse,
  mapReactionDto,
} from './mapContent.js';

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.Items)) return response.Items;
  return [];
}

// Feed
export async function getFeedPosts(params = {}) {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(API_PATHS.content.feed, { query });
  return mapPostListResponse(response);
}

export async function getUserPosts(userId, params = {}) {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(API_PATHS.content.userPosts(userId), { query });
  return mapPostListResponse(response);
}

export async function getMyPosts(params = {}) {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(API_PATHS.content.myPosts, { query });
  return mapPostListResponse(response);
}

// Posts
export async function getPostById(postId) {
  const dto = await apiClient.get(API_PATHS.content.postById(postId));
  return mapPostDto(dto);
}

export async function createPost(data) {
  const response = await apiClient.post(API_PATHS.content.myPosts, data);
  return extractPostFromResponse(response);
}

export async function updatePost(postId, data) {
  const response = await apiClient.patch(API_PATHS.content.myPostById(postId), data);
  return extractPostFromResponse(response);
}

export async function deletePost(postId) {
  return apiClient.delete(API_PATHS.content.myPostById(postId));
}

// Media — upload first, then pass mediaIds in createPost (Variant A)
export async function uploadPostMedia(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload(API_PATHS.content.mediaUpload, formData);
  return mapMediaUploadResponse(response);
}

export async function attachMediaToPost(postId, mediaData) {
  const mediaId = mediaData?.mediaId ?? mediaData?.id ?? mediaData;
  const response = await apiClient.post(API_PATHS.content.postMedia(postId), {
    mediaId,
  });
  return response;
}

// Comments
export async function getPostComments(postId, params = {}) {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(API_PATHS.content.comments(postId), { query });
  return mapCommentListResponse(response);
}

export async function createComment(postId, data) {
  const response = await apiClient.post(API_PATHS.content.comments(postId), data);
  const commentDto =
    response?.comment ?? response?.Comment ?? response;
  return mapCommentDto(commentDto);
}

export async function updateComment(commentId, data) {
  const response = await apiClient.patch(API_PATHS.content.commentById(commentId), data);
  const commentDto = response?.comment ?? response?.Comment ?? response;
  return mapCommentDto(commentDto);
}

export async function deleteComment(commentId) {
  return apiClient.delete(API_PATHS.content.commentById(commentId));
}

/** @deprecated use getPostComments — returns comment items array */
export async function fetchPostComments(postId, params = {}) {
  const result = await getPostComments(postId, params);
  return result.items ?? [];
}

/** @deprecated use createComment */
export async function createPostComment(postId, text) {
  return createComment(postId, { content: text });
}

/** @deprecated use getMyPostReaction */
export async function fetchMyReactionForPost(postId) {
  return getMyPostReaction(postId);
}

/** @deprecated use setPostReaction */
export async function upsertPostReaction(postId, reactionType = 'Like') {
  return setPostReaction(postId, reactionType);
}

/** @deprecated use deletePostReaction */
export async function removePostReaction(postId) {
  return deletePostReaction(postId);
}

// Reactions
export async function getPostReactions(postId) {
  try {
    const response = await apiClient.get(API_PATHS.content.reactions(postId));
    return unwrapList(response).map(mapReactionDto).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getMyPostReaction(postId) {
  try {
    const response = await apiClient.get(API_PATHS.content.myReaction(postId));
    return mapReactionDto(response);
  } catch {
    return null;
  }
}

export async function setPostReaction(postId, reactionType = 'Like') {
  const response = await apiClient.put(API_PATHS.content.reactions(postId), {
    reactionType,
  });
  const reactionDto =
    response?.reaction ?? response?.Reaction ?? response;
  return mapReactionDto(reactionDto) ?? response;
}

export async function deletePostReaction(postId) {
  return apiClient.delete(API_PATHS.content.reactions(postId));
}

// Saved posts
export async function fetchMySavedPosts() {
  const response = await apiClient.get(API_PATHS.content.savedPosts);
  return unwrapList(response)
    .map((item) => {
      const postDto = item.post ?? item.Post;
      return {
        id: item.id ?? item.Id,
        postId: item.postId ?? item.PostId,
        savedAt: item.savedAt ?? item.SavedAt,
        unsavedAt: item.unsavedAt ?? item.UnsavedAt,
        post: postDto ? mapPostDto(postDto) : null,
      };
    })
    .filter((item) => item.postId);
}

export async function fetchMySavedPostIds() {
  const saved = await fetchMySavedPosts();
  return new Set(
    saved
      .filter((item) => !item.unsavedAt && item.postId)
      .map((item) => String(item.postId)),
  );
}

export async function savePost(postId) {
  return apiClient.post(API_PATHS.content.savePost(postId), {});
}

export async function unsavePost(postId) {
  return apiClient.delete(API_PATHS.content.savePost(postId));
}

// Views
export async function recordPostView(postId, source = 'feed') {
  try {
    return await apiClient.post(API_PATHS.content.views(postId), null, {
      query: { source },
    });
  } catch {
    return null;
  }
}

export async function getMyPostViews(postId) {
  try {
    return await apiClient.get(API_PATHS.content.myPostViews(postId));
  } catch {
    return null;
  }
}

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function mapRepostDto(dto) {
  if (!dto) return null;
  const postDto = dto.originalPost ?? dto.OriginalPost;
  return {
    id: pick(dto, 'id', 'Id'),
    userId: pick(dto, 'userId', 'UserId'),
    originalPostId: pick(dto, 'originalPostId', 'OriginalPostId'),
    repostedAt: pick(dto, 'repostedAt', 'RepostedAt'),
    removedAt: pick(dto, 'removedAt', 'RemovedAt'),
    originalPost: postDto ? mapPostDto(postDto) : null,
  };
}

// Reposts
export async function repostPost(postId) {
  return apiClient.post(API_PATHS.content.repostPost(postId), {});
}

export async function unrepostPost(postId) {
  return apiClient.delete(API_PATHS.content.repostPost(postId));
}

export async function fetchMyReposts(_params = {}) {
  const response = await apiClient.get(API_PATHS.content.myReposts);
  return unwrapList(response).map(mapRepostDto).filter(Boolean);
}

export async function fetchMyRepostedPostIds() {
  const reposts = await fetchMyReposts();
  return new Set(
    reposts
      .filter((item) => !item.removedAt)
      .map((item) => item.originalPostId ?? item.originalPost?.id)
      .filter(Boolean)
      .map(String),
  );
}

function mapHashtagDto(dto) {
  if (!dto) return null;
  return {
    id: pick(dto, 'id', 'Id'),
    name: pick(dto, 'name', 'Name'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

function mapHashtagFollowDto(dto) {
  if (!dto) return null;
  const hashtagDto = dto.hashtag ?? dto.Hashtag;
  return {
    id: pick(dto, 'id', 'Id'),
    hashtagId: pick(dto, 'hashtagId', 'HashtagId') ?? pick(hashtagDto, 'id', 'Id'),
    unfollowedAt: pick(dto, 'unfollowedAt', 'UnfollowedAt'),
    hashtag: hashtagDto ? mapHashtagDto(hashtagDto) : null,
  };
}

// Hashtags
export async function fetchMyHashtagFollows() {
  const response = await apiClient.get(API_PATHS.content.hashtagFollowing);
  return unwrapList(response).map(mapHashtagFollowDto).filter(Boolean);
}

export async function searchHashtags(query, pageSize = 12) {
  const params = buildPaginationQuery({
    page: 1,
    pageSize,
    search: String(query ?? '').trim(),
  });
  const response = await apiClient.get(API_PATHS.content.hashtags, { query: params });
  return unwrapList(response).map(mapHashtagDto).filter(Boolean);
}

export async function followHashtag(hashtagId) {
  return apiClient.post(API_PATHS.content.hashtagFollow(hashtagId), {});
}

export async function unfollowHashtag(hashtagId) {
  return apiClient.delete(API_PATHS.content.hashtagFollow(hashtagId));
}

function mapMentionDto(dto) {
  if (!dto) return null;
  return {
    id: pick(dto, 'id', 'Id'),
    postId: pick(dto, 'postId', 'PostId'),
    mentionedUserId: pick(dto, 'mentionedUserId', 'MentionedUserId'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

function mapPostHashtagDto(dto) {
  if (!dto) return null;
  const hashtagDto = dto.hashtag ?? dto.Hashtag;
  return {
    id: pick(dto, 'id', 'Id'),
    postId: pick(dto, 'postId', 'PostId'),
    hashtagId: pick(dto, 'hashtagId', 'HashtagId'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    hashtag: hashtagDto ? mapHashtagDto(hashtagDto) : null,
  };
}

// Post mentions
export async function fetchPostMentions(postId) {
  try {
    const response = await apiClient.get(API_PATHS.content.postMentions(postId));
    return unwrapList(response).map(mapMentionDto).filter(Boolean);
  } catch {
    return [];
  }
}

export async function addPostMention(postId, payload) {
  const mentionedUserId =
    payload?.mentionedUserId ?? payload?.MentionedUserId ?? payload;
  const response = await apiClient.post(API_PATHS.content.postMentionsManage(postId), {
    mentionedUserId,
  });
  const mentionDto = response?.mention ?? response?.Mention ?? response;
  return mapMentionDto(mentionDto) ?? response;
}

export async function deletePostMention(postId, mentionId) {
  return apiClient.delete(API_PATHS.content.deletePostMention(postId, mentionId));
}

// Post hashtags
export async function fetchPostHashtags(postId) {
  try {
    const response = await apiClient.get(API_PATHS.content.postHashtags(postId));
    return unwrapList(response).map(mapPostHashtagDto).filter(Boolean);
  } catch {
    return [];
  }
}

export async function addPostHashtag(postId, payload) {
  const hashtagId = payload?.hashtagId ?? payload?.HashtagId ?? payload?.id ?? payload;
  const response = await apiClient.post(API_PATHS.content.postHashtagsAttach(postId), {
    hashtagId,
  });
  const postHashtagDto =
    response?.postHashtag ?? response?.PostHashtag ?? response;
  return mapPostHashtagDto(postHashtagDto) ?? response;
}

export async function deletePostHashtag(postId, hashtagId) {
  return apiClient.delete(API_PATHS.content.deletePostHashtag(postId, hashtagId));
}
