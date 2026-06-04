namespace Jobs.Contracts.Parameters.JobSearchQuery;

public record GetMyJobSearchQueriesParameters
{
    public string UserId { get; init; } = default!;
}
