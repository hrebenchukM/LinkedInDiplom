using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с навыком в справочнике
public record SkillResult
{
    public bool Succeeded { get; init; }

    public SkillDto? Skill { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
