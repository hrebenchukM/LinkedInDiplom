import { apiClient } from "../../shared/api/client";
import { apiUpload } from "../../shared/api/http";
import { CONTENT } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import {
  normalizeHashtagDto,
  normalizeHashtagFollowDto,
  normalizeMentionDto,
  normalizePostDto,
  normalizePostHashtagDto,
  normalizeRepostDto,
  normalizeSavedPostDto,
} from "./mapContent";
import { extractHashtagNames } from "./postEntities";
import { EMPTY_PAGED, unwrapPagedItems, unwrapPagedResponse } from "../../shared/lib/pagedResponse";

function unwrapPost(data) {
  if (data?.post) return normalizePostDto(data.post);
  if (data?.Post) return normalizePostDto(data.Post);
  return normalizePostDto(data);
}

export async function fetchMyPosts({ page = 1, pageSize = 20 } = {}) {
  if (USE_MOCK_AUTH) return { ...EMPTY_PAGED, pageSize };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const data = await apiClient.get(`${CONTENT.myPosts}?${params.toString()}`);
  return unwrapPagedResponse(data, normalizePostDto);
}

export async function fetchPostById(postId) {
  if (USE_MOCK_AUTH || !postId) return null;
  const data = await apiClient.get(CONTENT.post(postId));
  return unwrapPost(data);
}

/** Public posts by user — `GET /api/content/users/{userId}/posts`. */
export async function fetchUserPosts(userId, { page = 1, pageSize = 20 } = {}) {
  if (USE_MOCK_AUTH || !userId) return { ...EMPTY_PAGED, pageSize };
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const data = await apiClient.get(`${CONTENT.userPosts(userId)}?${params.toString()}`);
  return unwrapPagedResponse(data, normalizePostDto);
}

/** Public feed — `GET /api/content/feed?page=&pageSize=` → PagedResponse<PostDto>. */
export async function fetchFeedPosts({ page = 1, pageSize = 20, cacheBust = false } = {}) {
  if (USE_MOCK_AUTH) {
    return { ...EMPTY_PAGED, pageSize };
  }
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (cacheBust) params.set("_", String(Date.now()));
  const data = await apiClient.get(`${CONTENT.feed}?${params.toString()}`);
  return unwrapPagedResponse(data, normalizePostDto);
}

function unwrapMedia(data) {
  return data?.media || data?.Media || null;
}

function readApiFailure(data, fallback) {
  return (
    (Array.isArray(data?.errors) && data.errors[0]) ||
    data?.error ||
    data?.message ||
    fallback
  );
}

export async function uploadMedia(file) {
  if (USE_MOCK_AUTH) return null;
  const { ok, data } = await apiUpload("POST", CONTENT.uploadMedia, file);
  if (!ok) {
    throw new Error(String(readApiFailure(data, "Media upload failed.")));
  }
  const media = unwrapMedia(data);
  if (!media?.id && !media?.Id) {
    throw new Error(String(readApiFailure(data, "Media upload failed.")));
  }
  return media;
}

export async function attachPostMedia(postId, mediaId) {
  if (USE_MOCK_AUTH || !postId || !mediaId) return null;
  const data = await apiClient.post(CONTENT.postMedia(postId), { mediaId });
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to attach media to post.")));
  }
  return data?.postMedia || data?.PostMedia || data;
}

export async function createPost({ content, visibility = "public" }) {
  if (USE_MOCK_AUTH) return null;
  const data = await apiClient.post(CONTENT.myPosts, { content, visibility });
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to create post.")));
  }
  const post = unwrapPost(data);
  if (!post?.id) {
    throw new Error(String(readApiFailure(data, "Failed to create post.")));
  }
  return post;
}

/** Create text post, optionally upload image and attach via post-media link. */
export async function createPostWithMedia({ content, visibility = "public", file }) {
  const post = await createPost({ content, visibility });
  if (!post?.id) {
    throw new Error("Post was not created.");
  }
  if (!file) return post;

  const media = await uploadMedia(file);
  const mediaId = media?.id ?? media?.Id;
  await attachPostMedia(post.id, mediaId);
  return post;
}

