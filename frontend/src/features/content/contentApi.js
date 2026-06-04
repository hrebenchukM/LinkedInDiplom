import { apiClient } from "../../shared/api/client";
import { CONTENT } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { normalizePostDto } from "./mapContent";

function unwrapPost(data) {
  if (data?.post) return normalizePostDto(data.post);
  if (data?.Post) return normalizePostDto(data.Post);
  return normalizePostDto(data);
}

function unwrapPostList(data) {
  const list = Array.isArray(data) ? data : data?.items || data?.posts || data?.Posts || [];
  return Array.isArray(list) ? list.map(normalizePostDto).filter(Boolean) : [];
}

export async function fetchMyPosts() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(CONTENT.myPosts);
  return unwrapPostList(data);
}

/** Public feed from database (all users' public posts). */
export async function fetchFeedPosts({ limit = 50, cacheBust = false } = {}) {
  if (USE_MOCK_AUTH) return [];
  const query = new URLSearchParams({ limit: String(limit) });
  if (cacheBust) query.set("_", String(Date.now()));
  const data = await apiClient.get(`${CONTENT.feed}?${query.toString()}`);
  return unwrapPostList(data);
}

export async function createPost({ content, visibility = "public" }) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(CONTENT.myPosts, { content, visibility });
  return unwrapPost(data);
}

export async function deletePost(postId) {
  if (USE_MOCK_AUTH) return;
  await apiClient.delete(CONTENT.myPost(postId));
}

export async function fetchPostComments(postId) {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(CONTENT.postComments(postId));
  return Array.isArray(data) ? data : [];
}

export async function createPostComment(postId, content) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(CONTENT.postComments(postId), { content });
  return data?.comment || data;
}

export async function upsertPostReaction(postId, reactionType = "Like") {
  if (USE_MOCK_AUTH) return null;
  return apiClient.put(CONTENT.postReactions(postId), { reactionType });
}

export async function removePostReaction(postId) {
  if (USE_MOCK_AUTH) return null;
  return apiClient.delete(CONTENT.postReactions(postId));
}

export async function fetchMyReactionForPost(postId) {
  if (USE_MOCK_AUTH) return null;
  try {
    return await apiClient.get(CONTENT.myPostReaction(postId));
  } catch {
    return null;
  }
}
