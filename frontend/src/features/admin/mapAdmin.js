function pick(dto, camel, pascal, fallback = "") {
  const value = dto?.[camel] ?? dto?.[pascal];
  if (value === undefined || value === null) return fallback;
  return value;
}

export function normalizeAdminUserDto(dto) {
  const id = pick(dto, "id", "Id");
  if (!id) return null;
  const rolesRaw = dto.roles ?? dto.Roles ?? [];
  const roles = Array.isArray(rolesRaw) ? rolesRaw.map(String) : [];
  const lockoutEnd = dto.lockoutEnd ?? dto.LockoutEnd ?? null;
  const deletedAt = dto.deletedAt ?? dto.DeletedAt ?? null;
  return {
    id: String(id),
    email: String(pick(dto, "email", "Email")),
    userName: String(pick(dto, "userName", "UserName")),
    emailConfirmed: Boolean(pick(dto, "emailConfirmed", "EmailConfirmed", false)),
    lockoutEnabled: Boolean(pick(dto, "lockoutEnabled", "LockoutEnabled", false)),
    lockoutEnd,
    isLocked: Boolean(lockoutEnd && new Date(lockoutEnd) > new Date()),
    isDeleted: Boolean(deletedAt),
    deletedAt,
    createdAt: pick(dto, "createdAt", "CreatedAt"),
    roles,
  };
}

export function normalizeAdminStatsDto(dto) {
  if (!dto) return null;
  return {
    totalUsers: Number(dto.totalUsers ?? dto.TotalUsers ?? 0),
    activeUsers: Number(dto.activeUsers ?? dto.ActiveUsers ?? 0),
    deletedUsers: Number(dto.deletedUsers ?? dto.DeletedUsers ?? 0),
    totalPosts: Number(dto.totalPosts ?? dto.TotalPosts ?? 0),
    activePosts: Number(dto.activePosts ?? dto.ActivePosts ?? 0),
    deletedPosts: Number(dto.deletedPosts ?? dto.DeletedPosts ?? 0),
    totalVacancies: Number(dto.totalVacancies ?? dto.TotalVacancies ?? 0),
    activeVacancies: Number(dto.activeVacancies ?? dto.ActiveVacancies ?? 0),
    deletedVacancies: Number(dto.deletedVacancies ?? dto.DeletedVacancies ?? 0),
    totalEvents: Number(dto.totalEvents ?? dto.TotalEvents ?? 0),
    activeEvents: Number(dto.activeEvents ?? dto.ActiveEvents ?? 0),
    upcomingEvents: Number(dto.upcomingEvents ?? dto.UpcomingEvents ?? 0),
    totalRecommendedJobQueries: Number(
      dto.totalRecommendedJobQueries ?? dto.TotalRecommendedJobQueries ?? 0,
    ),
  };
}

export function normalizeAdminPostDto(dto) {
  const id = dto?.id ?? dto?.Id;
  if (!id) return null;
  return {
    id: String(id),
    userId: String(dto.userId ?? dto.UserId ?? ""),
    content: String(dto.content ?? dto.Content ?? ""),
    visibility: String(dto.visibility ?? dto.Visibility ?? ""),
    commentCount: Number(dto.commentCount ?? dto.CommentCount ?? 0),
    reactionCount: Number(dto.reactionCount ?? dto.ReactionCount ?? 0),
    isDeleted: Boolean(dto.isDeleted ?? dto.IsDeleted ?? dto.deletedAt ?? dto.DeletedAt),
    createdAt: dto.createdAt ?? dto.CreatedAt,
    deletedAt: dto.deletedAt ?? dto.DeletedAt ?? null,
  };
}

export function normalizeAdminVacancyDto(dto) {
  const id = dto?.id ?? dto?.Id;
  if (!id) return null;
  return {
    id: String(id),
    title: String(dto.title ?? dto.Title ?? ""),
    companyId: String(dto.companyId ?? dto.CompanyId ?? ""),
    postedBy: String(dto.postedBy ?? dto.PostedBy ?? dto.postedByUserId ?? dto.PostedByUserId ?? ""),
    location: String(dto.location ?? dto.Location ?? ""),
    isDeleted: Boolean(dto.isDeleted ?? dto.IsDeleted ?? dto.deletedAt ?? dto.DeletedAt),
    createdAt: dto.createdAt ?? dto.CreatedAt,
    deletedAt: dto.deletedAt ?? dto.DeletedAt ?? null,
  };
}

export function normalizeRecommendedQueryDto(dto) {
  const id = dto?.id ?? dto?.Id;
  const query = String(dto?.query ?? dto?.Query ?? "").trim();
  if (!id || !query) return null;
  return {
    id: String(id),
    query,
    createdAt: dto.createdAt ?? dto.CreatedAt,
  };
}

export function normalizeAdminCommentDto(dto) {
  const id = dto?.id ?? dto?.Id;
  if (!id) return null;
  return {
    id: String(id),
    postId: String(dto.postId ?? dto.PostId ?? ""),
    authorUserId: String(dto.authorUserId ?? dto.AuthorUserId ?? ""),
    content: String(dto.content ?? dto.Content ?? ""),
    isDeleted: Boolean(dto.isDeleted ?? dto.IsDeleted ?? dto.deletedAt ?? dto.DeletedAt),
    createdAt: dto.createdAt ?? dto.CreatedAt,
    deletedAt: dto.deletedAt ?? dto.DeletedAt ?? null,
  };
}

export function normalizeAdminEventDto(dto) {
  const id = dto?.id ?? dto?.Id;
  if (!id) return null;
  return {
    id: String(id),
    title: String(dto.title ?? dto.Title ?? ""),
    organizerUserId: String(dto.organizerUserId ?? dto.OrganizerUserId ?? ""),
    location: String(dto.location ?? dto.Location ?? ""),
    isOnline: Boolean(dto.isOnline ?? dto.IsOnline ?? false),
    attendeeCount: Number(dto.attendeeCount ?? dto.AttendeeCount ?? 0),
    startAt: dto.startAt ?? dto.StartAt,
    isDeleted: Boolean(dto.isDeleted ?? dto.IsDeleted ?? dto.deletedAt ?? dto.DeletedAt),
    createdAt: dto.createdAt ?? dto.CreatedAt,
    deletedAt: dto.deletedAt ?? dto.DeletedAt ?? null,
  };
}

export function normalizeRoleDto(dto) {
  const id = dto?.id ?? dto?.Id;
  const name = String(dto?.name ?? dto?.Name ?? "").trim();
  if (!id || !name) return null;
  return { id: String(id), name };
}
