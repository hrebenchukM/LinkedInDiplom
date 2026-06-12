using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с рекомендацией
public record RecommendationResult
{
    public bool Succeeded { get; init; }

    public RecommendationDto? Recommendation { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
