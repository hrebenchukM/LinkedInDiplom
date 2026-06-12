namespace Facade.Shared.Contracts.Pagination;

public static class Pagination
{
    public const int DefaultPage = 1;
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public static (int Page, int PageSize, int Skip) Normalize(PagedRequest? request)
    {
        var page = request?.Page > 0 ? request.Page : DefaultPage;
        var pageSize = request?.PageSize > 0 ? request.PageSize : DefaultPageSize;

        if (pageSize > MaxPageSize)
        {
            pageSize = MaxPageSize;
        }

        var skip = (page - 1) * pageSize;
        return (page, pageSize, skip);
    }

    public static PagedResponse<T> Create<T>(
        IReadOnlyList<T> items,
        int page,
        int pageSize,
        int totalCount)
    {
        var totalPages = pageSize <= 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResponse<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };
    }
}
