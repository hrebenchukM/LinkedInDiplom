const MARKER = '<!--linkup-shared-post-->';

export function buildSharedPostPayload(post) {
  if (!post?.id) return null;

  const author = post.user ?? post.author ?? {};
  const firstName = author.firstName ?? '';
  const secondName = author.secondName ?? author.lastName ?? '';
  const authorName = [firstName, secondName].filter(Boolean).join(' ').trim()
    || author.displayName
    || 'User';

  const rawImage =
    post.media?.[0]?.rawUrl ??
    post.media?.[0]?.url ??
    post.image ??
    null;

  return {
    v: 1,
    type: 'shared-post',
    postId: String(post.id),
    authorName,
    authorTitle: author.position ?? author.headline ?? author.profileTitle ?? '',
    authorAvatar: author.avatarUrl ?? author.avatar ?? null,
    caption: String(post.content || '').trim().slice(0, 400),
    imageUrl: rawImage,
  };
}

export function encodeSharedPostMessage(payload) {
  if (!payload) return '';
  return `${MARKER}${JSON.stringify(payload)}`;
}

export function parseSharedPostMessage(content) {
  const text = String(content || '');
  if (!text.startsWith(MARKER)) return null;

  try {
    const payload = JSON.parse(text.slice(MARKER.length));
    if (payload?.type === 'shared-post' && payload?.postId) {
      return payload;
    }
  } catch {
    return null;
  }

  return null;
}

export function getSharedPostPreview(content, fallback = '') {
  const payload = parseSharedPostMessage(content);
  if (!payload) return fallback;

  const parts = [payload.authorName, payload.caption].filter(Boolean);
  return parts.join(' · ').slice(0, 160) || fallback;
}

export function isLegacySharedPostText(content) {
  const text = String(content || '');
  return (
    text.includes('Shared a post from your feed')
    || text.includes('Поділився постом зі стрічки')
    || text.includes('Beitrag aus dem Feed geteilt')
    || text.includes('Compartió una publicación del feed')
  );
}

export function parseLegacySharedPostContent(content) {
  const text = String(content || '');
  const match = text.match(/"([^"]+)"/s);
  const snippet = match?.[1]?.trim() ?? text.trim().slice(0, 280);

  let authorName = '';
  let authorTitle = '';
  let caption = snippet;

  const authorMatch = snippet.match(/📷\s*([^·]+)(?:\s*·\s*([^·]+))?/);
  if (authorMatch) {
    authorName = authorMatch[1]?.trim() ?? '';
    authorTitle = authorMatch[2]?.trim() ?? '';
    caption = snippet.replace(/\s*📷\s*.+$/s, '').trim() || snippet;
  }

  return { authorName, authorTitle, caption };
}

export function resolveSharedPostMessage(message) {
  if (!message) return null;

  const parsed = parseSharedPostMessage(message.content);
  if (parsed) {
    return { payload: parsed, isShared: true };
  }

  if (isLegacySharedPostText(message.content)) {
    const legacy = parseLegacySharedPostContent(message.content);

    return {
      payload: {
        v: 1,
        type: 'shared-post',
        postId: 'legacy',
        authorName: legacy.authorName,
        authorTitle: legacy.authorTitle,
        authorAvatar: null,
        caption: legacy.caption,
        imageUrl: message.media?.[0]?.rawUrl ?? message.media?.[0]?.url ?? null,
      },
      isShared: true,
    };
  }

  return null;
}

export function mergeSharedPostDisplayMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;

  const skipIds = new Set();
  const merged = messages.map((message) => ({ ...message }));

  for (let index = 0; index < merged.length - 1; index += 1) {
    const current = merged[index];
    if (skipIds.has(current.id)) continue;

    const sharedPost = resolveSharedPostMessage(current);
    const hasImage =
      sharedPost?.payload?.imageUrl
      || current.media?.[0]?.rawUrl
      || current.media?.[0]?.url;

    if (!sharedPost || hasImage) continue;

    const next = merged[index + 1];
    const nextContent = String(next?.content || '').trim();
    const nextHasOnlyMedia = next && !nextContent && next.media?.length > 0;
    const sameSender = next?.senderId === current.senderId;

    if (!nextHasOnlyMedia || !sameSender) continue;

    merged[index] = {
      ...current,
      media: next.media,
    };
    skipIds.add(next.id);
  }

  return merged.filter((message) => !skipIds.has(message.id));
}
