namespace Jobs.Contracts.Parameters.RecommendedJobQuery;

public record GetRecommendedJobQueriesParameters
{
    public string UserId { get; init; } = default!;
}
