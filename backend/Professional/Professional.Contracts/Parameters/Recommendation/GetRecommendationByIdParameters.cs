namespace Professional.Contracts.Parameters.Recommendation;

// Параметры для получения одной рекомендации по Id
public record GetRecommendationByIdParameters
{
    public Guid RecommendationId { get; init; }
}
