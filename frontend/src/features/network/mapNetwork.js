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

export function getContactOtherUserId(contact, currentUserId) {
  if (!contact || !currentUserId) return null;

  const requesterId = pick(contact, 'requesterId', 'RequesterId');
  const receiverId = pick(contact, 'receiverId', 'ReceiverId');

  if (requesterId === currentUserId) return receiverId;
  if (receiverId === currentUserId) return requesterId;
  return receiverId ?? requesterId ?? pick(contact, 'userId', 'UserId');
}

export function mapContactDto(dto) {
  if (!dto) return null;

  const status = String(pick(dto, 'status', 'Status') ?? '').toLowerCase();

  return {
    id: pick(dto, 'id', 'Id'),
    contactId: pick(dto, 'id', 'Id'),
    requesterId: pick(dto, 'requesterId', 'RequesterId'),
    receiverId: pick(dto, 'receiverId', 'ReceiverId'),
    userId: pick(dto, 'userId', 'UserId'),
    status,
    createdAt: pick(dto, 'requestedAt', 'RequestedAt', 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'respondedAt', 'RespondedAt', 'statusChangedAt', 'StatusChangedAt'),
    mutualConnections: 0,
    isConnected: status === 'accepted',
    isPending: status === 'pending',
    direction: null,
    name: '',
    avatar: '',
    headline: '',
  };
}

export function mapContactListResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapContactDto).filter(Boolean),
  };
}

export function mapPendingCountsDto(dto) {
  if (!dto) {
    return { incoming: 0, outgoing: 0, incomingCount: 0, outgoingCount: 0 };
  }

  const incoming =
    pick(dto, 'incomingCount', 'IncomingCount', 'incoming') ?? 0;
  const outgoing =
    pick(dto, 'outgoingCount', 'OutgoingCount', 'outgoing') ?? 0;

  return {
    incoming,
    outgoing,
    incomingCount: incoming,
    outgoingCount: outgoing,
  };
}

export function mapFollowDto(dto) {
  if (!dto) return null;

  const followingId = pick(dto, 'followingId', 'FollowingId');

  return {
    id: pick(dto, 'id', 'Id'),
    followerId: pick(dto, 'followerId', 'FollowerId'),
    followingId,
    userId: followingId,
    followedAt: pick(dto, 'followedAt', 'FollowedAt'),
    unfollowedAt: pick(dto, 'unfollowedAt', 'UnfollowedAt'),
    name: '',
    avatar: '',
    headline: '',
    cardType: 'following',
  };
}

export function mapFollowList(items = []) {
  const list = Array.isArray(items) ? items : [];
  return list.map(mapFollowDto).filter(Boolean);
}

export function mapBlockedUserDto(dto) {
  if (!dto) return null;

  return {
    id: pick(dto, 'id', 'Id'),
    userId: pick(dto, 'userId', 'UserId'),
    blockedUserId: pick(dto, 'blockedUserId', 'BlockedUserId'),
    blockedAt: pick(dto, 'blockedAt', 'BlockedAt'),
    unfollowedAt: pick(dto, 'unblockedAt', 'UnblockedAt'),
  };
}

export function mapGroupDto(dto) {
  if (!dto) return null;

  const id = pick(dto, 'id', 'Id');
  const avatarUrl = pick(dto, 'avatarUrl', 'AvatarUrl');

  return {
    id,
    groupId: id,
    ownerId: pick(dto, 'ownerId', 'OwnerId'),
    name: pick(dto, 'name', 'Name') ?? '',
    description: pick(dto, 'description', 'Description') ?? '',
    avatarUrl,
    imageUrl: resolveUploadUrl(avatarUrl),
    membersCount: pick(dto, 'membersCount', 'MembersCount') ?? 0,
    postsPerWeek: pick(dto, 'postsPerWeek', 'PostsPerWeek') ?? 0,
    rules: Array.isArray(dto?.rules) ? dto.rules : [],
    category: pick(dto, 'category', 'Category') ?? 'Group',
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
  };
}