export async function updatePost(postId, { content, visibility = "public" }) {
  if (USE_MOCK_AUTH || !postId) return null;
  const text = String(content || "").trim();
  if (!text) {
    throw new Error("Post content is required.");
  }
  const data = await apiClient.patch(CONTENT.myPost(postId), {
    content: text,
    visibility: visibility || "public",
  });
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to update post.")));
  }
  return unwrapPost(data);
}

export async function deletePost(postId) {
  if (USE_MOCK_AUTH) return;
  await apiClient.delete(CONTENT.myPost(postId));
}

export async function fetchPostComments(postId) {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(CONTENT.postComments(postId));
  return unwrapPagedItems(data, (item) => item);
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

function unwrapSavedPost(data) {
  const raw = data?.savedPost || data?.SavedPost || data;
  return normalizeSavedPostDto(raw);
}

function unwrapRepost(data) {
  const raw = data?.repost || data?.Repost || data;
  return normalizeRepostDto(raw);
}

function unwrapSavedPostList(data) {
  return unwrapPagedItems(data, normalizeSavedPostDto);
}

function unwrapRepostList(data) {
  return unwrapPagedItems(data, normalizeRepostDto);
}

export async function fetchMySavedPosts() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(CONTENT.mySavedPosts);
  return unwrapSavedPostList(data);
}

