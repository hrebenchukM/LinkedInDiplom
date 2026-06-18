import { resolveUploadUrl } from '../../shared/api/uploads.js';
import { mapPagedResponse } from '../../shared/lib/pagination.js';
import { getDisplayName } from '../profile/mapProfile.js';

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

export function mapChatMemberDto(dto) {
  if (!dto) return null;

  return {
    id: pick(dto, 'id', 'Id'),
    chatId: pick(dto, 'chatId', 'ChatId'),
    userId: pick(dto, 'userId', 'UserId'),
    folder: pick(dto, 'folder', 'Folder'),
    joinedAt: pick(dto, 'joinedAt', 'JoinedAt'),
    leftAt: pick(dto, 'leftAt', 'LeftAt'),
  };
}

export function getCompanionUserIdFromChat(chat, currentUserId) {
  const members = chat?.members ?? [];
  const currentId = currentUserId != null ? String(currentUserId) : '';
  const other = members.find(
    (member) => String(member.userId ?? member.UserId ?? '') !== currentId,
  );
  return other?.userId ?? other?.UserId ?? null;
}

import { getStoredCompanionUserId } from './userInitiatedChats.js';

const TEST_CHAT_CONTENT = /signalr|live-test|verify-realtime|test-message|e2e[-_]?test|from-[A-Z0-9]+$/i;

export function isTestChatContent(content) {
  return TEST_CHAT_CONTENT.test(String(content || '').trim());
}

/** Hide orphan / SignalR test chats and chats with non-contacts. */
export function shouldShowChatInList(chat, options = {}) {
  if (!chat?.id) return false;

  const lastMessage = String(chat.lastMessage ?? '').trim();
  if (lastMessage && isTestChatContent(lastMessage)) {
    return false;
  }

  const { contactUserIds, userInitiatedChatIds } = options;
  const chatId = String(chat.id);
  const isUserInitiated =
    userInitiatedChatIds instanceof Set ? userInitiatedChatIds.has(chatId) : false;

  let companionUserId = chat.companionUserId ?? null;
  if (!companionUserId && isUserInitiated) {
    companionUserId = getStoredCompanionUserId(chat.id);
  }

  if (!companionUserId) {
    return false;
  }

  if (contactUserIds instanceof Set) {
    const companionId = String(companionUserId);
    const isContact = contactUserIds.has(companionId);
    if (!isContact && !isUserInitiated) {
      return false;
    }
  }

  if (chat.profileFailed && lastMessage && isTestChatContent(lastMessage)) {
    return false;
  }

  return true;
}

export async function resolveCompanionUserId(chat, currentUserId, { getMembers } = {}) {
  if (!chat) return null;

  const currentId = currentUserId != null ? String(currentUserId) : '';

  let companionUserId =
    chat.companionUserId ?? getCompanionUserIdFromChat(chat, currentUserId);

  if (companionUserId) {
    return String(companionUserId);
  }

  const createdBy = chat.createdBy ?? chat.CreatedBy;
  if (createdBy && String(createdBy) !== currentId) {
    return String(createdBy);
  }

  if (typeof getMembers === 'function' && chat.id) {
    try {
      const rawMembers = await getMembers(chat.id);
      const members = (Array.isArray(rawMembers) ? rawMembers : [])
        .map((item) => mapChatMemberDto(item))
        .filter(Boolean);
      companionUserId = getCompanionUserIdFromChat({ members }, currentUserId);
      if (companionUserId) {
        return String(companionUserId);
      }
    } catch {
      /* members endpoint may fail for deleted chats */
    }
  }

  return null;
}

export function mapChatDto(dto, currentUserId = null) {
  if (!dto) return null;

  const members = (dto.members ?? dto.Members ?? [])
    .map((item) => mapChatMemberDto(item))
    .filter(Boolean);

  const id = pick(dto, 'id', 'Id');
  const companionUserId = getCompanionUserIdFromChat({ members }, currentUserId);

  const rawLastMessage = pick(dto, 'lastMessage', 'LastMessage');
  const lastMessageText =
    pick(dto, 'lastMessageText', 'LastMessageText') ??
    (typeof rawLastMessage === 'string'
      ? rawLastMessage
      : pick(rawLastMessage, 'content', 'Content', 'text', 'Text', 'body', 'Body')) ??
    '';
  const lastMessageAt =
    pick(dto, 'lastMessageAt', 'LastMessageAt') ??
    pick(rawLastMessage, 'createdAt', 'CreatedAt', 'sentAt', 'SentAt') ??
    pick(dto, 'updatedAt', 'UpdatedAt') ??
    pick(dto, 'createdAt', 'CreatedAt');

  return {
    id,
    chatId: id,
    createdBy: pick(dto, 'createdBy', 'CreatedBy'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt') ?? pick(dto, 'createdAt', 'CreatedAt'),
    members,
    companionUserId,
    companion: null,
    lastMessage: lastMessageText,
    lastMessageText,
    lastMessageAt,
    unreadCount: pick(dto, 'unreadCount', 'UnreadCount') ?? 0,
    hasUnread: Boolean(pick(dto, 'hasUnread', 'HasUnread')),
  };
}

export function mapChatListResponse(response, currentUserId = null) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items
      .map((item) => mapChatDto(item, currentUserId))
      .filter(Boolean),
  };
}

