import { fetchProfilesByUserIds } from "../profile/profileApi";
import { resolvePersonAvatar } from "../profile/mapProfile";

function resolveAuthorName(profile, userId, currentUserId, displayName, memberLabel) {
  const fromProfile =
    String(profile?.fullName || "").trim() ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
  if (fromProfile) return fromProfile;
  if (currentUserId && String(userId) === String(currentUserId) && displayName) return displayName;
  return memberLabel;
}

function mapSingleComment(dto, profiles, { currentUserId, displayName, userAvatar, memberLabel }) {
  const userId = dto.userId ?? dto.UserId;
  const profile = userId ? profiles[String(userId)] : null;
  const author = resolveAuthorName(profile, userId, currentUserId, displayName, memberLabel);
  const isOwn = currentUserId && String(userId) === String(currentUserId);

  return {
    id: String(dto.id ?? dto.Id),
    userId: userId ? String(userId) : "",
    author,
    avatar: isOwn && userAvatar ? userAvatar : resolvePersonAvatar({ profile, userId, name: author }),
    seed: userId || author,
    text: String(dto.content ?? dto.Content ?? ""),
    _api: true,
  };
}

export async function mapCommentsWithAuthors(
  comments,
  { currentUserId, displayName, userAvatar, memberLabel = "Member" } = {},
) {
  const list = (Array.isArray(comments) ? comments : []).filter(Boolean);
  const userIds = [...new Set(list.map((dto) => dto.userId ?? dto.UserId).filter(Boolean))];
  const profiles = userIds.length ? await fetchProfilesByUserIds(userIds) : {};
  return list.map((dto) => mapSingleComment(dto, profiles, { currentUserId, displayName, userAvatar, memberLabel }));
}
