using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с рекомендованным навыком для должности
public record RecommendedSkillByPositionResult
{
    public bool Succeeded { get; init; }

    public RecommendedSkillByPositionDto? RecommendedSkillByPosition { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
