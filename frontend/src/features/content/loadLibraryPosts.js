import * as contentApi from "./contentApi";
import { mapPostsWithAuthors } from "./mapPostsWithAuthors";

export async function loadSavedPostsForFeed(currentUserId, displayName, userAvatar) {
  const saved = await contentApi.fetchMySavedPosts();
  const posts = saved
    .filter((item) => !item.unsavedAt && item.post?.id)
    .map((item) => item.post);
  const feedPosts = await mapPostsWithAuthors(posts, currentUserId, displayName, userAvatar);
  return feedPosts.map((post) => ({ ...post, _library: "saved" }));
}

export async function loadRepostsForFeed(currentUserId, displayName, userAvatar) {
  const reposts = await contentApi.fetchMyReposts();
  const posts = reposts
    .filter((item) => !item.removedAt && item.originalPost?.id)
    .map((item) => item.originalPost);
  const feedPosts = await mapPostsWithAuthors(posts, currentUserId, displayName, userAvatar);
  return feedPosts.map((post) => ({ ...post, _library: "repost" }));
}
