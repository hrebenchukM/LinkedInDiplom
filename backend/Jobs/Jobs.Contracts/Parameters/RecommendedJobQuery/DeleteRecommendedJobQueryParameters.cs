namespace Jobs.Contracts.Parameters.RecommendedJobQuery;

public record DeleteRecommendedJobQueryParameters
{
    public string UserId { get; init; } = default!;
    public Guid RecommendedQueryId { get; init; }
}
