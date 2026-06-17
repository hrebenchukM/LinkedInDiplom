import { mapPagedResponse } from '../../shared/lib/pagination.js';

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRoles(roles) {
  if (!roles) return [];
  if (Array.isArray(roles)) return roles.map(String).filter(Boolean);
  return [String(roles)];
}

export function formatAdminDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolveDeletedStatus(dto) {
  const deletedAt = pick(dto, 'deletedAt', 'DeletedAt');
  const isDeleted = pick(dto, 'isDeleted', 'IsDeleted');
  if (typeof isDeleted === 'boolean') return isDeleted;
  return Boolean(deletedAt);
}

function resolveLockedStatus(dto) {
  const lockoutEnd = pick(dto, 'lockoutEnd', 'LockoutEnd');
  if (!lockoutEnd) return false;
  return new Date(lockoutEnd).getTime() > Date.now();
}

export function mapAdminStatsDto(dto) {
  if (!dto || typeof dto !== 'object') {
    return {
      totalUsers: 0,
      activeUsers: 0,
      deletedUsers: 0,
      totalPosts: 0,
      activePosts: 0,
      deletedPosts: 0,
      totalVacancies: 0,
      activeVacancies: 0,
      deletedVacancies: 0,
      totalEvents: 0,
      activeEvents: 0,
      deletedEvents: 0,
      upcomingEvents: 0,
      totalRecommendedJobQueries: 0,
    };
  }

  return {
    totalUsers: toNumber(pick(dto, 'totalUsers', 'TotalUsers')),
    activeUsers: toNumber(pick(dto, 'activeUsers', 'ActiveUsers')),
    deletedUsers: toNumber(pick(dto, 'deletedUsers', 'DeletedUsers')),
    totalPosts: toNumber(pick(dto, 'totalPosts', 'TotalPosts')),
    activePosts: toNumber(pick(dto, 'activePosts', 'ActivePosts')),
    deletedPosts: toNumber(pick(dto, 'deletedPosts', 'DeletedPosts')),
    totalVacancies: toNumber(pick(dto, 'totalVacancies', 'TotalVacancies')),
    activeVacancies: toNumber(pick(dto, 'activeVacancies', 'ActiveVacancies')),
    deletedVacancies: toNumber(pick(dto, 'deletedVacancies', 'DeletedVacancies')),
    totalEvents: toNumber(pick(dto, 'totalEvents', 'TotalEvents')),
    activeEvents: toNumber(pick(dto, 'activeEvents', 'ActiveEvents')),
    deletedEvents: toNumber(pick(dto, 'deletedEvents', 'DeletedEvents')),
    upcomingEvents: toNumber(pick(dto, 'upcomingEvents', 'UpcomingEvents')),
    totalRecommendedJobQueries: toNumber(
      pick(dto, 'totalRecommendedJobQueries', 'TotalRecommendedJobQueries'),
    ),
  };
}

export function mapAdminUserDto(dto) {
  if (!dto) return null;

  const roles = normalizeRoles(pick(dto, 'roles', 'Roles'));
  const isDeleted = resolveDeletedStatus(dto);
  const isLocked = resolveLockedStatus(dto);

  return {
    id: pick(dto, 'id', 'Id'),
    email: pick(dto, 'email', 'Email') ?? '',
    userName: pick(dto, 'userName', 'UserName') ?? '',
    emailConfirmed: Boolean(pick(dto, 'emailConfirmed', 'EmailConfirmed')),
    lockoutEnabled: Boolean(pick(dto, 'lockoutEnabled', 'LockoutEnabled')),
    lockoutEnd: pick(dto, 'lockoutEnd', 'LockoutEnd'),
    isLocked,
    accessFailedCount: toNumber(pick(dto, 'accessFailedCount', 'AccessFailedCount')),
    roles,
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    deletedAt: pick(dto, 'deletedAt', 'DeletedAt'),
    isDeleted,
    status: isDeleted ? 'Deleted' : isLocked ? 'Locked' : 'Active',
    createdAtLabel: formatAdminDate(pick(dto, 'createdAt', 'CreatedAt')),
  };
}

export function mapAdminUsersResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapAdminUserDto).filter(Boolean),
  };
}

export function mapAdminRoleDto(dto) {
  if (!dto) return null;
  if (typeof dto === 'string') {
    return { id: dto, name: dto, description: '' };
  }

  return {
    id: pick(dto, 'id', 'Id') ?? pick(dto, 'name', 'Name'),
    name: pick(dto, 'name', 'Name') ?? String(dto),
    description: pick(dto, 'description', 'Description') ?? '',
  };
}

