import { mapMockTemplateToFeedPost } from "../../features/content/mapContent";

export const FEED_TARGET_POSTS = 8;

function shuffleList(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function withImageRevision(url, revision) {
  const value = String(url || "").trim();
  if (!value) return "";
  const sep = value.includes("?") ? "&" : "?";
  return `${value}${sep}feed=${revision}`;
}

/**
 * Builds the visible home feed: API posts first, then demo posts up to FEED_TARGET_POSTS.
 * `revision` changes order and image seeds so "Update posts" is visibly different.
 */
export function buildDisplayFeed(apiPosts = [], revision = 0, mockTemplate = []) {
  const target = FEED_TARGET_POSTS;
  const api = (Array.isArray(apiPosts) ? apiPosts : [])
    .filter((post) => post && typeof post === "object")
    .map((post) => ({ ...post, isFresh: false }));

  const pool = (Array.isArray(mockTemplate) ? mockTemplate : []).map((item) =>
    mapMockTemplateToFeedPost(item),
  );

  if (pool.length === 0) {
    return api.length > 0 ? api : [];
  }

  const seen = new Set(api.map((post) => String(post.id)));
  const start = revision % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  const shuffled = shuffleList(rotated);

  const fillers = [];
  for (const post of shuffled) {
    if (api.length + fillers.length >= target) break;
    const id = String(post.id);
    if (seen.has(id)) continue;
    seen.add(id);
    fillers.push({
      ...post,
      isFresh: revision > 0,
      image: withImageRevision(post.image, revision),
    });
  }

  let guard = 0;
  while (api.length + fillers.length < target && guard < pool.length * 3) {
    const template = pool[guard % pool.length];
    const syntheticId = `feed-${template.id}-r${revision}-${guard}`;
    if (!seen.has(syntheticId)) {
      seen.add(syntheticId);
      fillers.push({
        ...mapMockTemplateToFeedPost({ ...template, id: syntheticId }),
        isFresh: true,
        image: withImageRevision(template.image, revision),
      });
    }
    guard += 1;
  }

  const orderedFillers = revision > 0 ? shuffleList(fillers) : fillers;
  return [...api, ...orderedFillers].slice(0, Math.max(target, api.length));
}
