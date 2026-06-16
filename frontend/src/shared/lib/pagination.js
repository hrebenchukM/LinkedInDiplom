import { DEFAULT_PAGE_SIZE } from '../api/config.js';
import { normalizeSortDirection, shouldSkipQueryValue } from '../api/sortParams.js';

export function getEmptyPagedResponse(pageSize = DEFAULT_PAGE_SIZE) {
  return {
    items: [],
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function isPagedShape(value) {
  const items = value?.items ?? value?.Items;
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Array.isArray(items)
  );
}

/**
 * Normalize backend PagedResponse<T> or plain array into a consistent shape.
 */
export function mapPagedResponse(response, fallbackPageSize = DEFAULT_PAGE_SIZE) {
  if (Array.isArray(response)) {
    return {
      items: response,
      page: 1,
      pageSize: response.length || fallbackPageSize,
      totalCount: response.length,
      totalPages: response.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  const items = response?.items ?? response?.Items;

  if (!isPagedShape(response)) {
    return getEmptyPagedResponse(fallbackPageSize);
  }

  return {
    items,
    page: response.page ?? response.Page ?? 1,
    pageSize: response.pageSize ?? response.PageSize ?? fallbackPageSize,
    totalCount: response.totalCount ?? response.TotalCount ?? items.length,
    totalPages: response.totalPages ?? response.TotalPages ?? 0,
    hasNextPage: Boolean(response.hasNextPage ?? response.HasNextPage),
    hasPreviousPage: Boolean(response.hasPreviousPage ?? response.HasPreviousPage),
  };
}

function appendQueryParam(params, key, value) {
  if (shouldSkipQueryValue(value)) {
    return;
  }

  if (Array.isArray(value)) {
    value
      .filter((item) => !shouldSkipQueryValue(item))
      .forEach((item) => params.append(key, String(item)));
    return;
  }

  params.append(key, String(value));
}

/**
 * Build URLSearchParams from common pagination/filter fields.
 * Unknown extra keys are ignored unless passed via `extra`.
 */
export function buildPaginationQuery({
  page,
  pageSize,
  limit,
  search,
  query,
  sortBy,
  sortDirection,
  extra = {},
} = {}) {
  const params = new URLSearchParams();

  appendQueryParam(params, 'page', page);
  appendQueryParam(params, 'pageSize', pageSize ?? limit);
  appendQueryParam(params, 'search', search ?? query);

  const normalizedSortBy = sortBy == null || sortBy === '' ? undefined : String(sortBy);
  const normalizedSortDirection = normalizeSortDirection(sortDirection);

  appendQueryParam(params, 'sortBy', normalizedSortBy);
  if (normalizedSortBy && normalizedSortDirection) {
    appendQueryParam(params, 'sortDirection', normalizedSortDirection);
  }

  Object.entries(extra).forEach(([key, value]) => {
    appendQueryParam(params, key, value);
  });

  return params;
}
