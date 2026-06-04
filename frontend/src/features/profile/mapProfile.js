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
    avatarDataUrl: resolveMediaUrl(dto.avatarUrl),
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
    location: location || null,
  };

  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value != null && value !== ""));
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
