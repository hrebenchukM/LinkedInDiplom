using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.ProfileManagement.Contracts.Requests;

public record ProfileSearchQueryRequest : PagedRequest
{
    [StringLength(200)]
    public string? Query { get; init; }

    [StringLength(200)]
    public string? Location { get; init; }
}
