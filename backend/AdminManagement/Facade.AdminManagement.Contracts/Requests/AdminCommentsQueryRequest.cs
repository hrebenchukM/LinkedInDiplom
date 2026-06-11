using System.ComponentModel.DataAnnotations;
using Facade.Shared.Contracts.Pagination;

namespace Facade.AdminManagement.Contracts.Requests;

public record AdminCommentsQueryRequest : PagedRequest
{
    public Guid? PostId { get; init; }

    [StringLength(450)]
    public string? AuthorUserId { get; init; }

    [StringLength(200)]
    public string? Query { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    public DateTime? FromCreatedAt { get; init; }

    public DateTime? ToCreatedAt { get; init; }

    [AllowedValues("createdAt", "updatedAt", "deletedAt", "authorUserId", "postId")]
    public string? SortBy { get; init; }

    [AllowedValues("asc", "desc")]
    public string? SortDirection { get; init; }
}
