/** Fisher–Yates shuffle with a numeric seed for stable order between re-renders. */
export function shuffleFeedPosts(posts = [], seed = Date.now()) {
  const copy = [...(Array.isArray(posts) ? posts : [])];
  if (copy.length < 2) return copy;

  let state = (Number(seed) || Date.now()) >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

/** Normalizes API feed rows for the home feed UI. */
export function buildDisplayFeed(apiPosts = [], { shuffle = false, seed } = {}) {
  const normalized = (Array.isArray(apiPosts) ? apiPosts : [])
    .filter((post) => post && typeof post === "object")
    .map((post) => ({ ...post, isFresh: false }));

  if (!shuffle) return normalized;
  return shuffleFeedPosts(normalized, seed ?? Date.now());
}
