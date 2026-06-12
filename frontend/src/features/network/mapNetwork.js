import { resolveMediaUrl } from "../profile/mapProfile";

export const CONTACT_STATUS = Object.freeze({
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
});

export const RELATIONSHIP_STATE = Object.freeze({
  NONE: "none",
  PENDING_INCOMING: "pendingIncoming",
  PENDING_OUTGOING: "pendingOutgoing",
  ACCEPTED: "accepted",
  BLOCKED: "blocked",
  FOLLOWED: "followed",
});

export function normalizeContactStatus(status) {
  return String(status || "").trim().toLowerCase();
}

const EMPTY_RELATIONSHIP = Object.freeze({
  userId: "",
  contactStatus: null,
  contactDirection: null,
  contactId: null,
  isFollowed: false,
  isBlocked: false,
  blockId: null,
});

export function buildRelationshipIndex({
  acceptedPeople = [],
  incomingContacts = [],
  outgoingContacts = [],
  followingPeople = [],
  blockedPeople = [],
} = {}) {
  const byUserId = new Map();

  const ensure = (userId) => {
    const key = String(userId);
    if (!byUserId.has(key)) {
      byUserId.set(key, {
        userId: key,
        contactStatus: null,
        contactDirection: null,
        contactId: null,
        isFollowed: false,
        isBlocked: false,
        blockId: null,
      });
    }
    return byUserId.get(key);
  };

  acceptedPeople.forEach((person) => {
    if (!person?.userId) return;
    const row = ensure(person.userId);
    row.contactStatus = normalizeContactStatus(person.status) || CONTACT_STATUS.ACCEPTED;
    row.contactId = person.id;
    row.contactDirection = null;
  });

  incomingContacts.forEach((person) => {
    if (!person?.userId) return;
    const row = ensure(person.userId);
    row.contactStatus = normalizeContactStatus(person.status) || CONTACT_STATUS.PENDING;
    row.contactDirection = "incoming";
    row.contactId = person.id;
  });

  outgoingContacts.forEach((person) => {
    if (!person?.userId) return;
    const row = ensure(person.userId);
    row.contactStatus = normalizeContactStatus(person.status) || CONTACT_STATUS.PENDING;
    row.contactDirection = "outgoing";
    row.contactId = person.id;
  });

  followingPeople.forEach((person) => {
    if (!person?.userId) return;
    ensure(person.userId).isFollowed = true;
  });

  blockedPeople.forEach((person) => {
    if (!person?.userId) return;
    const row = ensure(person.userId);
    row.isBlocked = true;
    row.blockId = person.id;
  });

  return byUserId;
}

export function getUserRelationship(index, userId) {
  if (!userId) return { ...EMPTY_RELATIONSHIP };
  return index.get(String(userId)) ?? { ...EMPTY_RELATIONSHIP, userId: String(userId) };
}

export function getRelationshipStateKey(rel) {
  if (!rel?.userId) return RELATIONSHIP_STATE.NONE;
  if (rel.isBlocked) return RELATIONSHIP_STATE.BLOCKED;
  if (rel.contactStatus === CONTACT_STATUS.PENDING) {
    return rel.contactDirection === "incoming"
      ? RELATIONSHIP_STATE.PENDING_INCOMING
      : RELATIONSHIP_STATE.PENDING_OUTGOING;
  }
  if (rel.contactStatus === CONTACT_STATUS.ACCEPTED) return RELATIONSHIP_STATE.ACCEPTED;
  if (rel.isFollowed) return RELATIONSHIP_STATE.FOLLOWED;
  return RELATIONSHIP_STATE.NONE;
}

export function getRelationshipStatusLabels(rel, t = (key, fallback) => fallback || key) {
  if (!rel?.userId) return [];
  const labels = [];
  if (rel.isBlocked) {
    labels.push(t("network.state.blocked", "Blocked"));
    return labels;
  }
  if (rel.contactStatus === CONTACT_STATUS.PENDING && rel.contactDirection === "outgoing") {
    labels.push(t("network.state.pendingOutgoing", "Pending"));
  } else if (rel.contactStatus === CONTACT_STATUS.PENDING && rel.contactDirection === "incoming") {
    labels.push(t("network.state.pendingIncoming", "Incoming request"));
  } else if (rel.contactStatus === CONTACT_STATUS.ACCEPTED) {
    labels.push(t("network.state.accepted", "Contact"));
  }
  if (rel.isFollowed) {
    labels.push(t("network.state.followed", "Following"));
  }
  return labels;
}

