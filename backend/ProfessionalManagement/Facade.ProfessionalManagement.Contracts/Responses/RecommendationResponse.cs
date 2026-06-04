using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с рекомендацией
public record RecommendationResponse
{
    public bool Success { get; init; }

    public RecommendationDto? Recommendation { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
