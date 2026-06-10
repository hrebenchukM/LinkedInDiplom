namespace Content.Contracts.Parameters.Post;

public record GetAdminPostsParameters
{
    public int Skip { get; init; }

    public int Take { get; init; }

    public string? AuthorId { get; init; }

    public bool? IsDeleted { get; init; }

    public bool? IncludeDeleted { get; init; }

    public string? Search { get; init; }

    public DateTime? CreatedFrom { get; init; }

    public DateTime? CreatedTo { get; init; }

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; }
}
