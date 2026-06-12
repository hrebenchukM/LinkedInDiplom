namespace Jobs.Contracts.Parameters.JobSearchResult;

public record GetJobSearchResultsParameters
{
    public string UserId { get; init; } = default!;
    public Guid SearchId { get; init; }
}
