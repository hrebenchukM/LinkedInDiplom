const SKIP_UI_FILTER_VALUES = new Set(['all', 'any']);

export const SORT_DIRECTIONS = ['asc', 'desc'];

export const NETWORK_CONTACT_STATUS = [
  'pending',
  'accepted',
  'rejected',
  'cancelled',
];

export const NETWORK_CONTACT_DIRECTION = [
  'incoming',
  'outgoing',
  'accepted',
  'all',
];

export const NETWORK_CONTACT_SORT_BY = [
  'requestedAt',
  'respondedAt',
  'statusChangedAt',
  'status',
];

/** Backend requires these defaults for GET /api/network/me/contacts (AllowedValues on null fails). */
export const DEFAULT_CONTACTS_QUERY = {
  status: 'accepted',
  direction: 'all',
  sortBy: 'requestedAt',
  sortDirection: 'desc',
};

/** Backend requires sort params for GET /api/jobs/vacancies. */
export const DEFAULT_VACANCY_QUERY = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

/** Backend requires sort params for GET /api/professional/skills. */
export const DEFAULT_SKILL_CATALOG_QUERY = {
  sortBy: 'name',
  sortDirection: 'asc',
};

export const VACANCY_SORT_BY = [
  'createdAt',
  'title',
  'companyId',
  'location',
  'updatedAt',
];

export const SKILL_CATALOG_SORT_BY = ['name', 'createdAt', 'updatedAt'];

const VACANCY_SORT_BY_UI_MAP = {
  newest: 'createdAt',
  updated: 'updatedAt',
  title: 'title',
  location: 'location',
  company: 'companyId',
  companyId: 'companyId',
  createdAt: 'createdAt',
};

export function shouldSkipQueryValue(value) {
  return value == null || value === '';
}

export function shouldSkipUiFilterValue(value) {
  if (shouldSkipQueryValue(value)) return true;
  if (typeof value === 'string' && SKIP_UI_FILTER_VALUES.has(value.toLowerCase())) {
    return true;
  }
  return false;
}

export function normalizeSortDirection(value) {
  if (shouldSkipQueryValue(value)) return undefined;
  const normalized = String(value).toLowerCase();
  return SORT_DIRECTIONS.includes(normalized) ? normalized : undefined;
}

export function pickAllowedValue(value, allowedValues = []) {
  if (shouldSkipQueryValue(value)) return undefined;
  const normalized = String(value).toLowerCase();
  const match = allowedValues.find((item) => item.toLowerCase() === normalized);
  return match ?? undefined;
}

export function mapVacancySortBy(value) {
  if (shouldSkipUiFilterValue(value)) return undefined;
  const key = String(value);
  const mapped = VACANCY_SORT_BY_UI_MAP[key] ?? VACANCY_SORT_BY_UI_MAP[key.toLowerCase()];
  if (mapped) return mapped;
  return pickAllowedValue(key, VACANCY_SORT_BY);
}

export function buildAllowedSortQuery({
  sortBy,
  sortDirection,
  allowedSortBy = [],
} = {}) {
  const normalizedSortBy = pickAllowedValue(sortBy, allowedSortBy);
  const normalizedSortDirection = normalizeSortDirection(sortDirection);

  const query = {};

  if (normalizedSortBy) {
    query.sortBy = normalizedSortBy;
  }

  if (normalizedSortBy && normalizedSortDirection) {
    query.sortDirection = normalizedSortDirection;
  }

  return query;
}
