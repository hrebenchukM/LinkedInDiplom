export function isPostShareMessage(message) {
  return message?.type === "post" && message?.post && typeof message.post === "object";
}

export function buildPostShareSnapshot(post) {
  return {
    id: String(post?.id || ""),
    author: String(post?.author || ""),
    text: String(post?.text || ""),
    image: String(post?.image || ""),
    video: String(post?.video || ""),
    role: String(post?.role || ""),
  };
}

export function buildPostSharePreview(post, t) {
  const author = String(post?.author || t("home.you", "You")).trim();
  const text = String(post?.text || "").trim();
  const snippet = text.length > 120 ? `${text.slice(0, 117)}...` : text;
  const label = t("home.post.sharedPost", "Shared post");
  if (snippet) return `${label}: ${author} — ${snippet}`;
  if (post?.image) return `${label}: ${author} — ${t("home.photo", "Photo")}`;
  if (post?.video) return `${label}: ${author} — ${t("home.video", "Video")}`;
  return `${label}: ${author}`;
}
