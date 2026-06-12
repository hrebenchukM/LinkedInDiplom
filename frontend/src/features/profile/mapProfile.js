import { getApiBaseUrl } from "../../shared/api/config";

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

export function mapProfileDtoToRegisteredPatch(dto = {}) {
  const location = String(dto.location || "").trim();
  const locationParts = location ? location.split(",").map((part) => part.trim()) : [];
  const city = locationParts[0] || "";
  const country = locationParts.slice(1).join(", ").trim();

  return {
    firstName: dto.firstName || "",
    lastName: dto.lastName || "",
    specialty: dto.headline || "",
    position: dto.profileTitle || "",
    city,
    country,
    about: dto.genInfo || "",
    education: dto.university || "",
    portfolioUrl: String(dto.portfolioUrl || "").trim(),
    avatarDataUrl: resolveMediaUrl(dto.avatarUrl),
    headerDataUrl: resolveMediaUrl(dto.headerUrl),
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
  const patch = mapProfileDtoToRegisteredPatch(dto);
  const firstName = String(dto.firstName || "").trim();
  const lastName = String(dto.lastName || "").trim();
  const fullName =
    String(dto.fullName || "").trim() ||
    `${firstName} ${lastName}`.trim() ||
    "User";
  const location = [patch.city, patch.country].filter(Boolean).join(", ");

  return {
    userId: dto.userId,
    fullName,
    headline: String(dto.headline || "").trim(),
    profileTitle: String(dto.profileTitle || "").trim(),
    location,
    city: patch.city,
    country: patch.country,
    about: patch.about,
    education: patch.education,
    avatarUrl: patch.avatarDataUrl,
    headerUrl: patch.headerDataUrl,
    portfolioUrl: String(dto.portfolioUrl || "").trim(),
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
  const avatar = normalized.avatarUrl ? resolveMediaUrl(normalized.avatarUrl) : "";

  return {
    id: `search-${normalized.userId}`,
    userId: normalized.userId,
    name,
    role,
    handle: normalized.userId.slice(0, 12),
    seed: normalized.userId,
    avatar,
    keywords: `${name} ${normalized.headline} ${normalized.location}`.toLowerCase(),
    _api: true,
    _searchResult: true,
  };
}

export function mapProfileDtoToUiProfile(dto = {}, account = {}) {
  const firstName = String(dto.firstName || "").trim();
  const lastName = String(dto.lastName || "").trim();
  const fullName =
    String(dto.fullName || "").trim() ||
    `${firstName} ${lastName}`.trim() ||
    String(account.email || "").split("@")[0] ||
    "User";

  return {
    name: fullName,
    headline: String(dto.headline || dto.profileTitle || "Member").trim(),
    city: mapProfileDtoToRegisteredPatch(dto).city,
    about: String(dto.genInfo || "").trim(),
  };
}
