using Professional.Contracts.DTOs;

namespace Professional.Contracts.Results;

// Результат операции с навыком пользователя
public record UserSkillResult
{
    public bool Succeeded { get; init; }

    public UserSkillDto? UserSkill { get; init; }

    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
