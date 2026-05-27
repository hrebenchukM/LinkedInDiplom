namespace Jobs.Contracts.Parameters.JobSearchQuery;

public record CreateJobSearchQueryParameters
{
    public string UserId { get; init; } = default!;
    public string? Query { get; init; }
    public string? Location { get; init; }
    public int? Radius { get; init; }
}
