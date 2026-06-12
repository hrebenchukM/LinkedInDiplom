using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.AdminManagement.Contracts.Requests;

public record AdminUsersQueryRequest : PagedRequest
{
    [StringLength(256)]
    public string? Email { get; init; }

    [StringLength(256)]
    public string? Role { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IsLocked { get; init; }

    [AllowedValues("createdAt", "email", "userName", "updatedAt")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
