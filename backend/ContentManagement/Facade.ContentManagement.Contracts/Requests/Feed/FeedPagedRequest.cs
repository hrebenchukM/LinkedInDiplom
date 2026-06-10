using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.ContentManagement.Contracts.Requests.Feed;

public record FeedPagedRequest : PagedRequest
{
    [Range(1, 100)]
    public int? Limit { get; init; }

    public (int Page, int PageSize, int Skip) ResolvePaging()
    {
        if (Limit is > 0)
        {
            if (Page != Pagination.DefaultPage || PageSize != Pagination.DefaultPageSize)
            {
                return Pagination.Normalize(this);
            }

            var pageSize = Math.Min(Limit.Value, Pagination.MaxPageSize);
            return (Pagination.DefaultPage, pageSize, 0);
        }

        return Pagination.Normalize(this);
    }
}
