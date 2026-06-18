import { truncateChatPreview } from '../../shared/lib/formatChatTime.js';
import { getSharedPostPreview, parseSharedPostMessage } from './sharedPostMessage.js';

export function buildChatPreviewText(message, options = {}) {
  const { t } = options;
  if (!message) return '';

  if (message.deleted || message.deletedAt) {
    return t?.('chat.messageDeleted', 'Message deleted') ?? 'Message deleted';
  }

  const content = String(message.content ?? message.text ?? '').trim();
  const sharedPreview = getSharedPostPreview(content, content);
  if (parseSharedPostMessage(content) || (sharedPreview && sharedPreview !== content)) {
    return truncateChatPreview(sharedPreview) || sharedPreview;
  }

  if (!content && (message.media?.length ?? 0) > 0) {
    return t?.('chat.attachment', 'Attachment') ?? 'Attachment';
  }

  return truncateChatPreview(content) || content;
}

export function resolveChatPreviewText(chat, options = {}) {
  if (!chat) return '';

  const direct =
    chat.lastMessageText ??
    (typeof chat.lastMessage === 'string' ? chat.lastMessage : null) ??
    chat.lastMessage?.content ??
    chat.lastMessage?.text ??
    '';

  if (String(direct).trim()) {
    const sharedPreview = getSharedPostPreview(direct, direct);
    return truncateChatPreview(sharedPreview) || sharedPreview;
  }

  return '';
}
