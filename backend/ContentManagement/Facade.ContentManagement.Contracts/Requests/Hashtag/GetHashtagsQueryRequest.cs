using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.ContentManagement.Contracts.Requests.Hashtag;

public record GetHashtagsQueryRequest : PagedRequest
{
    [StringLength(200)]
    public string? Search { get; init; }

    [AllowedValues("name", "createdAt", "updatedAt")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
