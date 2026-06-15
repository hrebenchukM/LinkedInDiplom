import { getApiBaseUrl } from "../../shared/api/config";

const DICEBEAR_AVATAR_BASE = "https://api.dicebear.com/7.x/avataaars/svg";

function isGuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

const GENERIC_PEER_LABELS = new Set(["chat", "user", "contact", "member"]);

/** Relative `/uploads/...` paths work via Vite proxy when API base is empty. */
export function resolveMediaUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }
  const base = getApiBaseUrl();
  if (!base) return value.startsWith("/") ? value : `/${value}`;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${base}${path}`;
}

/** Stable Dicebear seed — GUID user/chat id first so avatars never collide across people. */
export function resolveAvatarSeed({ profile, userId, name, avatarUrl } = {}) {
  const sources = [
    String(avatarUrl || profile?.avatarUrl || "").trim(),
    String(profile?.avatarUrl || "").trim(),
  ];

  for (const source of sources) {
    const match = source.match(/[?&]seed=([^&]+)/i);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }

  const uid = String(userId || profile?.userId || "").trim();
  if (isGuid(uid)) {
    return uid.toLowerCase();
  }

  const email = String(profile?.email || "").trim();
  if (email.includes("@")) {
    return email.split("@")[0];
  }

  const displayName = String(
    profile?.fullName ||
      `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
      name ||
      "",
  ).trim();
  const normalizedName = displayName.replace(/\s+/g, "");
  if (normalizedName && !GENERIC_PEER_LABELS.has(normalizedName.toLowerCase())) {
    return normalizedName;
  }

  return uid || normalizedName || "user";
}

/** Profile URL when available; otherwise a deterministic Dicebear avatar. */
export function resolvePersonAvatar({ profile, userId, name, avatarUrl } = {}) {
  const explicit = String(avatarUrl || profile?.avatarUrl || "").trim();
  if (explicit) {
    const resolved = resolveMediaUrl(explicit);
    if (resolved) return resolved;
  }

  const seed = resolveAvatarSeed({ profile, userId, name, avatarUrl: explicit });
  return `${DICEBEAR_AVATAR_BASE}?seed=${encodeURIComponent(seed)}`;
}

/** Normalize ProfileDto / ProfileResponse profile (camelCase or PascalCase). */
export function normalizeProfileDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const userId = dto.userId ?? dto.UserId;
  const id = dto.id ?? dto.Id;
  if (!userId && !id) return null;

  return {
    id,
    userId: userId != null ? String(userId) : undefined,
    firstName: String(dto.firstName ?? dto.FirstName ?? "").trim(),
    lastName: String(dto.lastName ?? dto.LastName ?? "").trim(),
    fullName: String(dto.fullName ?? dto.FullName ?? "").trim(),
    avatarUrl: String(dto.avatarUrl ?? dto.AvatarUrl ?? "").trim(),
    headerUrl: String(dto.headerUrl ?? dto.HeaderUrl ?? "").trim(),
    profileTitle: String(dto.profileTitle ?? dto.ProfileTitle ?? "").trim(),
    headline: String(dto.headline ?? dto.Headline ?? "").trim(),
    genInfo: String(dto.genInfo ?? dto.GenInfo ?? "").trim(),
    university: String(dto.university ?? dto.University ?? "").trim(),
    location: String(dto.location ?? dto.Location ?? "").trim(),
    portfolioUrl: String(dto.portfolioUrl ?? dto.PortfolioUrl ?? "").trim(),
    isCompany: Boolean(dto.isCompany ?? dto.IsCompany ?? false),
  };
}

export function mapProfileDtoToRegisteredPatch(dto = {}) {
  const normalized = normalizeProfileDto(dto) || dto;
  const location = String(normalized.location || "").trim();
  const locationParts = location ? location.split(",").map((part) => part.trim()) : [];
  const city = locationParts[0] || "";
  const country = locationParts.slice(1).join(", ").trim();

  return {
    firstName: normalized.firstName || "",
    lastName: normalized.lastName || "",
    specialty: normalized.headline || "",
    position: normalized.profileTitle || "",
    city,
    country,
    about: normalized.genInfo || "",
    education: normalized.university || "",
    portfolioUrl: String(normalized.portfolioUrl || "").trim(),
    avatarDataUrl: resolveMediaUrl(normalized.avatarUrl),
    headerDataUrl: resolveMediaUrl(normalized.headerUrl),
  };
}

