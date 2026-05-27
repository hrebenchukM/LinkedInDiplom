namespace Jobs.Contracts.Parameters.JobSearchQuery;

public record DeleteJobSearchQueryParameters
{
    public string UserId { get; init; } = default!;
    public Guid SearchId { get; init; }
}