export function mapGroupList(items = []) {
  const list = Array.isArray(items) ? items : [];
  return list.map(mapGroupDto).filter(Boolean);
}

export function mapGroupMemberDto(dto) {
  if (!dto) return null;

  const userId = pick(dto, 'userId', 'UserId');

  return {
    id: userId,
    userId,
    role: pick(dto, 'role', 'Role') ?? 'Member',
    joinedAt: pick(dto, 'joinedAt', 'JoinedAt'),
  };
}

export function mapGroupMemberList(items = []) {
  const list = Array.isArray(items) ? items : [];
  return list.map(mapGroupMemberDto).filter(Boolean);
}

export function mapGroupPostDto(dto) {
  if (!dto) return null;

  return {
    id: pick(dto, 'id', 'Id'),
    groupId: pick(dto, 'groupId', 'GroupId'),
    postId: pick(dto, 'postId', 'PostId'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
  };
}

export function mapGroupPostList(items = []) {
  const list = Array.isArray(items) ? items : [];
  return list.map(mapGroupPostDto).filter(Boolean);
}

export function mapPageDto(dto) {
  if (!dto) return null;

  const id = pick(dto, 'id', 'Id');
  const logoUrl = pick(dto, 'logoUrl', 'LogoUrl');

  return {
    id,
    pageId: id,
    ownerId: pick(dto, 'ownerId', 'OwnerId'),
    name: pick(dto, 'name', 'Name') ?? '',
    description: pick(dto, 'description', 'Description') ?? '',
    logoUrl,
    imageUrl: resolveUploadUrl(logoUrl),
    followersCount: pick(dto, 'followersCount', 'FollowersCount') ?? 0,
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
  };
}

export function mapPageList(items = []) {
  const list = Array.isArray(items) ? items : [];
  return list.map(mapPageDto).filter(Boolean);
}

export function mapPersonSuggestion(profile) {
  if (!profile) return null;

  const userId = profile.userId ?? profile.id;
  const avatarUrl = profile.avatarUrl ?? profile.AvatarUrl;
  const headline = profile.headline ?? profile.profileTitle ?? '';

  return {
    id: userId,
    userId,
    firstName: profile.firstName ?? '',
    secondName: profile.secondName ?? profile.lastName ?? '',
    name: profile.displayName || getDisplayName({ user: profile }),
    headline,
    profileTitle: headline,
    title: headline,
    avatarUrl,
    avatar: avatarUrl ? resolveUploadUrl(avatarUrl) : '',
    status: 'suggested',
    mutualConnections: 0,
    isConnected: false,
    isPending: false,
    direction: null,
    cardType: 'suggestion',
  };
}

export function mapContactToDisplay(contact, profile, currentUserId) {
  if (!contact) return null;

  const userId = getContactOtherUserId(contact, currentUserId);
  const status = String(contact.status ?? '').toLowerCase();
  const isRequester = contact.requesterId === currentUserId;

  let cardType = 'contact';
  let direction = null;

  if (status === 'pending') {
    cardType = isRequester ? 'outgoing' : 'incoming';
    direction = cardType;
  }

  const user = profile?.user ?? profile;
  const name = profile?.failed
    ? 'User'
    : getDisplayName(profile ?? { user: { id: userId } });
  const avatarUrl = user?.avatarUrl ?? user?.AvatarUrl ?? null;
  const headline =
    user?.headline ?? user?.profileTitle ?? profile?.headline ?? '';

  return {
    ...contact,
    userId,
    contactId: contact.id ?? contact.contactId,
    name,
    firstName: user?.firstName ?? name.split(' ')[0] ?? 'User',
    secondName: user?.secondName ?? user?.lastName ?? '',
    profileTitle: headline,
    title: headline,
    headline,
    avatarUrl,
    avatar: avatarUrl ? resolveUploadUrl(avatarUrl) : '',
    cardType,
    direction,
    isConnected: status === 'accepted',
    isPending: status === 'pending',
    mutualConnections: contact.mutualConnections ?? 0,
  };
}

export function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.Items)) return response.Items;
  return [];
}
