namespace Jobs.Contracts.Parameters.RecommendedJobQuery;

public record CreateRecommendedJobQueryParameters
{
    public string UserId { get; init; } = default!;
    public string Query { get; init; } = default!;
}
