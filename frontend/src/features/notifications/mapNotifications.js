import { mapPagedResponse } from '../../shared/lib/pagination.js';
import { getAssetUrl } from '../../shared/api/files.js';

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

const TYPE_LABELS = {
  like: 'liked your post',
  comment: 'commented on your post',
  connection: 'accepted your connection request',
  contact: 'sent you a connection request',
  mention: 'mentioned you',
  vacancy: 'posted a new job',
  job: 'posted a new job',
  message: 'sent you a message',
  chat: 'sent you a message',
  event: 'invited you to an event',
  post: 'shared a post',
};

export function mapNotificationType(dto) {
  const raw = String(pick(dto, 'type', 'Type') ?? 'notification').toLowerCase();
  if (raw === 'vacancy') return 'job';
  return raw;
}

function resolveIsRead(dto) {
  const readAt = pick(dto, 'readAt', 'ReadAt');
  if (readAt) return true;
  const isRead = pick(dto, 'isRead', 'IsRead');
  if (typeof isRead === 'boolean') return isRead;
  if (isRead === 1 || isRead === '1' || isRead === 'true') return true;
  if (isRead === 0 || isRead === '0' || isRead === 'false') return false;
  return false;
}

export function getNotificationBody(notification) {
  if (!notification) return '';

  return (
    notification.body
    ?? notification.message
    ?? notification.content
    ?? ''
  );
}

export function getNotificationTitle(notification) {
  if (!notification) return 'Notification';

  if (notification.title?.trim()) {
    return notification.title.trim();
  }

  const actorName = notification.actorName || notification.actor?.name;
  const action = TYPE_LABELS[notification.type] || notification.type || 'sent a notification';

  if (actorName) {
    return `${actorName} ${action}`;
  }

  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function getNotificationLink(notification) {
  if (!notification) return '/app/notifications';
  if (notification.link) return notification.link;

  const entityType = String(notification.entityType ?? '').toLowerCase();
  const entityId = notification.entityId;
  const actorUserId = notification.actorUserId ?? notification.actor?.id;

  if (entityType.includes('event') && entityId) {
    return `/app/event/${entityId}`;
  }

  if ((entityType.includes('vacancy') || entityType.includes('job')) && entityId) {
    return '/app/vacancies';
  }

  if (entityType.includes('post')) {
    return '/app';
  }

  if (entityType.includes('message') || entityType.includes('chat')) {
    return '/app/messages';
  }

  if (
    entityType.includes('profile')
    || entityType.includes('user')
    || entityType.includes('contact')
  ) {
    const profileId = actorUserId || entityId;
    if (profileId) return `/app/portfolio/${profileId}`;
  }

  if (actorUserId) {
    return `/app/portfolio/${actorUserId}`;
  }

  return '/app/notifications';
}

export function formatNotificationTime(dateValue) {
  if (!dateValue) return '';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function mapNotificationDto(dto, meta = {}) {
  if (!dto) return null;

  const id = pick(dto, 'id', 'Id');
  const type = mapNotificationType(dto);
  const actorUserId = pick(dto, 'actorUserId', 'ActorUserId');
  const entityType = pick(dto, 'entityType', 'EntityType');
  const entityId = pick(dto, 'entityId', 'EntityId');
  const title = pick(dto, 'title', 'Title') ?? '';
  const body = pick(dto, 'body', 'Body', 'message', 'Message', 'content', 'Content') ?? '';
  const createdAt = pick(dto, 'createdAt', 'CreatedAt');
  const isRead = meta.isRead ?? resolveIsRead(dto);
  const actor = meta.actor ?? null;
  const entity = meta.entity ?? null;

  const mapped = {
    id,
    userId: pick(dto, 'userId', 'UserId'),
    type,
    title,
    body,
    message: body,
    content: body,
    actorUserId,
    actor,
    actorName: actor?.name ?? null,
    actorAvatar: actor?.avatar ?? getAssetUrl(actor?.avatarUrl, ''),
    entityType,
    entityId,
    entity,
    isRead,
    unread: !isRead,
    createdAt,
    readAt: pick(dto, 'readAt', 'ReadAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    time: formatNotificationTime(createdAt),
    link: null,
    action: TYPE_LABELS[type] || '',
  };

  mapped.link = getNotificationLink(mapped);
  mapped.displayTitle = getNotificationTitle(mapped);
  mapped.displayBody = getNotificationBody(mapped);

  return mapped;
}

export function mapNotificationListResponse(response) {
  const paged = mapPagedResponse(response);

  return {
    ...paged,
    items: paged.items.map((item) => mapNotificationDto(item)).filter(Boolean),
  };
}
