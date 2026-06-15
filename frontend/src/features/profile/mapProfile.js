import { resolveUploadUrl } from '../../shared/api/uploads.js';
import { mapPagedResponse } from '../../shared/lib/pagination.js';

function pick(dto, ...keys) {
  if (!dto) return null;
  for (const key of keys) {
    const value = dto[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function formatDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return String(value);
}

export function getDisplayName(profile) {
  if (!profile) return 'User';

  const user = profile.user ?? profile;
  const first = pick(user, 'firstName', 'FirstName') ?? '';
  const last = pick(user, 'secondName', 'lastName', 'LastName', 'surname') ?? '';
  const full = `${first} ${last}`.trim();

  if (full) return full;
  return pick(user, 'email', 'Email', 'userName', 'UserName') || 'User';
}

export function getProfileAvatar(profile) {
  const user = profile?.user ?? profile;
  const raw = pick(user, 'avatarUrl', 'AvatarUrl', 'avatar', 'Avatar');
  return raw ? resolveUploadUrl(raw) : '';
}

export function getProfileHeader(profile) {
  const user = profile?.user ?? profile;
  const raw =
    pick(user, 'headerUrl', 'HeaderUrl', 'backgroundUrl', 'BackgroundUrl', 'coverUrl', 'CoverUrl') ??
    pick(profile, 'headerUrl', 'HeaderUrl', 'backgroundUrl', 'coverUrl');
  return raw ? resolveUploadUrl(raw) : '';
}

/**
 * Map backend ProfileDto (flat) to UI shape expected by existing components.
 */
export function mapProfileDto(dto, accountEmail = null) {
  if (!dto) return null;

  const userId = pick(dto, 'userId', 'UserId', 'id', 'Id');
  const firstName = pick(dto, 'firstName', 'FirstName') ?? '';
  const lastName = pick(dto, 'lastName', 'LastName', 'secondName', 'SecondName') ?? '';
  const avatarUrl = pick(dto, 'avatarUrl', 'AvatarUrl');
  const headerUrl = pick(dto, 'headerUrl', 'HeaderUrl', 'backgroundUrl', 'BackgroundUrl');

  return {
    id: pick(dto, 'id', 'Id'),
    userId,
    login: accountEmail ?? pick(dto, 'email', 'Email') ?? userId,
    role: null,
    user: {
      id: userId,
      firstName,
      secondName: lastName,
      lastName,
      profileTitle: pick(dto, 'profileTitle', 'ProfileTitle'),
      headline: pick(dto, 'headline', 'Headline'),
      genInfo: pick(dto, 'genInfo', 'GenInfo'),
      about: pick(dto, 'genInfo', 'GenInfo'),
      university: pick(dto, 'university', 'University'),
      location: pick(dto, 'location', 'Location'),
      portfolioUrl: pick(dto, 'portfolioUrl', 'PortfolioUrl'),
      avatarUrl,
      headerUrl,
      isCompany: Boolean(pick(dto, 'isCompany', 'IsCompany')),
      email: accountEmail ?? pick(dto, 'email', 'Email'),
    },
    headline: pick(dto, 'headline', 'Headline'),
    location: pick(dto, 'location', 'Location'),
    about: pick(dto, 'genInfo', 'GenInfo'),
    createdAt: pick(dto, 'createdAt', 'CreatedAt'),
    updatedAt: pick(dto, 'updatedAt', 'UpdatedAt'),
  };
}

export function mapProfileListItemDto(dto) {
  return mapProfileDto(dto);
}

export function mapProfileSearchResult(response) {
  return mapPagedResponse(response).items.map((item) => ({
    userId: pick(item, 'userId', 'UserId'),
    firstName: pick(item, 'firstName', 'FirstName'),
    lastName: pick(item, 'lastName', 'LastName'),
    secondName: pick(item, 'lastName', 'LastName'),
    displayName: pick(item, 'displayName', 'DisplayName') || getDisplayName({ user: item }),
    headline: pick(item, 'headline', 'Headline'),
    location: pick(item, 'location', 'Location'),
    avatarUrl: pick(item, 'avatarUrl', 'AvatarUrl'),
    headerUrl: pick(item, 'headerUrl', 'HeaderUrl'),
  }));
}

export function mapProfileToUpdateRequest(formState = {}) {
  const request = {};

  if (formState.firstName != null) request.firstName = formState.firstName;
  if (formState.lastName != null) request.lastName = formState.lastName;
  if (formState.secondName != null) request.lastName = formState.secondName;
  if (formState.profileTitle != null) request.profileTitle = formState.profileTitle;
  if (formState.headline != null) request.headline = formState.headline;
  if (formState.about != null) request.genInfo = formState.about;
  if (formState.genInfo != null) request.genInfo = formState.genInfo;
  if (formState.university != null) request.university = formState.university;
  if (formState.location != null) request.location = formState.location;
  if (formState.portfolioUrl != null) request.portfolioUrl = formState.portfolioUrl;
  if (formState.isCompany != null) request.isCompany = formState.isCompany;

  return request;
}

export function extractProfileFromUploadResponse(response, accountEmail = null) {
  if (!response) return null;

  const profileDto =
    response.profile ??
    response.Profile ??
    response.data?.profile ??
    response.data?.Profile ??
    (response.success || response.Success ? response.profile ?? response.Profile : null);

  if (profileDto?.userId || profileDto?.UserId || profileDto?.firstName || profileDto?.FirstName) {
    return mapProfileDto(profileDto, accountEmail);
  }

  return null;
}

export function mapProfileAnalytics(views = [], postViews = 0) {
  const list = Array.isArray(views) ? views : [];
  return {
    profileViews: list.length,
    postViews: postViews ?? 0,
  };
}

export function mapProfileViewsResponse(response) {
  if (Array.isArray(response)) {
    return mapProfileAnalytics(response);
  }

  const items = response?.items ?? response?.Items ?? [];
  return mapProfileAnalytics(items);
}
