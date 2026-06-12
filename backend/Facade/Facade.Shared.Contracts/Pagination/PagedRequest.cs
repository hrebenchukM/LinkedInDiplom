using System.ComponentModel.DataAnnotations;

namespace Facade.Shared.Contracts.Pagination;

public record PagedRequest
{
    [Range(1, int.MaxValue)]
    public int Page { get; init; } = 1;

    [Range(1, 100)]
    public int PageSize { get; init; } = 20;
}