export function mapRegisterFallbackToPatchRequest(fallback = {}) {
  const patch = {};
  const firstName = String(fallback.firstName || "").trim();
  const lastName = String(fallback.lastName || "").trim();
  const headline = String(fallback.specialty || fallback.headline || "").trim();

  if (firstName) patch.firstName = firstName;
  if (lastName) patch.lastName = lastName;
  if (headline) patch.headline = headline;

  return patch;
}

export function mapProfileFormToPatchRequest(form = {}) {
  const location = [form.city, form.country]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");

  const patch = {
    firstName: String(form.firstName || "").trim() || null,
    lastName: String(form.lastName || "").trim() || null,
    headline: String(form.specialty || "").trim() || null,
    profileTitle: String(form.position || "").trim() || null,
    genInfo: String(form.about || "").trim() || null,
    university: String(form.education || "").trim() || null,
    portfolioUrl: String(form.portfolioUrl || "").trim() || null,
    location: location || null,
  };

  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value != null && value !== ""));
}

export function mapProfileDtoToPublicView(dto = {}) {
  const normalized = normalizeProfileDto(dto) || dto;
  const patch = mapProfileDtoToRegisteredPatch(normalized);
  const firstName = String(normalized.firstName || "").trim();
  const lastName = String(normalized.lastName || "").trim();
  const fullName =
    String(normalized.fullName || "").trim() ||
    `${firstName} ${lastName}`.trim() ||
    "User";
  const location = [patch.city, patch.country].filter(Boolean).join(", ");

  return {
    userId: normalized.userId,
    fullName,
    headline: String(normalized.headline || "").trim(),
    profileTitle: String(normalized.profileTitle || "").trim(),
    location,
    city: patch.city,
    country: patch.country,
    about: patch.about,
    education: patch.education,
    avatarUrl: patch.avatarDataUrl,
    headerUrl: patch.headerDataUrl,
    portfolioUrl: String(normalized.portfolioUrl || "").trim(),
  };
}

export function normalizeProfileSearchDto(dto) {
  if (!dto || typeof dto !== "object") return null;
  const userId = dto.userId ?? dto.UserId;
  if (!userId) return null;
  return {
    userId: String(userId),
    firstName: String(dto.firstName ?? dto.FirstName ?? "").trim(),
    lastName: String(dto.lastName ?? dto.LastName ?? "").trim(),
    displayName: String(dto.displayName ?? dto.DisplayName ?? "").trim(),
    headline: String(dto.headline ?? dto.Headline ?? "").trim(),
    location: String(dto.location ?? dto.Location ?? "").trim(),
    avatarUrl: String(dto.avatarUrl ?? dto.AvatarUrl ?? "").trim(),
  };
}

export function mapProfileSearchToPerson(dto, currentUserId) {
  const normalized = normalizeProfileSearchDto(dto);
  if (!normalized) return null;
  if (currentUserId && String(normalized.userId) === String(currentUserId)) return null;

  const name =
    normalized.displayName ||
    `${normalized.firstName} ${normalized.lastName}`.trim() ||
    `User ${normalized.userId.slice(0, 8)}`;
  const role = normalized.headline || normalized.location || "Member";
  const profile = {
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    avatarUrl: normalized.avatarUrl,
  };
  const avatarSeed = resolveAvatarSeed({ profile, userId: normalized.userId, name });
  const avatar = resolvePersonAvatar({ profile, userId: normalized.userId, name });

  return {
    id: `search-${normalized.userId}`,
    userId: normalized.userId,
    name,
    role,
    handle: normalized.userId.slice(0, 12),
    seed: avatarSeed,
    avatar,
    keywords: `${name} ${normalized.headline} ${normalized.location}`.toLowerCase(),
    _api: true,
    _searchResult: true,
  };
}

export function mapProfileDtoToUiProfile(dto = {}, account = {}) {
  const normalized = normalizeProfileDto(dto) || dto;
  const firstName = String(normalized.firstName || "").trim();
  const lastName = String(normalized.lastName || "").trim();
  const fullName =
    String(normalized.fullName || "").trim() ||
    `${firstName} ${lastName}`.trim() ||
    String(account.email || "").split("@")[0] ||
    "User";

  return {
    name: fullName,
    headline: String(normalized.headline || normalized.profileTitle || "Member").trim(),
    city: mapProfileDtoToRegisteredPatch(normalized).city,
    about: String(normalized.genInfo || "").trim(),
  };
}