export function resolvePersonCardActions(rel, { isSearchResult = false } = {}) {
  const stateKey = getRelationshipStateKey(rel);

  if (stateKey === RELATIONSHIP_STATE.BLOCKED) {
    return { kind: "unblock", stateKey, labels: getRelationshipStatusLabels(rel) };
  }
  if (stateKey === RELATIONSHIP_STATE.PENDING_OUTGOING) {
    return { kind: "pendingOutgoing", stateKey, labels: getRelationshipStatusLabels(rel) };
  }
  if (stateKey === RELATIONSHIP_STATE.PENDING_INCOMING) {
    return { kind: "pendingIncoming", stateKey, labels: getRelationshipStatusLabels(rel), contactId: rel.contactId };
  }
  if (stateKey === RELATIONSHIP_STATE.ACCEPTED || (!isSearchResult && rel.contactStatus === CONTACT_STATUS.ACCEPTED)) {
    return {
      kind: "contact",
      stateKey,
      labels: getRelationshipStatusLabels(rel),
      isFollowed: Boolean(rel.isFollowed),
    };
  }
  if (isSearchResult || stateKey === RELATIONSHIP_STATE.NONE || stateKey === RELATIONSHIP_STATE.FOLLOWED) {
    return {
      kind: "connect",
      stateKey,
      labels: getRelationshipStatusLabels(rel),
      isFollowed: Boolean(rel.isFollowed),
    };
  }
  return { kind: "none", stateKey, labels: getRelationshipStatusLabels(rel) };
}

export function normalizeFollowDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    followerId: dto.followerId ?? dto.FollowerId,
    followingId: dto.followingId ?? dto.FollowingId,
    followedAt: dto.followedAt ?? dto.FollowedAt,
    unfollowedAt: dto.unfollowedAt ?? dto.UnfollowedAt,
  };
}

function mapFollowUserToPerson(follow, profile, userId) {
  const name =
    profile?.fullName?.trim() ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    `User ${String(userId).slice(0, 8)}`;
  const avatar = profile?.avatarUrl ? resolveMediaUrl(profile.avatarUrl) : "";

  return {
    id: String(follow.id),
    userId,
    name,
    role: profile?.headline || profile?.profileTitle || "Member",
    handle: String(userId).slice(0, 12),
    seed: userId,
    avatar,
    keywords: `${name} ${profile?.headline || ""}`.toLowerCase(),
    status: "followed",
    _api: true,
  };
}

export function mapFollowToPerson(follow, profile) {
  return mapFollowUserToPerson(follow, profile, follow.followingId);
}

export function mapFollowerToPerson(follow, profile) {
  return mapFollowUserToPerson(follow, profile, follow.followerId);
}

export function normalizePageDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    ownerId: dto.ownerId ?? dto.OwnerId,
    name: dto.name ?? dto.Name ?? "",
    description: dto.description ?? dto.Description ?? "",
    logoUrl: dto.logoUrl ?? dto.LogoUrl ?? "",
    createdAt: dto.createdAt ?? dto.CreatedAt,
    updatedAt: dto.updatedAt ?? dto.UpdatedAt,
  };
}

export function normalizeGroupDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    ownerId: dto.ownerId ?? dto.OwnerId,
    name: dto.name ?? dto.Name ?? "",
    description: dto.description ?? dto.Description ?? "",
    avatarUrl: dto.avatarUrl ?? dto.AvatarUrl ?? "",
    createdAt: dto.createdAt ?? dto.CreatedAt,
    updatedAt: dto.updatedAt ?? dto.UpdatedAt,
  };
}

export function normalizeGroupMemberDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    groupId: dto.groupId ?? dto.GroupId,
    userId: dto.userId ?? dto.UserId,
    role: dto.role ?? dto.Role ?? "",
    createdAt: dto.createdAt ?? dto.CreatedAt,
  };
}

