namespace Jobs.Contracts.Parameters.JobSearchQuery;

public record GetJobSearchQueryByIdParameters
{
    public string UserId { get; init; } = default!;
    public Guid SearchId { get; init; }
}
