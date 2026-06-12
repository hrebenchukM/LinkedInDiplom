export function postAvatarUrl(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || "user")}`;
}

export function resolvePostAvatar(post, userAvatar) {
  if (typeof post?.avatar === "string" && post.avatar.trim()) return post.avatar;
  if (post?.isOwn && userAvatar) return userAvatar;
  return postAvatarUrl(post?.seed || post?.author);
}

export function resolvePostImage(post) {
  if (!post || typeof post !== "object") return "";
  return typeof post.image === "string" && post.image.trim() ? post.image : "";
}
