namespace Content.Contracts.Parameters.Comment;

public record GetAdminCommentsParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public Guid? PostId { get; init; }

    public string? AuthorUserId { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    public string? Query { get; init; }

    public DateTime? FromCreatedAt { get; init; }

    public DateTime? ToCreatedAt { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