export function mapMessageMediaDto(dto) {
  if (!dto) return null;

  const rawUrl = pick(dto, 'mediaUrl', 'MediaUrl', 'url', 'Url', 'fileUrl');
  return {
    id: pick(dto, 'id', 'Id'),
    messageId: pick(dto, 'messageId', 'MessageId'),
    url: rawUrl ? resolveUploadUrl(rawUrl) : null,
    rawUrl,
    mediaType: pick(dto, 'mediaType', 'MediaType', 'type', 'Type'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

export function mapMessageDto(dto, currentUserId = null) {
  if (!dto) return null;

  const content =
    pick(dto, 'content', 'Content', 'text', 'Text', 'body', 'Body') ?? '';
  const senderId = pick(dto, 'senderId', 'SenderId');
  const createdAt = pick(dto, 'createdAt', 'CreatedAt', 'sentAt', 'SentAt');
  const deletedAt = pick(dto, 'deletedAt', 'DeletedAt');

  const rawMedia = dto.media ?? dto.Media ?? [];
  const media = (Array.isArray(rawMedia) ? rawMedia : [])
    .map(mapMessageMediaDto)
    .filter(Boolean);

  return {
    id: pick(dto, 'id', 'Id'),
    chatId: pick(dto, 'chatId', 'ChatId'),
    senderId,
    content,
    text: content,
    sentAt: createdAt,
    createdAt,
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt', 'editedAt', 'EditedAt'),
    readAt: pick(dto, 'readAt', 'ReadAt'),
    deletedAt,
    deleted: Boolean(deletedAt),
    media,
    status: deletedAt ? 'deleted' : 'sent',
    isMine: currentUserId ? senderId === currentUserId : false,
    sender: null,
  };
}

export function mapMessageListResponse(response, currentUserId = null) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items
      .map((item) => mapMessageDto(item, currentUserId))
      .filter(Boolean),
  };
}

export function mapMessageToCreateRequest(formState = {}) {
  return {
    content:
      formState.content ?? formState.text ?? formState.body ?? '',
  };
}

export function mapMessageMediaUploadResponse(response) {
  if (!response) return null;

  const media =
    response.media ??
    response.Media ??
    response.messageMedia ??
    response.MessageMedia ??
    response;

  return mapMessageMediaDto(media);
}

export function mapChatToDisplay(chat, companionProfile, lastMessage = null) {
  if (!chat) return null;

  const companionUser = companionProfile?.user ?? companionProfile;
  const name = companionProfile?.failed
    ? 'User'
    : getDisplayName(companionProfile ?? { user: companionUser });
  const headline =
    companionUser?.headline ??
    companionUser?.profileTitle ??
    companionProfile?.headline ??
    '';

  const resolvedLastMessage = lastMessage ?? {
    content: chat.lastMessage,
    sentAt: chat.lastMessageAt,
  };

  return {
    ...chat,
    name,
    profileFailed: Boolean(companionProfile?.failed),
    avatar: resolveUploadUrl(
      companionUser?.avatarUrl ?? companionUser?.AvatarUrl ?? '',
    ),
    avatarSrc: resolveUploadUrl(
      companionUser?.avatarUrl ?? companionUser?.AvatarUrl ?? '',
    ),
    title: headline,
    lastMessage: resolvedLastMessage?.content ?? chat.lastMessage ?? '',
    time:
      resolvedLastMessage?.sentAt ??
      resolvedLastMessage?.createdAt ??
      chat.lastMessageAt,
    unread: chat.hasUnread || (chat.unreadCount ?? 0) > 0,
    companion: companionUser
      ? {
          id: chat.companionUserId ?? companionUser.id,
          firstName: companionUser.firstName ?? name.split(' ')[0] ?? 'User',
          secondName:
            companionUser.secondName ??
            companionUser.lastName ??
            name.split(' ').slice(1).join(' '),
          avatarUrl: companionUser.avatarUrl ?? companionUser.AvatarUrl ?? null,
          profileTitle: headline,
          headline,
          email: companionUser.email,
          location: companionUser.location,
          genInfo: companionUser.about ?? companionUser.genInfo,
          university: companionUser.university,
          portfolioUrl: companionUser.portfolioUrl,
        }
      : null,
  };
}

export function extractChatFromResponse(response) {
  const chatDto = response?.chat ?? response?.Chat ?? response;
  return mapChatDto(chatDto);
}

export function extractMessageFromResponse(response, currentUserId = null) {
  const messageDto = response?.message ?? response?.Message ?? response;
  return mapMessageDto(messageDto, currentUserId);
}