export function mapPageToView(page, { isFollowing = false, isOwned = false } = {}) {
  const logoUrl = page.logoUrl ? resolveMediaUrl(page.logoUrl) : "";
  return {
    id: String(page.id),
    name: String(page.name || ""),
    description: String(page.description || ""),
    logoUrl,
    seed: page.name || page.id,
    isFollowing,
    isOwned,
    ownerId: page.ownerId,
    _api: true,
  };
}

export function mergePagesForDisplay(myPages = [], followedPages = []) {
  const byId = new Map();
  myPages.forEach((page) => {
    byId.set(String(page.id), mapPageToView(page, { isOwned: true }));
  });
  followedPages.forEach((page) => {
    const id = String(page.id);
    if (byId.has(id)) {
      byId.get(id).isFollowing = true;
    } else {
      byId.set(id, mapPageToView(page, { isFollowing: true }));
    }
  });
  return [...byId.values()];
}

export function mapGroupToView(group, { memberCount = 0 } = {}) {
  const avatarUrl = group.avatarUrl ? resolveMediaUrl(group.avatarUrl) : "";
  return {
    id: String(group.id),
    name: String(group.name || ""),
    description: String(group.description || ""),
    avatarUrl,
    seed: group.name || group.id,
    memberCount,
    ownerId: group.ownerId,
    _api: true,
  };
}

export function normalizeBlockedUserDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    userId: dto.userId ?? dto.UserId,
    blockedUserId: dto.blockedUserId ?? dto.BlockedUserId,
    blockedAt: dto.blockedAt ?? dto.BlockedAt,
    unblockedAt: dto.unblockedAt ?? dto.UnblockedAt,
  };
}

export function mapBlockedUserToPerson(block, profile) {
  const userId = block.blockedUserId;
  const name =
    profile?.fullName?.trim() ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    `User ${String(userId).slice(0, 8)}`;
  const avatar = profile?.avatarUrl ? resolveMediaUrl(profile.avatarUrl) : "";

  return {
    id: String(block.id),
    userId,
    name,
    role: profile?.headline || profile?.profileTitle || "Member",
    handle: String(userId).slice(0, 12),
    seed: userId,
    avatar,
    blockedAt: block.blockedAt,
    status: "blocked",
    keywords: `${name} ${profile?.headline || ""}`.toLowerCase(),
    _api: true,
  };
}

export function normalizePendingContactCounts(data) {
  if (!data || typeof data !== "object") {
    return { incomingCount: 0, outgoingCount: 0 };
  }
  return {
    incomingCount: Number(data.incomingCount ?? data.IncomingCount ?? 0) || 0,
    outgoingCount: Number(data.outgoingCount ?? data.OutgoingCount ?? 0) || 0,
  };
}

export function normalizeContactDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  return {
    id: dto.id ?? dto.Id,
    requesterId: dto.requesterId ?? dto.RequesterId,
    receiverId: dto.receiverId ?? dto.ReceiverId,
    status: dto.status ?? dto.Status ?? "",
    requestedAt: dto.requestedAt ?? dto.RequestedAt,
    respondedAt: dto.respondedAt ?? dto.RespondedAt,
    statusChangedAt: dto.statusChangedAt ?? dto.StatusChangedAt,
  };
}

export function mapContactDtoToPerson(contact, profile, currentUserId) {
  const otherUserId =
    String(contact.requesterId) === String(currentUserId) ? contact.receiverId : contact.requesterId;
  const name =
    profile?.fullName?.trim() ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    `User ${String(otherUserId).slice(0, 8)}`;

  const avatar = profile?.avatarUrl ? resolveMediaUrl(profile.avatarUrl) : "";

  return {
    id: String(contact.id),
    userId: otherUserId,
    name,
    role: profile?.headline || profile?.profileTitle || "Member",
    handle: String(otherUserId).slice(0, 12),
    seed: otherUserId,
    avatar,
    keywords: `${name} ${profile?.headline || ""}`.toLowerCase(),
    mutual: 0,
    status: normalizeContactStatus(contact.status),
    _api: true,
  };
}
