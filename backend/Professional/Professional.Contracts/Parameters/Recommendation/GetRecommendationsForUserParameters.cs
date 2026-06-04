namespace Professional.Contracts.Parameters.Recommendation;

// Параметры для получения рекомендаций получателя (публичный список на профиле)
public record GetRecommendationsForUserParameters
{
    public string UserId { get; init; } = default!;
}
