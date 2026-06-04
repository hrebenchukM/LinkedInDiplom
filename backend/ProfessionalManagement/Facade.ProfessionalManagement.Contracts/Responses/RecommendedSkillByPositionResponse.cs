using Facade.ProfessionalManagement.Contracts.DTOs;

namespace Facade.ProfessionalManagement.Contracts.Responses;

// Ответ операций с рекомендованным навыком для должности
public record RecommendedSkillByPositionResponse
{
    public bool Success { get; init; }

    public RecommendedSkillByPositionDto? RecommendedSkillByPosition { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
