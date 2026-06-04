namespace Professional.Contracts.Parameters.Recommendation;

// Параметры для soft delete рекомендации (AuthorId из JWT)
public record DeleteRecommendationParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid RecommendationId { get; init; }
}
