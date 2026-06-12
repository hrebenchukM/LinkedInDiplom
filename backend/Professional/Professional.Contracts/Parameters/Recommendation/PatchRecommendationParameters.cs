namespace Professional.Contracts.Parameters.Recommendation;

// Параметры для частичного обновления рекомендации (только Text; AuthorId из JWT)
public record PatchRecommendationParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid RecommendationId { get; init; }

    public string Text { get; init; } = default!;
}