export async function savePost(postId) {
  if (USE_MOCK_AUTH || !postId) return null;
  const data = await apiClient.post(CONTENT.savePost(postId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to save post.")));
  }
  return unwrapSavedPost(data);
}

export async function unsavePost(postId) {
  if (USE_MOCK_AUTH || !postId) return null;
  const data = await apiClient.delete(CONTENT.savePost(postId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to unsave post.")));
  }
  return unwrapSavedPost(data);
}

export async function fetchMyReposts() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(CONTENT.myReposts);
  return unwrapRepostList(data);
}

export async function repostPost(postId) {
  if (USE_MOCK_AUTH || !postId) return null;
  const data = await apiClient.post(CONTENT.repost(postId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to repost.")));
  }
  return unwrapRepost(data);
}

export async function unrepostPost(postId) {
  if (USE_MOCK_AUTH || !postId) return null;
  const data = await apiClient.delete(CONTENT.repost(postId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to remove repost.")));
  }
  return unwrapRepost(data);
}

export async function fetchRepostsByPostId(postId) {
  if (USE_MOCK_AUTH || !postId) return [];
  const data = await apiClient.get(CONTENT.postReposts(postId));
  return unwrapRepostList(data);
}

/** Active saved post ids for the current user (no unsavedAt). */
export async function fetchMySavedPostIds() {
  const saved = await fetchMySavedPosts();
  return new Set(
    saved.filter((item) => !item.unsavedAt && item.postId).map((item) => String(item.postId)),
  );
}

/** Active reposted original post ids for the current user (no removedAt). */
export async function fetchMyRepostedPostIds() {
  const reposts = await fetchMyReposts();
  return new Set(
    reposts
      .filter((item) => !item.removedAt && item.originalPostId)
      .map((item) => String(item.originalPostId)),
  );
}

function unwrapHashtagList(data) {
  return unwrapPagedItems(data, normalizeHashtagDto);
}

function unwrapPostHashtagList(data) {
  return unwrapPagedItems(data, normalizePostHashtagDto);
}

function unwrapMentionList(data) {
  return unwrapPagedItems(data, normalizeMentionDto);
}

function unwrapHashtagFollowList(data) {
  return unwrapPagedItems(data, normalizeHashtagFollowDto);
}

export async function searchHashtags(query = "", pageSize = 12) {
  if (USE_MOCK_AUTH) return [];
  const params = new URLSearchParams({ page: "1", pageSize: String(pageSize) });
  const trimmed = String(query || "").trim();
  if (trimmed) params.set("search", trimmed);
  const data = await apiClient.get(`${CONTENT.hashtags}?${params.toString()}`);
  return unwrapHashtagList(data);
}

export async function fetchPostHashtags(postId) {
  if (USE_MOCK_AUTH || !postId) return [];
  const data = await apiClient.get(CONTENT.postHashtags(postId));
  return unwrapPostHashtagList(data);
}

export async function attachPostHashtag(postId, hashtagId) {
  if (USE_MOCK_AUTH || !postId || !hashtagId) return null;
  const data = await apiClient.post(CONTENT.attachPostHashtag(postId), { hashtagId });
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to attach hashtag.")));
  }
  return normalizePostHashtagDto(data?.postHashtag || data?.PostHashtag || data);
}

export async function detachPostHashtag(postId, hashtagId) {
  if (USE_MOCK_AUTH || !postId || !hashtagId) return null;
  const data = await apiClient.delete(CONTENT.detachPostHashtag(postId, hashtagId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to detach hashtag.")));
  }
  return normalizePostHashtagDto(data?.postHashtag || data?.PostHashtag || data);
}

export async function fetchMyHashtagFollows() {
  if (USE_MOCK_AUTH) return [];
  const data = await apiClient.get(CONTENT.myHashtagFollowing);
  return unwrapHashtagFollowList(data);
}

export async function followHashtag(hashtagId) {
  if (USE_MOCK_AUTH || !hashtagId) return null;
  const data = await apiClient.post(CONTENT.followHashtag(hashtagId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to follow hashtag.")));
  }
  return normalizeHashtagFollowDto(data?.userHashtagFollow || data?.UserHashtagFollow || data);
}

export async function unfollowHashtag(hashtagId) {
  if (USE_MOCK_AUTH || !hashtagId) return null;
  const data = await apiClient.delete(CONTENT.followHashtag(hashtagId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to unfollow hashtag.")));
  }
  return normalizeHashtagFollowDto(data?.userHashtagFollow || data?.UserHashtagFollow || data);
}

export async function fetchPostMentions(postId) {
  if (USE_MOCK_AUTH || !postId) return [];
  const data = await apiClient.get(CONTENT.postMentions(postId));
  return unwrapMentionList(data);
}

export async function addPostMention(postId, mentionedUserId) {
  if (USE_MOCK_AUTH || !postId || !mentionedUserId) return null;
  const data = await apiClient.post(CONTENT.addPostMention(postId), { mentionedUserId });
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to add mention.")));
  }
  return normalizeMentionDto(data?.mention || data?.Mention || data);
}

export async function removePostMention(postId, mentionedUserId) {
  if (USE_MOCK_AUTH || !postId || !mentionedUserId) return null;
  const data = await apiClient.delete(CONTENT.removePostMention(postId, mentionedUserId));
  if (data?.success === false) {
    throw new Error(String(readApiFailure(data, "Failed to remove mention.")));
  }
  return normalizeMentionDto(data?.mention || data?.Mention || data);
}

/** Resolve #tags in text + explicit ids, then attach hashtags and mentions to a post. */
export async function syncPostEntities(
  postId,
  { text = "", hashtagIds = [], mentionedUserIds = [] } = {},
) {
  if (USE_MOCK_AUTH || !postId) return;

  const resolvedHashtagIds = new Set(hashtagIds.filter(Boolean).map(String));
  const names = extractHashtagNames(text);

  await Promise.all(
    names.map(async (name) => {
      try {
        const items = await searchHashtags(name, 10);
        const match = items.find((item) => String(item.name).toLowerCase() === name);
        if (match?.id) resolvedHashtagIds.add(String(match.id));
      } catch {
        // ignore lookup failures
      }
    }),
  );

  const mentionSet = new Set(mentionedUserIds.filter(Boolean).map(String));

  await Promise.all(
    [...resolvedHashtagIds].map((hashtagId) => attachPostHashtag(postId, hashtagId).catch(() => null)),
  );
  await Promise.all(
    [...mentionSet].map((mentionedUserId) => addPostMention(postId, mentionedUserId).catch(() => null)),
  );
}
