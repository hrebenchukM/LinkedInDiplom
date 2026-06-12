/** Normalize Facade `PagedResponse<T>` (camelCase or PascalCase). */
export function unwrapPagedResponse(data, mapItem = (item) => item) {
  const itemsRaw = Array.isArray(data) ? data : data?.items || data?.Items || [];
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(mapItem).filter((item) => item != null) : [];

  const page = Number(data?.page ?? data?.Page ?? 1) || 1;
  const pageSize = Number(data?.pageSize ?? data?.PageSize ?? items.length) || items.length;
  const totalCount = Number(data?.totalCount ?? data?.TotalCount ?? items.length) || 0;
  const totalPages = Number(data?.totalPages ?? data?.TotalPages ?? 0) || 0;

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: Boolean(data?.hasNextPage ?? data?.HasNextPage),
    hasPreviousPage: Boolean(data?.hasPreviousPage ?? data?.HasPreviousPage),
  };
}

export const EMPTY_PAGED = {
  items: [],
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

/** Shorthand when only the item list is needed (arrays and PagedResponse). */
export function unwrapPagedItems(data, mapItem = (item) => item) {
  return unwrapPagedResponse(data, mapItem).items;
}
