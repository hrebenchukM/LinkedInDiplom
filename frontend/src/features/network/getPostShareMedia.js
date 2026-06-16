import { buildUploadUrl } from '../../shared/api/uploads.js';

export function getPostPrimaryMedia(post) {
  if (!post) return null;

  const raw =
    post.media?.[0]?.rawUrl ??
    post.media?.[0]?.url ??
    post.image ??
    null;

  if (!raw) return null;

  const absoluteUrl = buildUploadUrl(raw);
  if (!absoluteUrl) return null;

  return {
    rawUrl: raw,
    absoluteUrl,
    mediaType: 'image',
  };
}
