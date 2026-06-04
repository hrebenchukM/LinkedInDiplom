namespace Professional.Contracts.Parameters.Recommendation;

// Параметры для создания рекомендации (AuthorId из JWT, не из body)
public record CreateRecommendationParameters
{
    public string AuthorId { get; init; } = default!;

    // Получатель рекомендации
    public string UserId { get; init; } = default!;

    public string Text { get; init; } = default!;
}
