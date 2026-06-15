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
