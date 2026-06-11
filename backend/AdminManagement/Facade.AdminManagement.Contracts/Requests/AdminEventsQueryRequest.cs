using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.AdminManagement.Contracts.Requests;

public record AdminEventsQueryRequest : PagedRequest
{
    [StringLength(500)]
    public string? Query { get; init; }

    [StringLength(450)]
    public string? OrganizerUserId { get; init; }

    public DateTime? FromStartAt { get; init; }

    public DateTime? ToStartAt { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    [StringLength(500)]
    public string? Location { get; init; }

    public bool? IsOnline { get; init; }

    [AllowedValues("createdAt", "startAt", "title", "attendeeCount", "deletedAt", "updatedAt")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
