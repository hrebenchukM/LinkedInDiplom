import {
  attachMessageMedia,
  sendMessage,
  uploadMessageMedia,
} from '../messaging/messagingApi.js';
import { mapMessageToCreateRequest } from '../messaging/mapMessaging.js';
import {
  buildSharedPostPayload,
  encodeSharedPostMessage,
  getSharedPostPreview,
} from '../messaging/sharedPostMessage.js';
import { markUserInitiatedChat } from '../messaging/userInitiatedChats.js';
import { notifyMessagingChanged } from '../messaging/messagingEvents.js';
import { openChatWithUser } from './openChatWithUser.js';
import { getPostPrimaryMedia } from './getPostShareMedia.js';

async function attachPostImageToMessage(messageId, post) {
  const media = getPostPrimaryMedia(post);
  if (!messageId || !media?.absoluteUrl) return null;

  try {
    return await attachMessageMedia(messageId, {
      mediaUrl: media.absoluteUrl,
      mediaType: media.mediaType,
    });
  } catch {
    try {
      const response = await fetch(media.absoluteUrl);
      if (!response.ok) return null;

      const blob = await response.blob();
      const file = new File([blob], 'shared-post.jpg', {
        type: blob.type || 'image/jpeg',
      });
      return await uploadMessageMedia(messageId, file);
    } catch {
      return null;
    }
  }
}

export async function sharePostWithContact({
  post,
  contactUserId,
  currentUserId,
  navigate,
  t,
}) {
  if (!post?.id || !contactUserId || !currentUserId) {
    throw new Error('Missing share target');
  }

  const payload = buildSharedPostPayload(post);
  const content = encodeSharedPostMessage(payload);
  const preview = getSharedPostPreview(
    content,
    t('chat.sharedPost.preview', 'Shared a post'),
  );

  const chatId = await openChatWithUser({
    targetUserId: contactUserId,
    currentUserId,
    navigate,
    shouldNavigate: false,
  });

  if (!chatId) {
    throw new Error('Could not open chat');
  }

  markUserInitiatedChat(chatId, contactUserId, preview);

  const saved = await sendMessage(
    chatId,
    mapMessageToCreateRequest({ content }),
    currentUserId,
  );

  if (saved?.id) {
    await attachPostImageToMessage(saved.id, post);
  }

  notifyMessagingChanged();

  return chatId;
}