export function mapAdminRoleList(response) {
  const items = Array.isArray(response) ? response : [];
  return items.map(mapAdminRoleDto).filter(Boolean);
}

export function mapAdminPostDto(dto) {
  if (!dto) return null;

  const content = pick(dto, 'content', 'Content') ?? '';
  const isDeleted = resolveDeletedStatus(dto);

  return {
    id: pick(dto, 'id', 'Id'),
    userId: pick(dto, 'userId', 'UserId'),
    authorId: pick(dto, 'userId', 'UserId'),
    content,
    contentPreview: content.length > 120 ? `${content.slice(0, 120)}...` : content,
    visibility: pick(dto, 'visibility', 'Visibility') ?? '',
    reactionCount: toNumber(pick(dto, 'reactionCount', 'ReactionCount')),
    commentCount: toNumber(pick(dto, 'commentCount', 'CommentCount')),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'editedAt', 'EditedAt', 'updatedAt', 'UpdatedAt'),
    deletedAt: pick(dto, 'deletedAt', 'DeletedAt'),
    isDeleted,
    status: isDeleted ? 'Deleted' : 'Active',
    createdAtLabel: formatAdminDate(pick(dto, 'createdAt', 'CreatedAt')),
  };
}

export function mapAdminPostsResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapAdminPostDto).filter(Boolean),
  };
}

export function mapAdminCommentDto(dto) {
  if (!dto) return null;

  const content = pick(dto, 'content', 'Content') ?? '';
  const isDeleted = resolveDeletedStatus(dto);

  return {
    id: pick(dto, 'id', 'Id'),
    postId: pick(dto, 'postId', 'PostId'),
    authorUserId: pick(dto, 'authorUserId', 'AuthorUserId'),
    authorId: pick(dto, 'authorUserId', 'AuthorUserId'),
    content,
    contentPreview: content.length > 120 ? `${content.slice(0, 120)}...` : content,
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    deletedAt: pick(dto, 'deletedAt', 'DeletedAt'),
    isDeleted,
    status: isDeleted ? 'Deleted' : 'Active',
    createdAtLabel: formatAdminDate(pick(dto, 'createdAt', 'CreatedAt')),
  };
}

export function mapAdminCommentsResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapAdminCommentDto).filter(Boolean),
  };
}

export function mapAdminVacancyDto(dto) {
  if (!dto) return null;

  const isDeleted = resolveDeletedStatus(dto);

  return {
    id: pick(dto, 'id', 'Id'),
    companyId: pick(dto, 'companyId', 'CompanyId'),
    companyName: pick(dto, 'companyName', 'CompanyName') ?? '',
    postedBy: pick(dto, 'postedBy', 'PostedBy'),
    title: pick(dto, 'title', 'Title') ?? '',
    location: pick(dto, 'location', 'Location') ?? '',
    jobType: pick(dto, 'jobType', 'JobType'),
    description: pick(dto, 'description', 'Description') ?? '',
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    deletedAt: pick(dto, 'deletedAt', 'DeletedAt'),
    isDeleted,
    status: isDeleted ? 'Deleted' : 'Active',
    createdAtLabel: formatAdminDate(pick(dto, 'createdAt', 'CreatedAt')),
  };
}

export function mapAdminVacanciesResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapAdminVacancyDto).filter(Boolean),
  };
}

export function mapAdminEventDto(dto) {
  if (!dto) return null;

  const isDeleted = resolveDeletedStatus(dto);
  const startAt = pick(dto, 'startAt', 'StartAt');

  return {
    id: pick(dto, 'id', 'Id'),
    organizerId: pick(dto, 'organizerUserId', 'OrganizerUserId'),
    organizerUserId: pick(dto, 'organizerUserId', 'OrganizerUserId'),
    title: pick(dto, 'title', 'Title') ?? '',
    location: pick(dto, 'location', 'Location') ?? '',
    isOnline: Boolean(pick(dto, 'isOnline', 'IsOnline')),
    attendeeCount: toNumber(pick(dto, 'attendeeCount', 'AttendeeCount')),
    startAt,
    endAt: pick(dto, 'endAt', 'EndAt'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
    deletedAt: pick(dto, 'deletedAt', 'DeletedAt'),
    isDeleted,
    status: isDeleted ? 'Deleted' : 'Active',
    startAtLabel: formatAdminDate(startAt),
    createdAtLabel: formatAdminDate(pick(dto, 'createdAt', 'CreatedAt')),
  };
}

export function mapAdminEventsResponse(response) {
  const paged = mapPagedResponse(response);
  return {
    ...paged,
    items: paged.items.map(mapAdminEventDto).filter(Boolean),
  };
}
